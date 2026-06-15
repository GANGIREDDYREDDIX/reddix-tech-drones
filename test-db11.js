require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('customers').select('*').eq('id', 'CUS-103').single();
  console.log("Customer error:", error);
  console.log("Customer data:", data);
}
run();
