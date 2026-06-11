import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const notifications: any[] = [];

    // 1. Pending Orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, customer, date')
      .eq('status', 'Pending')
      .limit(5);

    if (orders) {
      orders.forEach(o => {
        notifications.push({
          id: `ord-${o.id}`,
          type: 'order',
          title: `New Order: ${o.id}`,
          message: `Pending order from ${o.customer}`,
          date: o.date,
          href: `/admin/orders/${o.id}`
        });
      });
    }

    // 2. Open Support Tickets
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('id, customer_name, subject, date')
      .eq('status', 'Open')
      .limit(5);

    if (tickets) {
      tickets.forEach(t => {
        notifications.push({
          id: `tkt-${t.id}`,
          type: 'ticket',
          title: `Open Ticket: ${t.id}`,
          message: `${t.customer_name}: ${t.subject}`,
          date: t.date,
          href: `/admin/support`
        });
      });
    }

    // 3. Pending Price Requests
    const { data: requests } = await supabase
      .from('price_requests')
      .select('id, customer_name, product, date')
      .eq('status', 'Pending')
      .limit(5);

    if (requests) {
      requests.forEach(r => {
        notifications.push({
          id: `req-${r.id}`,
          type: 'price_request',
          title: `Price Request: ${r.product}`,
          message: `Pending request from ${r.customer_name}`,
          date: r.date,
          href: `/admin/price-requests`
        });
      });
    }

    // Sort by date descending
    notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
