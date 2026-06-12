import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { name, email, referralCode } = await request.json();
    const supabase = await createClient();
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // 1. Generate a new unique referral code for this user
    // Simple logic: first 4 uppercase letters of name (or fewer) + random 3-digit number
    const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'USER';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newReferralCode = `${prefix}${randomNum}`;

    // 2. Validate the provided referralCode (if any) and run points engine
    let validReferredBy = null;
    let initialPoints = 0;

    if (referralCode) {
      // Look up the customer who owns this code
      const { data: referrer, error: referrerError } = await supabase
        .from('customers')
        .select('id, points_issued')
        .eq('referral_code', referralCode.toUpperCase())
        .single();

      if (referrer && !referrerError) {
        validReferredBy = referralCode.toUpperCase();
        
        // Fetch the referral_points config
        const { data: config } = await supabase
          .from('rewards_config')
          .select('referral_points')
          .eq('id', 'default')
          .single();
          
        const pointsToAward = config?.referral_points || 50;

        // Automatically issue points to the referrer!
        await supabase
          .from('customers')
          .update({ points_issued: (referrer.points_issued || 0) + pointsToAward })
          .eq('id', referrer.id);
          
        console.log(`Issued ${pointsToAward} points to ${referrer.id} for referring a new customer.`);
        
        // The new customer will also get these points as a welcome bonus
        initialPoints = pointsToAward;
      } else {
        // We will just log it. The registration shouldn't fail if the code is invalid,
        // it just won't apply the referral.
        console.warn(`Invalid referral code provided: ${referralCode}`);
      }
    }

    // Generate a unique ID (in a real app, this would be tied to authentication)
    const newId = `CUS-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create the new customer in the database
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        id: newId,
        name: name,
        email: email,
        total_orders: 0,
        total_spent: 0,
        status: 'Active',
        points_issued: initialPoints,
        points_redeemed: 0,
        referral_code: newReferralCode,
        referred_by: validReferredBy
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert customer:", insertError);
      throw insertError;
    }
    
    return NextResponse.json({
      message: 'Registration successful',
      customer: newCustomer
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
