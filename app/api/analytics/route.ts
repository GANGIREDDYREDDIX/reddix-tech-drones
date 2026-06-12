import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: true }); // Ascending for chart chronological order

    if (ordersError) throw ordersError;

    // Fetch low stock products
    const { data: lowStockProducts, error: productsError } = await supabase
      .from('products')
      .select('name, "stockQuantity"')
      .lt('stockQuantity', 5)
      .order('stockQuantity', { ascending: true })
      .limit(5);

    if (productsError) throw productsError;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let activeOrders = 0;

    // Build the base dense array for chart
    let chartDataMap: Record<string, number> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysToSubtract = 6; // default 7d
    if (range === '30d') daysToSubtract = 29;
    else if (range === '1y') daysToSubtract = 364; // Or we can group by month, but let's keep it daily for simplicity if the scale isn't too large, or group by month for '1y'.
    
    if (range === '1y') {
      // Group by month
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const dateKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        chartDataMap[dateKey] = 0;
      }
    } else {
      // Group by day
      for (let i = daysToSubtract; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
        chartDataMap[dateKey] = 0;
      }
    }

    orders.forEach((order: any) => {
      if (order.status !== 'Cancelled') {
        totalRevenue += order.total;
      }
      if (order.status === 'Processing' || order.status === 'Shipped') {
        activeOrders++;
      }

      // Populate chart data
      if (order.status !== 'Cancelled') {
        const orderDate = new Date(order.date);
        let key = '';
        if (range === '1y') {
          key = orderDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        } else {
          key = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getDate()}`;
        }
        
        if (chartDataMap[key] !== undefined) {
          chartDataMap[key] += order.total;
        }
      }
    });

    // Convert object map into array
    const chartData = Object.keys(chartDataMap).map(key => ({
      name: key,
      revenue: chartDataMap[key]
    }));

    // Get 3 most recent orders for the dashboard list
    // Re-sort descending just for this specific variable
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map(o => ({
        id: o.id,
        customer: o.customer?.name || "Guest",
        status: o.status,
        amount: o.total
      }));

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders,
        activeOrders
      },
      chartData,
      recentOrders,
      lowStock: lowStockProducts.map(p => ({ name: p.name, qty: p.stockQuantity }))
    });
  } catch (error) {
    console.error('Failed to read analytics:', error);
    return NextResponse.json({ error: 'Failed to read analytics' }, { status: 500 });
  }
}
