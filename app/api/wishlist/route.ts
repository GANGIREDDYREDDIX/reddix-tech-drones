import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: items, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('customer_email', user.email);

    if (error) throw error;
    
    const productIds = items.map(item => item.product_id);
    return NextResponse.json(productIds);
  } catch (error) {
    console.error('Failed to read wishlist:', error);
    return NextResponse.json({ error: 'Failed to read wishlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await request.json();

    if (!product_id) {
       return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Check if it exists
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('customer_email', user.email)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // Toggle off (remove)
      await supabase.from('wishlist_items').delete().eq('id', existing.id);
      return NextResponse.json({ action: 'removed', product_id });
    } else {
      // Toggle on (add)
      const newItem = {
        id: `WSH-${Math.floor(Math.random() * 100000)}`,
        customer_email: user.email,
        product_id: product_id,
        created_at: new Date().toISOString()
      };
      await supabase.from('wishlist_items').insert(newItem);
      return NextResponse.json({ action: 'added', product_id });
    }
  } catch (error) {
    console.error('Failed to update wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
