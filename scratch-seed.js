require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const newOrder = {
    id: `ORD-${Math.floor(Math.random() * 100000)}`,
    customer: {
      name: 'Tech Corp',
      email: 'procurement@techcorp.io',
      points_earned: 100,
      points_redeemed: 0,
      points_awarded: false,
      points_refunded: false,
    },
    date: new Date().toISOString(),
    status: 'Delivered',
    total: 32994,
    items: [
      { id: '1', name: 'Industrial Drone X1', price: 32994, quantity: 1 }
    ]
  };

  const { data, error } = await supabase.from('orders').insert(newOrder).select();
  console.log("Insert order result:", error || data);
}
run();
