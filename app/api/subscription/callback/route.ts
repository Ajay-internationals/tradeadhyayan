import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Cashfree } from "cashfree-pg";

// Configure Cashfree instance for verifications
Cashfree.XClientId = process.env.CASHFREE_APP_ID || "";
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "";
Cashfree.XEnvironment = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
  ? Cashfree.Environment.PRODUCTION
  : Cashfree.Environment.SANDBOX;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.redirect(new URL("/dashboard/settings?payment=failed", req.url));
    }

    // Verify order status with Cashfree
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    
    // Find successful payment
    const payments = response.data;
    const successfulPayment = payments?.find((p: any) => p.payment_status === "SUCCESS");

    if (!successfulPayment) {
      return NextResponse.redirect(new URL("/dashboard/settings?payment=failed", req.url));
    }

    // Extract Plan slug from Order ID (format: sub_PLAN_email_timestamp)
    const parts = orderId.split("_");
    const planSlug = parts[1]; // e.g., PRO or MENTORSHIP

    // Find the associated Payment and Subscription records
    const payment = await prisma.payment.findUnique({
      where: { cashfreeOrderId: orderId },
      include: { Subscription: true, User: true }
    });

    if (payment && payment.status !== "SUCCESS") {
      // Find the correct Plan ID
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { slug: planSlug }
      });

      if (plan && payment.subscriptionId) {
        // Calculate end date (30 days from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        // Update Payment Status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            cashfreePaymentId: successfulPayment.cf_payment_id?.toString(),
            paidAt: new Date(),
            paymentMethod: successfulPayment.payment_group,
          }
        });

        // Activate Subscription
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: "ACTIVE",
            planId: plan.id,
            startDate: startDate,
            endDate: endDate,
            nextBillingDate: endDate,
          }
        });

        // Also update legacy user.plan for backward compatibility
        await prisma.user.update({
          where: { id: payment.userId },
          data: { plan: planSlug === "MENTORSHIP" ? "MENTOR" : "PRO" }
        });
      }
    }

    // Redirect to dashboard with success param
    return NextResponse.redirect(new URL(`/dashboard/settings?payment=success&plan=${planSlug}`, req.url));
    
  } catch (error) {
    console.error("Subscription callback error:", error);
    return NextResponse.redirect(new URL("/dashboard/settings?payment=failed", req.url));
  }
}
