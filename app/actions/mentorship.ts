"use server";

import { prisma } from "@/lib/db";
import { getOrCreateUser } from "./trades"; // reuse the session logic


// Helper to calculate trader stats
function calculateTraderStats(trades: any[]) {
  let wins = 0;
  let totalWinAmount = 0;
  let losses = 0;
  let totalLossAmount = 0;
  let netPnl = 0;
  let peak = 0;
  let maxDrawdown = 0;

  const sorted = [...trades].sort((a,b) => new Date(a.exitTime || a.entryTime).getTime() - new Date(b.exitTime || b.entryTime).getTime());
  
  let runningPnl = 0;
  for (const t of sorted) {
    const pnl = t.netPnl || t.pnl || 0;
    if (pnl > 0) {
      wins++;
      totalWinAmount += pnl;
    } else if (pnl < 0) {
      losses++;
      totalLossAmount += Math.abs(pnl);
    }
    netPnl += pnl;
    
    runningPnl += pnl;
    if (runningPnl > peak) peak = runningPnl;
    const drawdown = peak - runningPnl;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const avgWin = wins > 0 ? totalWinAmount / wins : 0;
  const avgLoss = losses > 0 ? totalLossAmount / losses : 0;
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : (totalWinAmount > 0 ? 999 : 0);
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0;
  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0; // rough approximation

  // Calculate mistake rate
  const tradesWithMistakes = trades.filter(t => t.tags && Array.isArray(t.tags) && t.tags.length > 0).length;
  const mistakeRate = totalTrades > 0 ? (tradesWithMistakes / totalTrades) * 100 : 0;

  return { winRate, profitFactor, riskReward, maxDrawdown: maxDrawdownPercent, totalTrades, netPnl, mistakeRate };
}

// --- CLIENT ACTIONS ----------------------------------------------------------

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

  // Calculate trades shared and completed reviews counts dynamically
  let tradesSharedCount = 0;
  reviewRequests.forEach(r => {
    tradesSharedCount += r.selectedTradeIds?.length || 0;
  });
  const reviewedCount = completedReviews.length;

  // Fetch details for all completed reviews to display real trade history
  const completedReviewsData = [];
  for (const req of completedReviews) {
    if (!req.MentorshipReview) continue;
    
    let symbol = "N/A";
    let direction = "LONG";
    if (req.selectedTradeIds && req.selectedTradeIds.length > 0) {
      const firstTrade = await prisma.trade.findUnique({
        where: { id: req.selectedTradeIds[0] }
      });
      if (firstTrade) {
        symbol = firstTrade.symbol;
        direction = firstTrade.direction;
      }
    }
    
    completedReviewsData.push({
      id: req.id,
      date: req.completedAt || req.submittedAt,
      symbol,
      type: direction,
      score: req.MentorshipReview.overallScore,
      desc: req.MentorshipReview.strengths || "Completed review with no strength notes."
    });
  }

  // Fetch details for pending reviews
  const pendingReviewsData = [];
  const pendingReqs = reviewRequests.filter(r => r.status === "PENDING" || r.status === "IN_REVIEW");
  for (const req of pendingReqs) {
    let symbol = "N/A";
    let direction = "LONG";
    if (req.selectedTradeIds && req.selectedTradeIds.length > 0) {
      const firstTrade = await prisma.trade.findUnique({
        where: { id: req.selectedTradeIds[0] }
      });
      if (firstTrade) {
        symbol = firstTrade.symbol;
        direction = firstTrade.direction;
      }
    }
    pendingReviewsData.push({
      id: req.id,
      date: req.submittedAt,
      symbol,
      type: direction,
      status: req.status
    });
  }

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
    actionPlans,
    tradesSharedCount,
    reviewedCount,
    completedReviewsData,
    pendingReviewsData
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
      id: crypto.randomUUID(),
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

// --- MENTOR ACTIONS ----------------------------------------------------------

export async function getMentorDashboard(email: string) {
  const user = await getOrCreateUser(email);
  
  // Try email-based lookup first, then fall back to userId-based lookup
  let mentor = await prisma.mentor.findFirst({
    where: {
      OR: [
        { email: user.email },
        { userId: user.id }
      ]
    }
  });
  
  if (!mentor) throw new Error(`No mentor profile found for email: ${user.email}. Please contact admin to set up your mentor account.`);

  const rawClients = await prisma.mentorClient.findMany({
    where: { mentorId: mentor.id, status: "ACTIVE" },
    include: {
      Client: {
        include: {
          MentorshipReview_AsClient: { orderBy: { createdAt: "desc" }, take: 8 },
          ReviewRequest_AsClient: { where: { status: "PENDING" } },
          Trade: { where: { status: "CLOSED" } },
          Mistake: true
        }
      }
    }
  });

  // Calculate advanced stats for each client
  let sumScores = 0;
  let clientsWithScores = 0;
  
  const clients = rawClients.map(mc => {
    const trades = mc.Client.Trade || [];
    const stats = calculateTraderStats(trades);
    
    // Most used strategy logic (rough approximation from tags)
    let mostUsedStrategy = "Price Action";
    const tagCounts: Record<string, number> = {};
    trades.forEach(t => {
      if (t.tags && Array.isArray(t.tags)) {
        (t.tags as any[]).forEach(tag => {
          if (typeof tag === 'string') {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    if (Object.keys(tagCounts).length > 0) {
      mostUsedStrategy = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b);
    }

    const lastReview = mc.Client.MentorshipReview_AsClient[0];
    const currentScore = lastReview ? lastReview.overallScore : 0;
    
    if (currentScore > 0) {
      sumScores += currentScore;
      clientsWithScores++;
    }

    const performanceTrend = [...mc.Client.MentorshipReview_AsClient]
      .reverse()
      .map((r, i) => ({ name: `W${i+1}`, score: r.overallScore }));

    // Dynamically calculate top mistakes for the client from database records
    const clientMistakes = mc.Client.Mistake || [];
    const totalMistakes = clientMistakes.length;
    const mistakeCounts: Record<string, number> = {};
    clientMistakes.forEach(m => {
      mistakeCounts[m.mistakeType] = (mistakeCounts[m.mistakeType] || 0) + 1;
    });

    let topMistakes = [
      { name: "Overtrading", percent: 0 },
      { name: "Early Exit", percent: 0 },
      { name: "No Setup / Random", percent: 0 },
      { name: "Revenge Trading", percent: 0 }
    ];

    if (totalMistakes > 0) {
      const sortedMistakes = Object.entries(mistakeCounts)
        .map(([name, count]) => ({
          name,
          percent: Math.round((count / totalMistakes) * 100)
        }))
        .sort((a, b) => b.percent - a.percent);

      const resultMistakes = sortedMistakes.slice(0, 4);
      const existingNames = new Set(resultMistakes.map(m => m.name));
      const defaults = ["Overtrading", "Early Exit", "No Setup / Random", "Revenge Trading"];
      for (const d of defaults) {
        if (resultMistakes.length >= 4) break;
        if (!existingNames.has(d)) {
          resultMistakes.push({ name: d, percent: 0 });
        }
      }
      topMistakes = resultMistakes;
    }

    return {
      id: mc.Client.id,
      name: mc.Client.name,
      email: mc.Client.email,
      currentScore,
      winRate: stats.winRate,
      netPnl: stats.netPnl,
      totalTrades: stats.totalTrades,
      profitFactor: stats.profitFactor,
      riskReward: stats.riskReward,
      maxDrawdown: stats.maxDrawdown,
      mistakeRate: stats.mistakeRate,
      mostUsedStrategy,
      lastReviewDate: lastReview ? lastReview.createdAt : null,
      pendingReview: mc.Client.ReviewRequest_AsClient?.length > 0,
      status: mc.status,
      performanceTrend,
      topMistakes
    };
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
  
  const completedReviewsCount = reviewRequests.filter(r => r.status === "COMPLETED").length;
  const pendingReviewsCount = reviewRequests.filter(r => r.status === "PENDING" || r.status === "IN_REVIEW").length;
  const avgClientScore = clientsWithScores > 0 ? (sumScores / clientsWithScores) : 0;

  return {
    mentor,
    clients,
    reviewRequests,
    sessions,
    kpis: {
      assignedClients: clients.length,
      pendingReviews: pendingReviewsCount,
      completedReviews: completedReviewsCount,
      upcomingSessions: sessions.length,
      avgClientScore,
      clientProgress: 14 // Mocked for now, needs historical diff
    }
  };
}

export async function submitMentorshipReviewScore(
  mentorEmail: string,
  reviewRequestId: string,
  scores: { execution: number; risk: number; psychology: number; discipline: number },
  feedback: { strengths: string; improvements: string; actionPlan: string; focus: string }
) {
  const user = await getOrCreateUser(mentorEmail);
  const mentor = await prisma.mentor.findFirst({
    where: { OR: [{ email: user.email }, { userId: user.id }] }
  });
  if (!mentor) throw new Error("Not a mentor.");

  const request = await prisma.reviewRequest.findUnique({ where: { id: reviewRequestId } });
  if (!request) throw new Error("Request not found.");

  // Scoring Formula
  const overall = (scores.execution * 0.3) + (scores.risk * 0.3) + (scores.psychology * 0.2) + (scores.discipline * 0.2);

  const review = await prisma.mentorshipReview.create({
    data: {
      id: crypto.randomUUID(),
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

// --- ADMIN ACTIONS ----------------------------------------------------------

export async function getAdminMentorshipDashboard() {
  const usersCount = await prisma.user.count();
  const mentors = await prisma.mentor.findMany({
    include: {
      MentorClient: { where: { status: "ACTIVE" } },
      ReviewRequest: true,
      MentorshipReview: true,
      MentorSession: true
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

  // Calculate dynamic weekly completed vs pending reviews stats for the line chart (over 4 weeks)
  const now = new Date();
  const weeklyStats = [];
  for (let i = 3; i >= 0; i--) {
    const startOfWeek = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    const completed = await prisma.reviewRequest.count({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });
    
    const pending = await prisma.reviewRequest.count({
      where: {
        status: "PENDING",
        submittedAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });
    
    weeklyStats.push({
      name: `Week ${4 - i}`,
      completed,
      pending
    });
  }

  // Attach computed real metrics to each mentor
  const mappedMentors = mentors.map(m => {
    const reviewsDone = m.MentorshipReview.length;
    const totalScore = m.MentorshipReview.reduce((sum, r) => sum + r.overallScore, 0);
    const avgScore = reviewsDone > 0 ? totalScore / reviewsDone : 0;
    const sessionsCount = m.MentorSession.length;
    
    return {
      ...m,
      avgScore,
      reviewsDone,
      sessionsCount,
      retentionRate: 95 // approximate default retention
    };
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
    mentors: mappedMentors,
    activities,
    weeklyStats
  };
}
