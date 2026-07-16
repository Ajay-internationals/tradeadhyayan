import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Calculate Total MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { Plan: true }
    });

    const currentMrr = activeSubscriptions.reduce((acc, sub) => acc + (sub.Plan.price || 0), 0);
    const activeSubCount = activeSubscriptions.length;

    // Calculate Total Lifetime Revenue
    const allSuccessfulPayments = await prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true }
    });
    const totalRevenue = allSuccessfulPayments._sum.amount || 0;

    // Calculate Revenue this month
    const thisMonthPayments = await prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        paidAt: { gte: currentMonthStart }
      },
      _sum: { amount: true }
    });
    const thisMonthRevenue = thisMonthPayments._sum.amount || 0;

    // Group by plan
    const planBreakdown = await prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: "ACTIVE" },
      _count: { id: true }
    });

    // Resolve plan names
    const plans = await prisma.subscriptionPlan.findMany();
    const planBreakdownWithName = planBreakdown.map(pb => {
      const plan = plans.find(p => p.id === pb.planId);
      return {
        planName: plan ? plan.name : "Unknown",
        count: pb._count.id,
        revenue: (plan ? plan.price : 0) * pb._count.id
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        currentMrr,
        activeSubCount,
        totalRevenue,
        thisMonthRevenue,
        planBreakdown: planBreakdownWithName
      }
    });

  } catch (error: any) {
    console.error("Admin revenue error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
