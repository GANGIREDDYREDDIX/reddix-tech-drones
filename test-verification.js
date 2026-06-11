const SUPABASE_URL = "https://zldibrhzuxhwecetctxb.supabase.co";
const SUPABASE_KEY = "sb_publishable_wLCZbYBRYw0Pw0htUUZ01Q_Qc-D8VNX";
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

async function verify() {
  console.log("=== VERIFICATION TEST START ===");

  try {
    // 1. Insert an Order (Simulating Frontend Checkout)
    console.log("\n1. Testing Order Creation...");
    const orderData = {
      id: "ORD-TEST-999",
      customer: { name: "Automated Tester", email: "test@reddix.tech" },
      date: new Date().toISOString(),
      status: "Pending",
      total: 1599.99,
      items: [{ productId: "1", name: "Drone", price: 1599.99, quantity: 1 }]
    };
    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(orderData)
    });
    const orderJson = await orderRes.json();
    if (orderRes.ok) console.log("✅ Order successfully inserted:", orderJson[0].id);
    else console.error("❌ Order insert failed:", orderJson);

    // 2. Insert Support Ticket (Simulating Frontend Settings)
    console.log("\n2. Testing Support Ticket Creation...");
    const ticketData = {
      id: "TKT-TEST-999",
      customer_name: "Automated Tester",
      customer_email: "test@reddix.tech",
      subject: "Test Issue",
      status: "Open",
      priority: "Medium",
      date: new Date().toISOString()
    };
    const ticketRes = await fetch(`${SUPABASE_URL}/rest/v1/support_tickets`, {
      method: "POST",
      headers,
      body: JSON.stringify(ticketData)
    });
    const ticketJson = await ticketRes.json();
    if (ticketRes.ok) console.log("✅ Ticket successfully inserted:", ticketJson[0].id);
    else console.error("❌ Ticket insert failed:", ticketJson);

    // 3. Insert Product (Simulating Admin Dashboard)
    console.log("\n3. Testing Product Creation...");
    const productData = {
      id: "PROD-TEST-QA-01",
      name: "QA Verification Drone",
      category: "Testing",
      price: 199.99,
      inStock: true,
      image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=400&auto=format&fit=crop"
    };
    const productRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(productData)
    });
    const productJson = await productRes.json();
    if (productRes.ok) console.log("✅ Product successfully inserted:", productJson[0].name);
    else console.error("❌ Product insert failed:", productJson);

    console.log("\n=== VERIFICATION TEST COMPLETE ===");
  } catch(e) {
    console.error("Test execution failed:", e);
  }
}
verify();
