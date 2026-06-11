import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('joined_date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to read customers:', error);
    return NextResponse.json({ error: 'Failed to read customers' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();

    const updates: any = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.phone !== undefined) updates.phone = payload.phone;
    if (payload.currency !== undefined) updates.currency = payload.currency;
    if (payload.language !== undefined) updates.language = payload.language;
    if (payload.email_orders !== undefined) updates.email_orders = payload.email_orders;
    if (payload.email_offers !== undefined) updates.email_offers = payload.email_offers;

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('email', user.email)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer profile' }, { status: 500 });
  }
}
