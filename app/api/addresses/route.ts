import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: addresses, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(addresses || []);
  } catch (error) {
    console.error('Failed to read addresses:', error);
    return NextResponse.json({ error: 'Failed to read addresses' }, { status: 500 });
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

    const newAddress = {
      id: `ADDR-${Math.floor(Math.random() * 100000)}`,
      customer_email: user.email,
      type: payload.type || 'Shipping',
      street: payload.street,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      country: payload.country,
      is_default: payload.is_default || false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(newAddress)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
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
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', id)
      .eq('customer_email', user.email);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    const payload = await request.json();

    const updatedAddress = {
      type: payload.type || 'Shipping',
      street: payload.street,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      country: payload.country,
      is_default: payload.is_default || false,
    };

    const { data, error } = await supabase
      .from('customer_addresses')
      .update(updatedAddress)
      .eq('id', id)
      .eq('customer_email', user.email)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Failed to update address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}
