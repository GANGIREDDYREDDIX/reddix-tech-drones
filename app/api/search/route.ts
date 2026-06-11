import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();
    const results: any[] = [];
    const searchTerm = `%${q}%`;

    // 1. Search Products
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .or(`name.ilike.${searchTerm},id.ilike.${searchTerm}`)
      .limit(3);

    if (products) {
      products.forEach(p => {
        results.push({
          id: p.id,
          type: 'Product',
          title: p.name,
          subtitle: `ID: ${p.id}`,
          href: `/admin/products`
        });
      });
    }

    // 2. Search Orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, customer')
      .or(`id.ilike.${searchTerm},customer.ilike.${searchTerm}`)
      .limit(3);

    if (orders) {
      orders.forEach(o => {
        results.push({
          id: o.id,
          type: 'Order',
          title: o.id,
          subtitle: `Customer: ${o.customer}`,
          href: `/admin/orders/${o.id}`
        });
      });
    }

    // 3. Search Customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, email')
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},id.ilike.${searchTerm}`)
      .limit(3);

    if (customers) {
      customers.forEach(c => {
        results.push({
          id: c.id,
          type: 'Customer',
          title: c.name,
          subtitle: c.email,
          href: `/admin/customers`
        });
      });
    }

    // 4. Search Tickets
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('id, subject, customer_name')
      .or(`subject.ilike.${searchTerm},id.ilike.${searchTerm},customer_name.ilike.${searchTerm}`)
      .limit(3);

    if (tickets) {
      tickets.forEach(t => {
        results.push({
          id: t.id,
          type: 'Ticket',
          title: t.subject,
          subtitle: `From: ${t.customer_name}`,
          href: `/admin/support`
        });
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
