import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('customer_email', user.email)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to read user support tickets:', error);
    return NextResponse.json({ error: 'Failed to read support tickets' }, { status: 500 });
  }
}
