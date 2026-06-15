import { NextResponse } from "next/dist/server/web/spec-extension/response";

// A helper to get the Shiprocket Token
async function getShiprocketToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured in environment variables.");
  }

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to authenticate with Shiprocket");
  }

  return data.token;
}

export async function POST(req: Request) {
  try {
    const { delivery_postcode, items } = await req.json();

    if (!delivery_postcode || delivery_postcode.length !== 6) {
      return NextResponse.json({ error: "Invalid PIN code" }, { status: 400 });
    }

    // 1. Calculate total weight of the cart
    // Currently, products might not have weight in DB, so we use a fallback of 1.5kg per item
    let totalWeight = 0;
    items.forEach((item: any) => {
      const itemWeight = item.weight || 1.5; // fallback to 1.5kg
      totalWeight += itemWeight * item.quantity;
    });

    // 2. Authenticate with Shiprocket
    let token;
    try {
      token = await getShiprocketToken();
    } catch (authError: any) {
      // If credentials aren't set, return mock data for development so the UI still works
      console.warn("Shiprocket auth failed (returning mock rates):", authError.message);
      return NextResponse.json({
        rates: [
          {
            courier_name: "Bluedart (Mock API)",
            rate: 237,
            estimated_delivery_days: 3,
            courier_company_id: 1
          },
          {
            courier_name: "Delhivery Surface (Mock API)",
            rate: 150,
            estimated_delivery_days: 5,
            courier_company_id: 2
          }
        ]
      });
    }

    // 3. Check Serviceability and fetch live rates
    const pickup_postcode = process.env.STORE_PIN_CODE || "144411";
    const cod = 0; // Prepaid orders only for now

    const serviceabilityUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${totalWeight}&cod=${cod}`;

    const rateResponse = await fetch(serviceabilityUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const rateData = await rateResponse.json();

    if (!rateResponse.ok || !rateData.data || !rateData.data.available_courier_companies) {
      throw new Error(rateData.message || "No couriers available for this PIN code.");
    }

    // Map the response to a clean format for the frontend
    const availableCouriers = rateData.data.available_courier_companies.map((courier: any) => ({
      courier_company_id: courier.courier_company_id,
      courier_name: courier.courier_name,
      rate: courier.rate,
      estimated_delivery_days: courier.etd_hours ? Math.ceil(courier.etd_hours / 24) : 5,
    }));

    // Sort by cheapest first
    availableCouriers.sort((a: any, b: any) => a.rate - b.rate);

    return NextResponse.json({ rates: availableCouriers });

  } catch (error: any) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate shipping rates" },
      { status: 500 }
    );
  }
}
