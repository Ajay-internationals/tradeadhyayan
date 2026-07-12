import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Cashfree Webhook Signature Verification
function verifyWebhookSignature(reqBody: string, signature: string, timestamp: string): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY || "";
  const payload = `${timestamp}${reqBody}`;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");
  return generatedSignature === signature;
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const reqBody = await req.text();

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
    }

    if (!verifyWebhookSignature(reqBody, signature, timestamp)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(reqBody);
    const { event_type, data } = payload;
    const order = data.order;
    const payment = data.payment;

    if (!order || !order.order_id) {
      return NextResponse.json({ success: true, message: "Ignored, missing order id" });
    }

    const orderId = order.order_id;
    const dbPayment = await prisma.payment.findUnique({
      where: { cashfreeOrderId: orderId },
      include: { Subscription: true }
    });

    if (!dbPayment) {
      return NextResponse.json({ success: true, message: "Payment not found in our DB" });
    }

    // Handle Payment Success
    if (event_type === "PAYMENT_SUCCESS_WEBHOOK") {
      if (dbPayment.status !== "SUCCESS") {
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: "SUCCESS",
            cashfreePaymentId: payment?.cf_payment_id?.toString(),
            paidAt: new Date(),
            paymentMethod: payment?.payment_group,
          }
        });

        // Activate Subscription for 30 days
        const parts = orderId.split("_");
        const planSlug = parts[1]; // sub_PLAN_email_timestamp
        const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
        
        if (plan && dbPayment.subscriptionId) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);

          await prisma.subscription.update({
            where: { id: dbPayment.subscriptionId },
            data: {
              status: "ACTIVE",
              planId: plan.id,
              startDate,
              endDate,
              nextBillingDate: endDate,
            }
          });
          
          await prisma.user.update({
            where: { id: dbPayment.userId },
            data: { plan: planSlug === "MENTORSHIP" ? "MENTOR" : "PRO" }
          });
        }
      }
    } 
    // Handle Payment Failure
    else if (event_type === "PAYMENT_FAILED_WEBHOOK") {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { status: "FAILED" }
      });
      
      if (dbPayment.Subscription && dbPayment.Subscription.status === "PENDING") {
        await prisma.subscription.update({
          where: { id: dbPayment.subscriptionId! },
          data: { status: "PAYMENT_FAILED" }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
