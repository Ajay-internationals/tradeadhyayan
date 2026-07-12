import { NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { planId, email, mentorId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map amounts
    let amount = 499; // Default Pro Plan
    let planName = "PRO";

    if (planId === "mentor") {
      amount = 4999;
      planName = "MENTOR";
    } else if (planId === "mentorship") {
      amount = 1999; // 1:1 Mentorship Session Booking fee
      planName = `MENTORSHIP_${(mentorId || "general").replace(/[^a-zA-Z0-9]/g, "_")}`;
    }

    // Create self-contained safe order ID
    // Cashfree order_id: only alphanumeric + underscore, max 50 chars
    const safeEmail = cleanEmail.replace(/@/g, "AT").replace(/\./g, "DOT").replace(/[^a-zA-Z0-9]/g, "_");
    const timestamp = Date.now();
    // Format: ta_PLAN_email_timestamp  (underscores only)
    const rawId = `ta_${planName}_${safeEmail}_${timestamp}`;
    const orderId = rawId.slice(0, 50); // Cashfree max 50 chars

    let baseUrl = "https://trade-adhyayan-next.vercel.app";
    if (process.env.NODE_ENV === "development") {
      baseUrl = "http://localhost:3000";
    }
    const returnUrl = `${baseUrl}/api/payments/callback?order_id={order_id}`;

    const orderData = await createCashfreeOrder({
      orderId,
      amount,
      customerEmail: cleanEmail,
      customerName: user.name || cleanEmail.split("@")[0],
      returnUrl
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: orderData.payment_session_id,
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderStatus: orderData.order_status
    });
  } catch (error: any) {
    console.error("Checkout order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment" }, { status: 500 });
  }
}
