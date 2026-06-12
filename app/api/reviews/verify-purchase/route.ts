import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) return NextResponse.json({ canReview: false });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ canReview: false, error: 'Not logged in' }, { status: 401 });
    }

    // Get all 'Delivered' orders
    const { data: orders } = await supabase
      .from('orders')
      .select('items, customer')
      .eq('status', 'Delivered');

    if (!orders) return NextResponse.json({ canReview: false });

    // Filter to the current user's delivered orders
    const myDeliveredOrders = orders.filter(o => o.customer?.email === user.email);

    let hasPurchased = false;
    for (const order of myDeliveredOrders) {
      if (Array.isArray(order.items)) {
        if (order.items.some((item: any) => item.id === productId)) {
          hasPurchased = true;
          break;
        }
      }
    }

    const customerName = user.user_metadata?.full_name || user.email.split('@')[0];

    return NextResponse.json({ 
      canReview: hasPurchased, 
      customerName 
    });

  } catch (error) {
    console.error("Verify purchase error", error);
    return NextResponse.json({ canReview: false }, { status: 500 });
  }
}
