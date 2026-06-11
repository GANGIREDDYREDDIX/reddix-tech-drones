import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: requests, error } = await supabase
      .from('price_requests')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Failed to read price requests:', error);
    return NextResponse.json({ error: 'Failed to read price requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();

    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 100000)}`,
      customer_email: user.email,
      product_id: payload.product_id,
      quantity: payload.quantity || 1,
      requested_price: payload.requested_price,
      status: 'Pending',
      date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('price_requests')
      .insert(newRequest)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create price request:', error);
    return NextResponse.json({ error: 'Failed to create price request' }, { status: 500 });
  }
}
