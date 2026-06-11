import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: discounts, error } = await supabase
      .from('discounts')
      .select('*');

    if (error) throw error;
    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Failed to read discounts:', error);
    return NextResponse.json({ error: 'Failed to read discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDiscount = await request.json();
    const supabase = await createClient();
    
    // Add missing fields for a new discount
    const id = `DISC-${Date.now()}`;
    const { data, error } = await supabase
      .from('discounts')
      .insert({
        id,
        code: newDiscount.code,
        type: newDiscount.type,
        value: newDiscount.value,
        status: 'Active',
        usageCount: 0,
        expiry: newDiscount.expiry || null
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create discount:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}
