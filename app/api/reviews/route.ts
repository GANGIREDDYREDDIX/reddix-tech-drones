import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    // Map database fields back to camelCase as expected by frontend
    const formattedReviews = reviews.map(r => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      customerName: r.customer_name,
      rating: r.rating,
      text: r.text,
      date: r.date,
      status: r.status
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Failed to read reviews:', error);
    return NextResponse.json({ error: 'Failed to read reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newReview = await request.json();
    const supabase = await createClient();
    
    if (!newReview.productId || !newReview.customerName || !newReview.rating || !newReview.text) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: newReview.productId,
        product_name: newReview.productName || newReview.productId,
        customer_name: newReview.customerName,
        rating: newReview.rating,
        text: newReview.text,
        status: "Pending"
      })
      .select()
      .single();

    if (error) throw error;
    
    const reviewToSave = {
      id: data.id,
      productId: data.product_id,
      productName: data.product_name,
      customerName: data.customer_name,
      rating: data.rating,
      text: data.text,
      date: data.date,
      status: data.status
    };
    
    return NextResponse.json(reviewToSave, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
