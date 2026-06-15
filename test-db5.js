require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('nonexistent_table').select('*').limit(1);
  console.log('Error:', error);
}
run();
