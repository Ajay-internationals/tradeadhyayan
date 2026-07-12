import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerUser, loginUser } from "@/app/actions/auth";
import {
  getMentorshipOverview,
  submitReviewRequest,
  getMentorClients,
  getReviewQueue,
  submitMentorshipReview,
  getAdminOverview,
  addMentor,
  assignClientToMentor,
  setUserRole,
  addDbTrade,
  getTrades,
  deleteDbTrade
} from "@/app/actions/trades";
import { getDashboardMetrics } from "@/app/actions/dashboardMetrics";
import { getReportsData } from "@/app/actions/reportsMetrics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  console.log("=== API Test Core Actions ===");
  const logs: string[] = [];

  const runTest = async (name: string, fn: () => Promise<any>) => {
    logs.push(`Starting ${name}...`);
    try {
      const start = Date.now();
      const res = await fn();
      logs.push(`SUCCESS: ${name} finished in ${Date.now() - start}ms.`);
      return res;
    } catch (e: any) {
      logs.push(`ERROR in ${name}: ${e.message}`);
      console.error(`Error in ${name}:`, e);
      return null;
    }
  };

  const clientEmail = "test_client@example.com";
  const mentorEmail = "test_mentor@example.com";
  const authTestEmail = "test_auth_user@example.com";
  const authTestPassword = "TestPassword123!";

  // Clean up any existing test data to make the test repeatable
  await runTest("cleanup", async () => {
    // Delete test review requests/reviews first
    const client = await prisma.user.findUnique({ where: { email: clientEmail } });
    const mentor = await prisma.mentor.findUnique({ where: { email: mentorEmail } });
    const authUser = await prisma.user.findUnique({ where: { email: authTestEmail } });
    
    if (client) {
      await prisma.reviewRequest.deleteMany({ where: { clientId: client.id } });
      await prisma.mentorClient.deleteMany({ where: { clientId: client.id } });
    }
    if (mentor) {
      await prisma.mentorClient.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.reviewRequest.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.mentor.deleteMany({ where: { email: mentorEmail } });
    }
    if (authUser) {
      await prisma.trade.deleteMany({ where: { userId: authUser.id } });
    }
    // Delete user accounts
    await prisma.user.deleteMany({
      where: { email: { in: [clientEmail, mentorEmail, authTestEmail] } }
    });
    logs.push("Cleanup completed.");
  });

  // ==========================================
  // AUTHENTICATION & REGISTRATION TESTS
  // ==========================================

  // 1. Register User (Signup)
  await runTest("Register User (Signup)", async () => {
    const signupRes = await registerUser("Test Auth User", authTestEmail, authTestPassword, "CLIENT");
    if (!signupRes.success) {
      throw new Error(`Signup failed: ${signupRes.error}`);
    }
    logs.push(`User registration successful for ${signupRes.email}`);
  });

  // 2. Login User (Correct password)
  await runTest("Login User (Correct Password)", async () => {
    const loginRes = await loginUser(authTestEmail, authTestPassword);
    if (!loginRes.success) {
      throw new Error(`Login failed: ${loginRes.error}`);
    }
    logs.push(`User login successful (Role: ${loginRes.role})`);
  });

  // 3. Login User (Wrong password)
  await runTest("Login User (Wrong Password)", async () => {
    const loginRes = await loginUser(authTestEmail, "WrongPassword!");
    if (loginRes.success) {
      throw new Error("Login succeeded unexpectedly with incorrect password");
    }
    logs.push("User login rejected incorrect password as expected.");
  });

  // ==========================================
  // TRADES & CRUD TESTS
  // ==========================================

  // 4. Create Trade (Manual Add)
  let createdTrade: any = null;
  await runTest("Create Trade", async () => {
    createdTrade = await addDbTrade(authTestEmail, {
      asset: "TCS",
      type: "BUY",
      strategy: "Support Breakout",
      emotion: "CALM",
      quantity: 10,
      entryPrice: 3400,
      exitPrice: 3450,
      charges: 20,
      netPnl: 480,
      rr: 2.5,
      notes: "Executed perfectly according to plan."
    });
    if (!createdTrade) {
      throw new Error("Failed to add trade");
    }
    logs.push(`Trade logged successfully. Trade ID: ${createdTrade.id}, P&L: ${createdTrade.pnl}`);
  });

  // 5. Fetch Trades
  await runTest("Get Trades", async () => {
    const trades = await getTrades(authTestEmail);
    if (!trades || trades.length === 0) {
      throw new Error("No trades found for test user");
    }
    logs.push(`Successfully fetched ${trades.length} trade(s). First asset: ${(trades[0] as any).asset ?? (trades[0] as any).id}`);
  });

  // ==========================================
  // METRICS & DASHBOARD TESTS
  // ==========================================

  // 6. Get Dashboard Metrics
  await runTest("Get Dashboard Metrics", async () => {
    const metrics = await getDashboardMetrics(authTestEmail);
    if (!metrics) {
      throw new Error("Dashboard metrics returned null");
    }
    logs.push(`Fetched dashboard metrics successfully. Net P&L: ${metrics.netPnl}`);
  });

  // 7. Get Reports Data
  await runTest("Get Reports Data", async () => {
    const reports = await getReportsData(authTestEmail);
    if (!reports) {
      throw new Error("Reports data returned null");
    }
    logs.push(`Fetched reports data successfully. Win rate: ${reports.winRate}%, Trades count: ${reports.totalTrades}`);
  });

  // ==========================================
  // MENTORSHIP & GENERAL MANAGEMENT TESTS
  // ==========================================

  // 8. Set user roles / create client user
  let clientUser: any = null;
  await runTest("setUserRole (Client)", async () => {
    clientUser = await setUserRole(clientEmail, "CLIENT");
    logs.push(`Client created with ID: ${clientUser.id}`);
  });

  // 9. Add Mentor
  let mentorProfile: any = null;
  await runTest("addMentor", async () => {
    mentorProfile = await addMentor({
      name: "Test Mentor",
      email: mentorEmail,
      phone: "1234567890",
      designation: "Senior Strategy Mentor",
      bio: "An experienced mentor.",
      experience: "8 Years",
      specialization: "Option Buying",
      capacity: 5,
      payoutShare: 45.0
    });
    logs.push(`Mentor created with ID: ${mentorProfile.id}, User ID: ${mentorProfile.userId}`);
  });

  // 10. Assign Client to Mentor
  await runTest("assignClientToMentor", async () => {
    const assignment = await assignClientToMentor(clientUser.id, mentorProfile.id);
    logs.push(`Assigned Client ${clientUser.id} to Mentor ${mentorProfile.id}`);
    return assignment;
  });

  // 11. Get Mentorship Overview (Client side)
  await runTest("getMentorshipOverview", async () => {
    const overview = await getMentorshipOverview(clientEmail);
    logs.push(`Overview mentor name: ${overview.assignedMentor?.name}`);
    logs.push(`Overview requests count: ${overview.reviewRequests.length}`);
    return overview;
  });

  // 12. Submit Review Request (Client side)
  let reviewRequest: any = null;
  await runTest("submitReviewRequest", async () => {
    reviewRequest = await submitReviewRequest(
      clientEmail,
      [createdTrade ? createdTrade.id : "test_trade_1"],
      "Please review my execution on these trades",
      8
    );
    logs.push(`ReviewRequest created with ID: ${reviewRequest.id}`);
    return reviewRequest;
  });

  // 13. Get Mentor Clients
  await runTest("getMentorClients", async () => {
    const clients = await getMentorClients(mentorEmail);
    logs.push(`Mentor has ${clients.length} active clients.`);
    return clients;
  });

  // 14. Get Review Queue
  await runTest("getReviewQueue", async () => {
    const queue = await getReviewQueue(mentorEmail);
    logs.push(`Mentor queue length: ${queue.length}`);
    return queue;
  });

  // 15. Submit Mentorship Review
  await runTest("submitMentorshipReview", async () => {
    const review = await submitMentorshipReview(
      mentorEmail,
      reviewRequest.id,
      {
        executionScore: 8,
        riskScore: 7,
        psychologyScore: 9,
        disciplineScore: 8
      },
      {
        strengths: "Good stop loss placement.",
        improvements: "Exit early on targets.",
        mistakesObserved: "None",
        actionPlan: "Keep repeating this next week.",
        nextWeekFocus: "Focus on risk-reward ratio.",
        mentorRemark: "Great job overall!"
      }
    );
    logs.push(`MentorshipReview created with ID: ${review.id}`);
    return review;
  });

  // 16. Get Admin Overview
  await runTest("getAdminOverview", async () => {
    const adminData = await getAdminOverview();
    logs.push(`Admin Overview mentors count: ${adminData.mentors.length}`);
    logs.push(`Admin Overview unassigned clients count: ${adminData.unassignedClients.length}`);
    logs.push(`Admin Overview review requests count: ${adminData.reviewRequests.length}`);
    return adminData;
  });

  return NextResponse.json({ success: true, logs });
}
