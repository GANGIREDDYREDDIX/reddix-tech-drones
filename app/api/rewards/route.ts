import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: config, error } = await supabase
      .from('rewards_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Return default values if row doesn't exist
        return NextResponse.json({
          id: 'default',
          purchases_multiplier: 1,
          review_points: 50,
          referral_points: 500
        });
      }
      console.error("Supabase Error Details:", error);
      throw error;
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to read rewards config:', error);
    return NextResponse.json({ error: 'Failed to read rewards config', details: error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rewards_config')
      .upsert({
        id: 'default',
        purchases_multiplier: updates.purchases_multiplier,
        review_points: updates.review_points,
        referral_points: updates.referral_points
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error Details:", error);
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update rewards config:', error);
    return NextResponse.json({ error: 'Failed to update rewards config' }, { status: 500 });
  }
}
