import { prisma } from "@/lib/db";

export type AccessRights = {
  plan: string;
  tradeLimit: number;
  brokerSync: boolean;
  analytics: boolean;
  reports: boolean;
  exports: boolean;
  mentorAccess: boolean;
};

const DEFAULT_FREE_ACCESS: AccessRights = {
  plan: "FREE",
  tradeLimit: 30,
  brokerSync: false,
  analytics: false,
  reports: false,
  exports: false,
  mentorAccess: false,
};

/**
 * Single source of truth for feature gating.
 * Returns the access rights matrix for a given user.
 */
export async function getUserPlan(userId: string): Promise<AccessRights> {
  if (!userId) return DEFAULT_FREE_ACCESS;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Subscription: {
          include: {
            Plan: true,
          },
        },
      },
    });

    if (!user) return DEFAULT_FREE_ACCESS;

    // Check if they have an active subscription
    const sub = user.Subscription;
    if (sub && sub.status === "ACTIVE" && sub.Plan) {
      // If there's an end date, ensure it hasn't expired past the 7-day grace period
      if (sub.endDate) {
        const gracePeriodEnd = new Date(sub.endDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
        if (gracePeriodEnd < new Date()) {
          return DEFAULT_FREE_ACCESS; 
        }
      }

      return {
        plan: sub.Plan.slug,
        tradeLimit: sub.Plan.tradeLimit,
        brokerSync: sub.Plan.brokerSync,
        analytics: sub.Plan.analytics,
        reports: sub.Plan.reports,
        exports: sub.Plan.exports,
        mentorAccess: sub.Plan.mentorAccess,
      };
    }

    // Fallback: Check the old user.plan enum for backward compatibility
    // if no formal subscription record exists yet
    if (user.plan === "PRO") {
      return {
        plan: "PRO",
        tradeLimit: 999999,
        brokerSync: true,
        analytics: true,
        reports: true,
        exports: true,
        mentorAccess: false,
      };
    } else if (user.plan === "MENTOR") {
      return {
        plan: "MENTORSHIP",
        tradeLimit: 999999,
        brokerSync: true,
        analytics: true,
        reports: true,
        exports: true,
        mentorAccess: true,
      };
    }

    return DEFAULT_FREE_ACCESS;
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return DEFAULT_FREE_ACCESS;
  }
}
