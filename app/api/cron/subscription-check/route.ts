import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/cron/subscription-check
// Designed to be hit by Vercel Cron or a scheduler like GitHub Actions once daily
export async function GET(req: Request) {
  try {
    // 1. Identify subscriptions that have expired past their 7-day grace period
    const now = new Date();
    const gracePeriodThreshold = new Date();
    gracePeriodThreshold.setDate(gracePeriodThreshold.getDate() - 7);

    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: gracePeriodThreshold
        }
      },
      include: {
        User: true,
        Plan: true
      }
    });

    for (const sub of expiredSubscriptions) {
      // Formally expire the subscription
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" }
      });

      // Reset legacy user plan
      await prisma.user.update({
        where: { id: sub.userId },
        data: { plan: "FREE" }
      });

      // Create Notification
      await prisma.notification.create({
        data: {
          userId: sub.userId,
          title: "Subscription Expired",
          message: `Your ${sub.Plan.name} plan has expired. Please renew to continue enjoying premium features.`,
          type: "BILLING"
        }
      });
    }

    // 2. Identify subscriptions entering grace period (expired within the last 7 days but not notified)
    // We will send a reminder notification. We can check if endDate < now, but we only want to notify once.
    // For simplicity, we find ones that expired exactly yesterday or today.
    const enteringGracePeriod = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: now,
          gt: gracePeriodThreshold
        }
      },
      include: {
        User: true,
        Plan: true
      }
    });

    for (const sub of enteringGracePeriod) {
      // Check if we already notified them about grace period
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: sub.userId,
          title: "Payment Due - Grace Period",
          createdAt: {
            gt: sub.endDate!
          }
        }
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId: sub.userId,
            title: "Payment Due - Grace Period",
            message: `Your ${sub.Plan.name} plan is past due. You have a 7-day grace period to renew before losing access.`,
            type: "BILLING"
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      expiredCount: expiredSubscriptions.length,
      gracePeriodCount: enteringGracePeriod.length 
    });
  } catch (error: any) {
    console.error("Cron check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
