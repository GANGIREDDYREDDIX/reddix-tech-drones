import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*');

    if (error) throw error;
    
    return NextResponse.json(carts);
  } catch (error) {
    console.error('Failed to read abandoned carts:', error);
    return NextResponse.json({ error: 'Failed to read abandoned carts' }, { status: 500 });
  }
}
