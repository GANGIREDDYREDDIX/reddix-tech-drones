import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    if (!body.status) {
       return NextResponse.json({ error: 'Missing status field' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('reviews')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      throw error;
    }

    const updatedReview = {
      id: data.id,
      productId: data.product_id,
      productName: data.product_name,
      customerName: data.customer_name,
      rating: data.rating,
      text: data.text,
      date: data.date,
      status: data.status
    };
    
    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
