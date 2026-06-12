import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return NextResponse.json({ points: 0 }, { status: 401 });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('points_issued, points_redeemed')
      .eq('email', user.email)
      .order('joined_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (error || !customer) {
      return NextResponse.json({ points: 0 });
    }

    const availablePoints = (customer.points_issued || 0) - (customer.points_redeemed || 0);
    
    return NextResponse.json({ points: availablePoints > 0 ? availablePoints : 0 });
  } catch (error) {
    console.error('Failed to fetch customer points:', error);
    return NextResponse.json({ points: 0 }); // Fallback gracefully
  }
}
