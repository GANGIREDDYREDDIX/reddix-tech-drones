import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
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

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let activeOrders = 0;

    // Aggregate revenue by date for the chart
    const revenueByDate: Record<string, number> = {};

    orders.forEach((order: any) => {
      // Calculate totals
      if (order.status !== 'Cancelled') {
        totalRevenue += order.total;
      }
      
      if (order.status === 'Processing' || order.status === 'Shipped') {
        activeOrders++;
      }

      // Format date for chart (e.g. "Oct 24")
      const dateObj = new Date(order.date);
      const dateKey = `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getDate()}`;
      
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      if (order.status !== 'Cancelled') {
        revenueByDate[dateKey] += order.total;
      }
    });

    // Convert object map into array for Recharts
    const chartData = Object.keys(revenueByDate).map(date => ({
      name: date,
      revenue: revenueByDate[date]
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
