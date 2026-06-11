import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('joined_date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to read customers:', error);
    return NextResponse.json({ error: 'Failed to read customers' }, { status: 500 });
  }
}
