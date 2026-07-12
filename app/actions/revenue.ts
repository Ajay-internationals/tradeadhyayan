"use server";

import { prisma } from "@/lib/db";
import { startOfMonth, subMonths } from "date-fns";

export async function getAdminRevenueDashboard() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);

  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { Plan: true }
  });

  const currentMrr = activeSubscriptions.reduce((acc, sub) => acc + (sub.Plan?.price || 0), 0);
  const activeSubCount = activeSubscriptions.length;

  const allSuccessfulPayments = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true }
  });
  const totalRevenue = allSuccessfulPayments._sum.amount || 0;

  const thisMonthPayments = await prisma.payment.aggregate({
    where: {
      status: "SUCCESS",
      paidAt: { gte: currentMonthStart }
    },
    _sum: { amount: true }
  });
  const thisMonthRevenue = thisMonthPayments._sum.amount || 0;

  const planBreakdown = await prisma.subscription.groupBy({
    by: ['planId'],
    where: { status: "ACTIVE" },
    _count: { id: true }
  });

  const plans = await prisma.subscriptionPlan.findMany();
  const planBreakdownWithName = planBreakdown.map(pb => {
    const plan = plans.find(p => p.id === pb.planId);
    return {
      planName: plan ? plan.name : "Unknown",
      count: pb._count.id,
      revenue: (plan ? plan.price : 0) * pb._count.id
    };
  });

  return {
    currentMrr,
    activeSubCount,
    totalRevenue,
    thisMonthRevenue,
    planBreakdown: planBreakdownWithName
  };
}
