import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to read orders database:', error);
    return NextResponse.json({ error: 'Failed to read orders database' }, { status: 500 });
  }
}
