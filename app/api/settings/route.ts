import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: config, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Return default values if row doesn't exist
        return NextResponse.json({
          id: 'default',
          store_name: 'Reddix Tech Enterprises',
          support_email: 'support@reddix.tech',
          maintenance_mode: false,
          new_order_alerts: true,
          domestic_shipping: '500',
          intl_shipping: '2500',
          default_tax: '18'
        });
      }
      console.error("Supabase Error Details:", error);
      throw error;
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to read store settings:', error);
    return NextResponse.json({ error: 'Failed to read store settings', details: error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        id: 'default',
        store_name: updates.store_name,
        support_email: updates.support_email,
        maintenance_mode: updates.maintenance_mode,
        new_order_alerts: updates.new_order_alerts,
        domestic_shipping: updates.domestic_shipping,
        intl_shipping: updates.intl_shipping,
        default_tax: updates.default_tax
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error Details:", error);
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update store settings:', error);
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}
