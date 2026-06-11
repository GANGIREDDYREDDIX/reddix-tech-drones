import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to read support tickets:', error);
    return NextResponse.json({ error: 'Failed to read support tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message } = await request.json();

    const newTicket = {
      id: `TKT-${Math.floor(Math.random() * 100000)}`,
      customer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
      customer_email: user.email,
      subject: subject,
      status: 'Open',
      date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('support_tickets')
      .insert(newTicket)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
