require('dotenv').config({path: '.env.local'});
async function run() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  console.log(Object.keys(spec.definitions).filter(k => k.includes('price')));
  const table = spec.definitions['price_requests'] || spec.definitions['PriceRequests'] || spec.definitions['price_request'];
  if (table) {
    console.log(Object.keys(table.properties));
  }
}
run();
