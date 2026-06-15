import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all discounts
    const { data: discounts, error } = await supabase
      .from('discounts')
      .select('*')
      .order('expiry', { ascending: false });

    if (error) throw error;

    // Fetch all orders to find who used each code
    const { data: orders } = await supabase
      .from('orders')
      .select('id, date, total, status, customer')
      .order('date', { ascending: false });

    // Build a map: discountCode → list of orders that used it
    const usageMap: Record<string, {
      orderId: string;
      customerName: string;
      customerEmail: string;
      orderDate: string;
      orderTotal: number;
      orderStatus: string;
      discountAmount: number;
    }[]> = {};

    for (const order of (orders || [])) {
      const code = order.customer?.discount_code;
      if (!code) continue;
      if (!usageMap[code]) usageMap[code] = [];
      usageMap[code].push({
        orderId: order.id,
        customerName: order.customer?.name || 'Unknown',
        customerEmail: order.customer?.email || '',
        orderDate: order.date,
        orderTotal: order.total,
        orderStatus: order.status,
        discountAmount: order.customer?.discount_amount || 0,
      });
    }

    // Attach claimers to each discount
    const enriched = (discounts || []).map((d: any) => ({
      ...d,
      claimers: usageMap[d.code] || [],
      realUsageCount: (usageMap[d.code] || []).length,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Failed to read discounts:', error);
    return NextResponse.json({ error: 'Failed to read discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDiscount = await request.json();
    const supabase = await createClient();

    const id = `DISC-${Date.now()}`;
    const { data, error } = await supabase
      .from('discounts')
      .insert({
        id,
        code: newDiscount.code.toUpperCase(),
        type: newDiscount.type,
        value: newDiscount.value,
        status: 'Active',
        usageCount: 0,
        expiry: newDiscount.expiry || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create discount:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}
