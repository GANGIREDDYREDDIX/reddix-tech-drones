import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
      ? process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
      : ['chintureddy6165@gmail.com', 'reddix.lpu@gmail.com', 'yashkansal321@gmail.com', 'iamsiddhartha9@gmail.com'];
    const isAdmin = user?.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('joined_date', { ascending: false });

    if (error) throw error;
    
    // Fetch all orders to dynamically calculate metrics
    const { data: orders } = await supabase.from('orders').select('*');
    
    const enhancedCustomers = customers?.map(customer => {
      const customerOrders = orders?.filter(o => o.customer && o.customer.email === customer.email) || [];
      const realTotalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const hasRealOrders = customerOrders.length > 0;
      
      return {
        ...customer,
        total_spent: hasRealOrders ? realTotalSpent : customer.total_spent,
        total_orders: hasRealOrders ? customerOrders.length : customer.total_orders,
      };
    });

    return NextResponse.json(enhancedCustomers || []);
  } catch (error) {
    console.error('Failed to read customers:', error);
    return NextResponse.json({ error: 'Failed to read customers' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || !user.email) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - not logged in' }, { status: 401 });
    }

    const payload = await request.json();

    // Only include fields that were actually sent
    const updates: Record<string, any> = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.phone !== undefined) updates.phone = payload.phone;
    if (payload.currency !== undefined) updates.currency = payload.currency;
    if (payload.language !== undefined) updates.language = payload.language;
    if (payload.email_orders !== undefined) updates.email_orders = payload.email_orders;
    if (payload.email_offers !== undefined) updates.email_offers = payload.email_offers;
    if (payload.status !== undefined) updates.status = payload.status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'Nothing to update' });
    }

    // Admin override: if payload.id is provided, update that specific record
    if (payload.id) {
      const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
        ? process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
        : ['chintureddy6165@gmail.com', 'reddix.lpu@gmail.com', 'yashkansal321@gmail.com', 'iamsiddhartha9@gmail.com'];
      const isAdmin = user?.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized. Admin session required to update other customers.' }, { status: 401 });
      }

      if (payload.status !== undefined) updates.status = payload.status;
      
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', payload.id)
        .select()
        .maybeSingle();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    // First check if a customer row exists for this user
    const { data: existingRows, error: fetchError } = await supabase
      .from('customers')
      .select('id, email')
      .eq('email', user.email)
      .order('joined_date', { ascending: false });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let result;

    if (!existingRows || existingRows.length === 0) {
      // No row exists — create it
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert({
          id: `CUST-${Date.now()}`,
          email: user.email,
          name: updates.name || user.user_metadata?.full_name || 'User',
          ...updates,
          status: 'Active',
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      result = data;
    } else {
      // Use the first (most recent) row's id to avoid duplicate ambiguity
      const primaryId = existingRows[0].id;
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', primaryId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      result = data;
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Unexpected error updating customer:', error);
    return NextResponse.json({ error: error?.message || 'Unexpected server error' }, { status: 500 });
  }
}
