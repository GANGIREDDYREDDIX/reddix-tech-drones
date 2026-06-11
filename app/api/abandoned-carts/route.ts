import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(carts || []);
  } catch (error) {
    console.error('Failed to read abandoned carts:', error);
    return NextResponse.json({ error: 'Failed to read abandoned carts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const payload = await request.json();

    if (!payload.id) {
      return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });
    }

    // Upsert: create or update existing cart record by ID
    const { data, error } = await supabase
      .from('abandoned_carts')
      .upsert({
        id: payload.id,
        customer_name: payload.customer_name || 'Guest',
        email: payload.email || 'Unknown',
        value: payload.value || 0,
        items_count: payload.items_count || 0,
        items: payload.items || [],
        status: payload.status || 'Pending',
        last_updated: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Failed to save abandoned cart:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { id } = await request.json();

    if (!id) return NextResponse.json({ message: 'No ID provided' });

    const { error } = await supabase
      .from('abandoned_carts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error('Failed to delete abandoned cart:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
