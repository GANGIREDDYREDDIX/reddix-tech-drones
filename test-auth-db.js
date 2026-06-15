require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  // Login as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'chintureddy6165@gmail.com',
    password: 'password123' // Is this the password? I don't know the password.
  });
  console.log("Auth:", authError ? authError.message : "Success");
}
run();
