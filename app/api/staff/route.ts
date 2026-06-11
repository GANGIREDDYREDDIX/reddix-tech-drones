import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('last_login', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Failed to read staff:', error);
    return NextResponse.json({ error: 'Failed to read staff' }, { status: 500 });
  }
}
