import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const dummyOrders = [
      {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        customer: {
          name: 'Tech Corp',
          email: 'procurement@techcorp.io',
          points_earned: 100,
          points_redeemed: 0,
        },
        date: new Date(Date.now() - 1000000000).toISOString(),
        status: 'Delivered',
        total: 10000,
        items: []
      },
      {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        customer: {
          name: 'Tech Corp',
          email: 'procurement@techcorp.io',
          points_earned: 200,
          points_redeemed: 0,
        },
        date: new Date().toISOString(),
        status: 'Delivered',
        total: 22994,
        items: []
      }
    ];

    for (const order of dummyOrders) {
      const { error } = await supabase.from('orders').insert(order);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: "Orders seeded for Tech Corp" });
  } catch (error: any) {
    console.error('Failed to seed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
