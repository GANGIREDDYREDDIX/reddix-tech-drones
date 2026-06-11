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

    const { items, total } = await request.json();

    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      customer: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
      customer_email: user.email,
      date: new Date().toISOString(),
      status: 'Pending',
      total: total,
      items: items.length
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) throw error;
    
    // Reward Points calculation
    try {
      const { data: config } = await supabase.from('rewards_config').select('*').eq('id', 'default').single();
      const multiplier = config ? config.purchases_multiplier : 1;
      const pointsToAdd = Math.floor(total / 100) * multiplier;
      
      if (pointsToAdd > 0) {
        const { data: customer } = await supabase.from('customers').select('points_issued').eq('email', user.email).single();
        if (customer) {
           await supabase.from('customers').update({ points_issued: (customer.points_issued || 0) + pointsToAdd }).eq('email', user.email);
        }
      }
    } catch(e) {
      console.error("Failed to add points", e);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
