import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updatedData = await request.json();
    const supabase = await createClient();
    
    // Map any JS camelCase properties back to DB snake_case if applicable (though we used camelCase in DB schema mostly except for quotes if we used them, wait, our sql was exact)
    // Actually, our SQL for products:
    // "originalPrice", "reviewCount", "inStock", "stockQuantity" (mixed case, so we need to use exact matching keys or just pass the object as is, but we better be explicit)
    const updatePayload: any = {
      name: updatedData.name,
      tagline: updatedData.tagline,
      description: updatedData.description,
      price: updatedData.price,
      originalPrice: updatedData.originalPrice,
      image: updatedData.image,
      badge: updatedData.badge,
      rating: updatedData.rating,
      reviewCount: updatedData.reviewCount,
      inStock: updatedData.inStock,
      category: updatedData.category,
      features: updatedData.features,
      specs: updatedData.specs,
      stockQuantity: updatedData.stockQuantity
    };

    // Remove undefined values to prevent overwriting with null accidentally
    Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
