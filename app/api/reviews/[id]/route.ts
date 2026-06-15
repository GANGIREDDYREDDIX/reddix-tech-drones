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

    // When a review is Approved, recalculate the product's rating and reviewCount
    if (body.status === 'Approved' && data.product_id) {
      try {
        const { data: approvedReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', data.product_id)
          .eq('status', 'Approved');

        if (approvedReviews && approvedReviews.length > 0) {
          const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
          const roundedRating = Math.round(avgRating * 10) / 10;

          await supabase
            .from('products')
            .update({
              rating: roundedRating,
              reviewCount: approvedReviews.length
            })
            .eq('id', data.product_id);
          
          console.log(`Updated product ${data.product_id}: rating=${roundedRating}, reviewCount=${approvedReviews.length}`);
        }
      } catch (recalcError) {
        // Don't fail the review update if product recalc fails
        console.error('Failed to recalculate product rating:', recalcError);
      }
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
