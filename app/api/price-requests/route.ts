import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: requests, error } = await supabase
      .from('price_requests')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Failed to read price requests:', error);
    return NextResponse.json({ error: 'Failed to read price requests' }, { status: 500 });
  }
}
