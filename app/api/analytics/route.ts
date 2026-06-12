import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: true });

    if (ordersError) throw ordersError;

    // Fetch low stock products
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('name, "stockQuantity"')
      .lt('stockQuantity', 5)
      .order('stockQuantity', { ascending: true })
      .limit(5);

    // ─── KPI Calculations ───────────────────────────────────────────
    let totalRevenue = 0;
    let totalOrders = (orders || []).length;
    let activeOrders = 0;

    for (const o of (orders || [])) {
      if (o.status !== 'Cancelled') totalRevenue += Number(o.total) || 0;
      if (o.status === 'Processing' || o.status === 'Shipped') activeOrders++;
    }

    // ─── Chart Buckets ──────────────────────────────────────────────
    // Use UTC dates consistently so server locale never causes a mismatch
    const nowUTC = new Date();
    nowUTC.setUTCHours(0, 0, 0, 0);

    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Build ordered array of buckets
    type Bucket = { name: string; revenue: number; key: string };
    const buckets: Bucket[] = [];

    if (range === '1y') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth() - i, 1));
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        const name = `${MONTH_SHORT[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(-2)}`;
        buckets.push({ name, revenue: 0, key });
      }
    } else {
      // Daily: 7d = 7 days, 30d = 30 days
      const days = range === '30d' ? 29 : 6;
      for (let i = days; i >= 0; i--) {
        const d = new Date(nowUTC);
        d.setUTCDate(nowUTC.getUTCDate() - i);
        // key = YYYY-MM-DD
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        const name = `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
        buckets.push({ name, revenue: 0, key });
      }
    }

    // Map for O(1) lookup
    const bucketMap: Record<string, Bucket> = {};
    for (const b of buckets) bucketMap[b.key] = b;

    // Aggregate orders into buckets
    for (const order of (orders || [])) {
      if (order.status === 'Cancelled') continue;
      const d = new Date(order.date);
      let key: string;
      if (range === '1y') {
        key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      }
      if (bucketMap[key]) {
        bucketMap[key].revenue += Number(order.total) || 0;
      }
    }

    const chartData = buckets.map(b => ({ name: b.name, revenue: b.revenue }));

    // ─── Recent Orders ───────────────────────────────────────────────
    const recentOrders = [...(orders || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        customer: o.customer?.name || 'Guest',
        status: o.status,
        amount: Number(o.total) || 0
      }));

    return NextResponse.json({
      kpis: { totalRevenue, totalOrders, activeOrders },
      chartData,
      recentOrders,
      lowStock: (lowStockProducts || []).map((p: any) => ({ name: p.name, qty: p.stockQuantity }))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
