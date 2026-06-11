import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to read products:', error);
    return NextResponse.json({ error: 'Failed to read products database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const supabase = await createClient();
    
    // Convert JS casing to DB schema (camelCase matches our DB schema based on SQL)
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: newProduct.id,
        name: newProduct.name,
        tagline: newProduct.tagline,
        description: newProduct.description,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice,
        image: newProduct.image,
        badge: newProduct.badge,
        rating: newProduct.rating || 0,
        reviewCount: newProduct.reviewCount || 0,
        inStock: newProduct.inStock ?? true,
        category: newProduct.category,
        features: newProduct.features || [],
        specs: newProduct.specs || {},
        stockQuantity: newProduct.stockQuantity || 0
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to add product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
