import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getCashfreeOrder } from "@/lib/cashfree";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.redirect(new URL("/dashboard?payment=error&message=No+order+id", req.url));
    }

    // Fetch order details from Cashfree to verify payment
    const orderData = await getCashfreeOrder(orderId);

    if (orderData.order_status !== "PAID") {
      return NextResponse.redirect(
        new URL(`/dashboard?payment=failed&order_status=${orderData.order_status}`, req.url)
      );
    }

    // Get email directly from Cashfree order's customer_details (100% reliable)
    const email = orderData.customer_details?.customer_email;
    if (!email) {
      return NextResponse.redirect(new URL("/dashboard?payment=error&message=Missing+customer+email", req.url));
    }

    // Determine plan from orderId prefix: ta_PRO_... or ta_MENTOR_... or ta_MENTORSHIP_...
    let planName = "UNKNOWN";
    if (orderId.startsWith("ta_PRO_")) planName = "PRO";
    else if (orderId.startsWith("ta_MENTOR_")) planName = "MENTOR";
    else if (orderId.startsWith("ta_MENTORSHIP_")) planName = "MENTORSHIP";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.redirect(new URL("/dashboard?payment=error&message=User+not+found", req.url));
    }

    if (planName === "PRO" || planName === "MENTOR") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: planName,
          role: planName === "MENTOR" ? "MENTOR" : user.role,
          updatedAt: new Date()
        }
      });

      await prisma.activityLog.create({
        data: {
          actorId: user.id,
          targetId: user.id,
          activityType: "PLAN_UPGRADED",
          description: `User upgraded plan to ${planName} via Cashfree payment. Order ID: ${orderId}`
        }
      });

      return NextResponse.redirect(
        new URL(`/dashboard/settings?payment=success&plan=${planName}`, req.url)
      );
    } else if (planName === "MENTORSHIP") {
      const latestSession = await prisma.mentorshipSession.findFirst({
        where: { clientId: user.id, status: "REQUESTED" },
        orderBy: { createdAt: "desc" }
      });

      if (latestSession) {
        await prisma.mentorshipSession.update({
          where: { id: latestSession.id },
          data: { status: "UPCOMING" }
        });

        await prisma.activityLog.create({
          data: {
            actorId: user.id,
            targetId: latestSession.id,
            activityType: "SESSION_CONFIRMED",
            description: `Mentorship session confirmed after Cashfree payment. Order ID: ${orderId}`
          }
        });
      }

      return NextResponse.redirect(new URL("/dashboard/mentorship?payment=success", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard?payment=success", req.url));
  } catch (error: any) {
    console.error("Callback payment processing error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?payment=error&message=${encodeURIComponent(error.message || "Callback failed")}`, req.url)
    );
  }
}
