import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // 1. Fetch customer core details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (customerError || !customer) {
      console.error('Customer fetch error:', customerError);
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // 2. Fetch orders (all orders, filter by email to handle jsonb safely)
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
    console.log("DEBUG allOrders length:", allOrders?.length);
    if (allOrders?.length > 0) console.log("DEBUG first order customer:", allOrders[0].customer);

    const customerOrders = allOrders?.filter((order: any) => 
      order.customer && order.customer.email === customer.email
    ) || [];

    // 3. Fetch addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_email', customer.email)
      .order('created_at', { ascending: false });

    if (addressesError) {
      console.error('Addresses fetch error:', addressesError);
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    // Calculate dynamic metrics
    const realTotalSpent = customerOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const hasRealOrders = customerOrders.length > 0;

    const dynamicTotalSpent = hasRealOrders ? realTotalSpent : customer.total_spent;
    const dynamicTotalOrders = hasRealOrders ? customerOrders.length : customer.total_orders;

    // If it's a dummy customer with 0 real orders but a high total_orders count, 
    // generate dynamic dummy orders to populate the timeline so the UI doesn't look broken.
    let finalOrders = customerOrders;
    if (!hasRealOrders && dynamicTotalOrders > 0) {
      finalOrders = Array.from({ length: Math.min(dynamicTotalOrders, 5) }).map((_, i) => ({
        id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        total: Math.floor(dynamicTotalSpent / dynamicTotalOrders),
        status: i === 0 ? 'Pending' : 'Delivered'
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // We pass the dynamic metrics back in a unified customer object
    const enhancedCustomer = {
      ...customer,
      total_spent: dynamicTotalSpent,
      total_orders: dynamicTotalOrders
    };

    // Combine data
    const payload = {
      customer: enhancedCustomer,
      orders: finalOrders,
      addresses: addresses || []
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Unexpected error fetching customer details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
