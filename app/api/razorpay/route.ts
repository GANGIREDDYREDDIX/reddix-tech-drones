import { NextResponse } from "next/dist/server/web/spec-extension/response";
import Razorpay from "razorpay";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_DUMMYKEY",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise (500 INR)
    const options = {
      amount: Math.round(amount * 100), // convert to paise and ensure it's an integer
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
