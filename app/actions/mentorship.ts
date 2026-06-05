"use server";

import { PrismaClient } from "@prisma/client";
import { getOrCreateUser } from "./trades"; // reuse the session logic

const prisma = new PrismaClient();

// ─── CLIENT ACTIONS ──────────────────────────────────────────────────────────

export async function getClientMentorshipOverview(email: string) {
  const user = await getOrCreateUser(email);

  const assignment = await prisma.mentorClient.findUnique({
    where: { clientId: user.id },
    include: {
      Mentor: {
        include: { User: true }
      }
    }
  });

  const reviewRequests = await prisma.reviewRequest.findMany({
    where: { clientId: user.id },
    include: { MentorshipReview: true },
    orderBy: { submittedAt: "desc" }
  });

  const actionPlans = await prisma.clientActionPlan.findMany({
    where: { clientId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });

  const sessions = await prisma.mentorSession.findMany({
    where: { clientId: user.id, scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 1
  });

  const activities = await prisma.activityLog.findMany({
    where: { targetId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  // Calculate scores
  let currentScore = 0;
  let lastReviewDate = null;
  let scoreBreakdown = { execution: 0, risk: 0, psychology: 0, discipline: 0 };
  let mentorObservation = null;

  const completedReviews = reviewRequests.filter(r => r.status === "COMPLETED" && r.MentorshipReview);
  if (completedReviews.length > 0) {
    const latest = completedReviews[0].MentorshipReview;
    if (latest) {
      currentScore = latest.overallScore;
    lastReviewDate = latest.createdAt;
    scoreBreakdown = {
      execution: latest.executionScore,
      risk: latest.riskScore,
      psychology: latest.psychologyScore,
      discipline: latest.disciplineScore
    };
      mentorObservation = {
        strengths: latest.strengths,
        improvements: latest.improvements,
        focus: latest.nextWeekFocus
      };
    }
  }

  const pendingCount = reviewRequests.filter(r => r.status === "PENDING").length;

  return {
    assignedMentor: assignment?.Mentor || null,
    currentScore,
    scoreBreakdown,
    lastReviewDate,
    pendingReviewsCount: pendingCount,
    nextSession: sessions[0] || null,
    activeActionItems: actionPlans.length,
    mentorObservation,
    recentActivity: activities,
    actionPlans
  };
}

export async function submitClientReviewRequest(email: string, tradeIds: string[], notes: string) {
  const user = await getOrCreateUser(email);

  const assignment = await prisma.mentorClient.findUnique({
    where: { clientId: user.id }
  });

  if (!assignment) throw new Error("No mentor assigned.");

  const request = await prisma.reviewRequest.create({
    data: {
      id: `rr_${Date.now()}`,
      clientId: user.id,
      mentorId: assignment.mentorId,
      selectedTradeIds: tradeIds,
      clientNotes: notes,
      status: "PENDING"
    }
  });

  await prisma.activityLog.create({
    data: {
      actorId: user.id,
      targetId: user.id,
      activityType: "REVIEW_SUBMITTED",
      description: "Submitted a new review request."
    }
  });

  return request;
}

// ─── MENTOR ACTIONS ──────────────────────────────────────────────────────────

export async function getMentorDashboard(email: string) {
  const user = await getOrCreateUser(email);
  const mentor = await prisma.mentor.findUnique({ where: { userId: user.id } });
  
  if (!mentor) throw new Error("Not a mentor.");

  const clients = await prisma.mentorClient.findMany({
    where: { mentorId: mentor.id, status: "ACTIVE" },
    include: {
      Client: {
        include: {
          MentorshipReview_AsClient: { orderBy: { createdAt: "desc" }, take: 1 },
          Trade: true
        }
      }
    }
  });

  const reviewRequests = await prisma.reviewRequest.findMany({
    where: { mentorId: mentor.id },
    include: { Client: true, MentorshipReview: true },
    orderBy: { submittedAt: "desc" }
  });

  const sessions = await prisma.mentorSession.findMany({
    where: { mentorId: mentor.id, scheduledAt: { gte: new Date() } },
    include: { Client: true },
    orderBy: { scheduledAt: "asc" }
  });

  return {
    mentor,
    clients,
    reviewRequests,
    sessions
  };
}

export async function submitMentorshipReviewScore(
  mentorEmail: string,
  reviewRequestId: string,
  scores: { execution: number; risk: number; psychology: number; discipline: number },
  feedback: { strengths: string; improvements: string; actionPlan: string; focus: string }
) {
  const user = await getOrCreateUser(mentorEmail);
  const mentor = await prisma.mentor.findUnique({ where: { userId: user.id } });
  if (!mentor) throw new Error("Not a mentor.");

  const request = await prisma.reviewRequest.findUnique({ where: { id: reviewRequestId } });
  if (!request) throw new Error("Request not found.");

  // Scoring Formula
  const overall = (scores.execution * 0.3) + (scores.risk * 0.3) + (scores.psychology * 0.2) + (scores.discipline * 0.2);

  const review = await prisma.mentorshipReview.create({
    data: {
      id: `rev_${Date.now()}`,
      reviewRequestId,
      clientId: request.clientId,
      mentorId: mentor.id,
      executionScore: scores.execution,
      riskScore: scores.risk,
      psychologyScore: scores.psychology,
      disciplineScore: scores.discipline,
      overallScore: overall,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      actionPlan: feedback.actionPlan,
      nextWeekFocus: feedback.focus
    }
  });

  await prisma.reviewRequest.update({
    where: { id: reviewRequestId },
    data: { status: "COMPLETED", completedAt: new Date() }
  });

  if (feedback.actionPlan) {
    await prisma.clientActionPlan.create({
      data: {
        clientId: request.clientId,
        mentorId: mentor.id,
        currentFocus: feedback.focus,
        weeklyRules: "Follow strategy rules", // Default for now
        avoidList: feedback.improvements,
        nextWeekGoal: "Improve execution score",
        status: "ACTIVE"
      }
    });
  }

  await prisma.activityLog.create({
    data: {
      actorId: mentor.id,
      targetId: request.clientId,
      activityType: "REVIEW_COMPLETED",
      description: "Mentor completed your review."
    }
  });

  return review;
}

// ─── ADMIN ACTIONS ──────────────────────────────────────────────────────────

export async function getAdminMentorshipDashboard() {
  const usersCount = await prisma.user.count();
  const mentors = await prisma.mentor.findMany({
    include: {
      MentorClient: { where: { status: "ACTIVE" } },
      ReviewRequest: { where: { status: "PENDING" } }
    }
  });

  const activeClients = await prisma.mentorClient.count({ where: { status: "ACTIVE" } });
  const pendingReviews = await prisma.reviewRequest.count({ where: { status: "PENDING" } });
  const completedReviews = await prisma.reviewRequest.count({ where: { status: "COMPLETED" } });
  
  // Logic: 4999 per client
  const monthlyRevenue = activeClients * 4999;

  let totalCapacity = 0;
  let usedCapacity = 0;
  mentors.forEach(m => {
    totalCapacity += m.capacity;
    usedCapacity += m.MentorClient.length;
  });

  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return {
    kpis: {
      totalUsers: usersCount,
      totalMentors: mentors.length,
      activeClients,
      pendingReviews,
      completedReviews,
      monthlyRevenue,
      capacityUsedPercent: totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0
    },
    mentors,
    activities
  };
}
