require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
async function run() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  const table = spec.definitions['price_requests'];
  console.log(JSON.stringify(table, null, 2));
}
run();
