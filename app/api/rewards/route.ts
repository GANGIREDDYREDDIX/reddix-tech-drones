import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch configuration
    const { data: config, error: configError } = await supabase
      .from('rewards_config')
      .select('*')
      .eq('id', 'default')
      .single();

    let finalConfig = config;

    if (configError) {
      if (configError.code === 'PGRST116') {
        // Default values if row doesn't exist
        finalConfig = {
          id: 'default',
          purchases_multiplier: 1,
          review_points: 50,
          referral_points: 500
        };
      } else {
        console.error("Supabase Error Details:", configError);
        throw configError;
      }
    }
    
    // Fetch customer data for KPIs + leaderboard
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, email, points_issued, points_redeemed, status, joined_date')
      .order('points_issued', { ascending: false });
      
    let kpis = {
      total_issued: 0,
      total_redeemed: 0,
      active_members: 0
    };
    
    if (!customersError && customers) {
      customers.forEach(c => {
        kpis.total_issued += (c.points_issued || 0);
        kpis.total_redeemed += (c.points_redeemed || 0);
        if (c.status === 'Active') kpis.active_members++;
      });
    }
    
    return NextResponse.json({
      config: finalConfig,
      kpis: kpis,
      customers: (customers || []).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        points_issued: c.points_issued || 0,
        points_redeemed: c.points_redeemed || 0,
        points_balance: (c.points_issued || 0) - (c.points_redeemed || 0),
        status: c.status,
      }))
    });
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
