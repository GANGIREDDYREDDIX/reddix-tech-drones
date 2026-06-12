import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    // --- POINTS ENGINE LIFECYCLE LOGIC ---
    try {
      const order = data;
      if (order && order.customer && order.customer.email) {
        let customerMetadata = { ...order.customer };
        let needsOrderUpdate = false;
        
        // 1. Award Points on Delivery
        if (status === 'Delivered' && !customerMetadata.points_awarded && customerMetadata.points_earned > 0) {
          const { data: customerRecord } = await supabase.from('customers').select('points_issued').eq('email', customerMetadata.email).single();
          if (customerRecord) {
            await supabase.from('customers')
              .update({ points_issued: (customerRecord.points_issued || 0) + customerMetadata.points_earned })
              .eq('email', customerMetadata.email);
            
            customerMetadata.points_awarded = true;
            needsOrderUpdate = true;
          }
        }
        
        // 2. Clawback / Refund on Cancellation or RTO
        if (['Cancelled', 'RTO (Pending Return)', 'RTO (Restocked)'].includes(status)) {
          const { data: customerRecord } = await supabase.from('customers').select('points_issued, points_redeemed').eq('email', customerMetadata.email).single();
          
          if (customerRecord) {
            let updatePayload: any = {};
            
            // Clawback earned points if previously awarded
            if (customerMetadata.points_awarded) {
              updatePayload.points_issued = Math.max(0, (customerRecord.points_issued || 0) - customerMetadata.points_earned);
              customerMetadata.points_awarded = false;
              needsOrderUpdate = true;
            }
            
            // Refund spent points if not yet refunded
            if (customerMetadata.points_redeemed > 0 && !customerMetadata.points_refunded) {
              updatePayload.points_redeemed = Math.max(0, (customerRecord.points_redeemed || 0) - customerMetadata.points_redeemed);
              customerMetadata.points_refunded = true;
              needsOrderUpdate = true;
            }
            
            if (Object.keys(updatePayload).length > 0) {
              await supabase.from('customers').update(updatePayload).eq('email', customerMetadata.email);
            }
          }
        }
        
        // Persist point state changes back to the order
        if (needsOrderUpdate) {
          await supabase.from('orders').update({ customer: customerMetadata }).eq('id', id);
        }
      }
    } catch(e) {
      console.error("Points Engine Lifecycle Error:", e);
    }
    // --- END POINTS ENGINE LIFECYCLE LOGIC ---

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
