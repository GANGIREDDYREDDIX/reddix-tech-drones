import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    let query = supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    // Public shop only sees Approved reviews; admin passes ?all=true
    if (!showAll) {
      query = query.eq('status', 'Approved');
    }

    const { data: reviews, error } = await query;

    if (error) throw error;
    
    // Map database fields back to camelCase as expected by frontend
    const formattedReviews = (reviews || []).map(r => ({
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

    // --- POINTS ENGINE LOGIC ---
    try {
      // 1. Check if the customer has already reviewed this product
      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('customer_name', newReview.customerName)
        .eq('product_id', newReview.productId)
        // We exclude the newly created review itself
        .neq('id', data.id);

      if (!existingReviews || existingReviews.length === 0) {
        // First time reviewing this product! Issue points.
        
        // 2. Fetch the current reward configuration for reviews
        const { data: config } = await supabase
          .from('rewards_config')
          .select('review_points')
          .eq('id', 'default')
          .single();
          
        const pointsToAward = config?.review_points || 10;

        // 3. Fetch current points for this customer
        const { data: customer } = await supabase
          .from('customers')
          .select('id, points_issued')
          .eq('name', newReview.customerName)
          .single();

        if (customer) {
          // 4. Update the points balance
          await supabase
            .from('customers')
            .update({ points_issued: (customer.points_issued || 0) + pointsToAward })
            .eq('id', customer.id);
            
          console.log(`Issued ${pointsToAward} points to ${customer.id} for product review.`);
        }
      }
    } catch (engineError) {
      // We don't want points engine failures to break the review creation
      console.error("Points Engine Error:", engineError);
    }
    // --- END POINTS ENGINE LOGIC ---
    
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
