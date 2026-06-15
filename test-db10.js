require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const newRequest = {
    user_id: '123',
    product_id: 'kay',
    quantity: 10,
    requested_price: 222,
    status: 'Pending',
    date: new Date().toISOString()
  };
  const { data, error } = await supabase.from('price_requests').insert(newRequest).select().single();
  console.log('Error:', error);
}
run();
