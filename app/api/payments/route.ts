import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: payments, error } = await supabase
      .from('customer_payments')
      .select('*')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(payments || []);
  } catch (error) {
    console.error('Failed to read payment methods:', error);
    return NextResponse.json({ error: 'Failed to read payment methods' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();

    const newPayment = {
      id: `PAY-${Math.floor(Math.random() * 100000)}`,
      customer_email: user.email,
      type: payload.type || 'Visa',
      last4: payload.last4 || '4242',
      exp_month: payload.exp_month || '12',
      exp_year: payload.exp_year || '2028',
      is_default: payload.is_default || false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customer_payments')
      .insert(newPayment)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to add payment method:', error);
    return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('customer_payments')
      .delete()
      .eq('id', id)
      .eq('customer_email', user.email);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}
