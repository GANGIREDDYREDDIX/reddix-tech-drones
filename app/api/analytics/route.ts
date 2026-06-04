import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'orders.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(fileData);
    
    let totalRevenue = 0;
    let totalOrders = db.orders.length;
    let activeOrders = 0;

    // Aggregate revenue by date for the chart
    const revenueByDate: Record<string, number> = {};

    db.orders.forEach((order: any) => {
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
    })).reverse(); // Assuming orders are newest first in JSON, reverse to get chronological

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders,
        activeOrders
      },
      chartData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read analytics' }, { status: 500 });
  }
}
