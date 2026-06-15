import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to read orders database:', error);
    return NextResponse.json({ error: 'Failed to read orders database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to place an order.' }, { status: 401 });
    }

    const { items: clientItems, redeemedPoints = 0, discountCode = null } = await request.json();

    // Fetch latest products from database to ensure dynamic, up-to-date pricing
    const { data: dbProducts, error: dbError } = await supabase.from('products').select('id, name, price, image');
    if (dbError) throw dbError;

    let dynamicTotal = 0;
    const finalItems = clientItems.map((clientItem: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === clientItem.id);
      const currentPrice = dbProduct ? dbProduct.price : clientItem.price; // Fallback if product deleted
      
      dynamicTotal += currentPrice * clientItem.quantity;
      
      return {
        ...clientItem,
        price: currentPrice,
        name: dbProduct ? dbProduct.name : clientItem.name // Keep name updated too
      };
    });

    // Handle point redemption
    let finalTotal = dynamicTotal;
    let validRedeemedPoints = 0;
    
    if (redeemedPoints > 0) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('points_issued, points_redeemed')
        .eq('email', user.email)
        .single();
        
      if (customerData) {
        const available = (customerData.points_issued || 0) - (customerData.points_redeemed || 0);
        if (redeemedPoints <= available) {
          // Max points they can redeem is limited by the cart total (1 point = 1 Rs)
          validRedeemedPoints = Math.min(redeemedPoints, Math.floor(dynamicTotal));
          const discount = validRedeemedPoints;
          finalTotal = Math.max(0, dynamicTotal - discount);
        }
      }
    }

    // Handle coupon discount code
    let couponDiscount = 0;
    let appliedDiscountCode: string | null = null;
    if (discountCode) {
      const { data: disc, error: discErr } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('status', 'Active')
        .single();
      if (!discErr && disc) {
        const now = new Date();
        const expiry = disc.expiry ? new Date(disc.expiry) : null;
        if (!expiry || expiry > now) {
          if (disc.type === 'percentage') {
            couponDiscount = Math.floor(finalTotal * (disc.value / 100));
          } else {
            couponDiscount = Math.min(disc.value, finalTotal);
          }
          finalTotal = Math.max(0, finalTotal - couponDiscount);
          appliedDiscountCode = disc.code;
          // Increment usage count
          await supabase
            .from('discounts')
            .update({ usageCount: (disc.usageCount || 0) + 1 })
            .eq('id', disc.id);
        }
      }
    }

    // We calculate points earned here, but only award them when status is Delivered
    let pointsToAdd = 0;
    try {
      const { data: config } = await supabase.from('rewards_config').select('purchases_multiplier').eq('id', 'default').single();
      const multiplier = config ? config.purchases_multiplier : 1;
      pointsToAdd = Math.floor(finalTotal / 100) * multiplier;
    } catch(e) {
      console.error("Failed to calculate points earned", e);
    }

    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      customer: {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
        email: user.email,
        points_earned: pointsToAdd,
        points_redeemed: validRedeemedPoints,
        points_awarded: false,
        points_refunded: false,
        discount_code: appliedDiscountCode,
        discount_amount: couponDiscount > 0 ? couponDiscount : undefined,
      },
      date: new Date().toISOString(),
      status: 'Pending',
      total: finalTotal,
      items: finalItems
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) throw error;
    
    // Automatically mark any pending abandoned carts for this user as 'Recovered'
    try {
      await supabase
        .from('abandoned_carts')
        .update({ 
          status: 'Recovered',
          last_updated: new Date().toISOString()
        })
        .eq('email', user.email)
        .neq('status', 'Recovered');
    } catch(e) {
      console.error("Failed to mark abandoned carts as recovered", e);
    }
    
    // Only deduct redeemed points here. Earned points are awarded via status update to Delivered.
    if (validRedeemedPoints > 0) {
      try {
        const { data: customer } = await supabase.from('customers').select('points_redeemed').eq('email', user.email).single();
        if (customer) {
           await supabase.from('customers')
             .update({ points_redeemed: (customer.points_redeemed || 0) + validRedeemedPoints })
             .eq('email', user.email);
        }
      } catch(e) {
        console.error("Failed to deduct redeemed points", e);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
