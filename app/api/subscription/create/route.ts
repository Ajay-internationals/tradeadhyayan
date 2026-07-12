import { NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { planSlug, email } = await req.json();

    if (!email || !planSlug) {
      return NextResponse.json({ error: "Email and planSlug are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch plan details from the database
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug.toUpperCase() }
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    // Free plan doesn't need checkout
    if (plan.price === 0) {
      return NextResponse.json({ error: "Free plan does not require payment" }, { status: 400 });
    }

    // Cashfree order_id constraints: alphanumeric + underscore, max 50 chars
    const safeEmail = cleanEmail.replace(/@/g, "AT").replace(/\./g, "DOT").replace(/[^a-zA-Z0-9]/g, "_");
    const timestamp = Date.now();
    // Format: sub_PLAN_email_timestamp (underscores only)
    const rawId = `sub_${plan.slug}_${safeEmail}_${timestamp}`;
    const orderId = rawId.slice(0, 50);

    let baseUrl = "https://trade-adhyayan-next.vercel.app";
    if (process.env.NODE_ENV === "development") {
      baseUrl = "http://localhost:3000";
    }
    const returnUrl = `${baseUrl}/api/subscription/callback?order_id={order_id}`;

    const orderData = await createCashfreeOrder({
      orderId,
      amount: plan.price,
      customerEmail: cleanEmail,
      customerName: user.name || cleanEmail.split("@")[0],
      returnUrl
    });

    // Create a pending Subscription record to track intent, if none exists
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: "PENDING",
        }
      });
    }

    // Create Payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        cashfreeOrderId: orderData.order_id,
        amount: plan.price,
        status: "PENDING",
      }
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: orderData.payment_session_id,
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderStatus: orderData.order_status
    });
  } catch (error: any) {
    console.error("Subscription create error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate subscription" }, { status: 500 });
  }
}
