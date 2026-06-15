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
    const { status, notes, undoRestock } = await request.json();
    const supabase = await createClient();
    
    // Fetch existing order to merge customer metadata if we have notes
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw fetchError;
    }

    let updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (notes !== undefined) {
      updatePayload.customer = { ...existingOrder.customer, admin_notes: notes };
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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
        if (['Cancelled', 'RTO', 'Restocked', 'Damaged', 'Refunded'].includes(status)) {
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

    // --- AUTOMATED RESTOCKING ENGINE ---
    try {
      if (status === 'Restocked' && data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.id && item.quantity) {
            // Fetch current stock
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('stockQuantity')
              .eq('id', item.id)
              .single();

            if (!productError && productData) {
              const newQty = (productData.stockQuantity || 0) + item.quantity;
              await supabase
                .from('products')
                .update({ 
                  stockQuantity: newQty,
                  inStock: newQty > 0
                })
                .eq('id', item.id);
            }
          }
        }
      } else if (undoRestock && status === 'RTO' && data.items && Array.isArray(data.items)) {
        // Revert restocking (decrement inventory)
        for (const item of data.items) {
          if (item.id && item.quantity) {
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('stockQuantity')
              .eq('id', item.id)
              .single();

            if (!productError && productData) {
              const newQty = Math.max(0, (productData.stockQuantity || 0) - item.quantity);
              await supabase
                .from('products')
                .update({ 
                  stockQuantity: newQty,
                  inStock: newQty > 0
                })
                .eq('id', item.id);
            }
          }
        }
      }
    } catch(e) {
      console.error("Automated Restocking Engine Error:", e);
    }
    // --- END AUTOMATED RESTOCKING ENGINE ---

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

