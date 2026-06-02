import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getMentorshipOverview,
  submitReviewRequest,
  getMentorClients,
  getReviewQueue,
  submitMentorshipReview,
  getAdminOverview,
  addMentor,
  assignClientToMentor,
  setUserRole
} from "@/app/actions/trades";

export async function GET(request: Request) {
  console.log("=== API Test Mentorship Server Actions ===");
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

  // Clean up any existing test data to make the test repeatable
  await runTest("cleanup", async () => {
    // Delete test review requests/reviews first
    const client = await prisma.user.findUnique({ where: { email: clientEmail } });
    const mentor = await prisma.mentor.findUnique({ where: { email: mentorEmail } });
    
    if (client) {
      await prisma.reviewRequest.deleteMany({ where: { clientId: client.id } });
      await prisma.mentorClient.deleteMany({ where: { clientId: client.id } });
    }
    if (mentor) {
      await prisma.mentorClient.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.reviewRequest.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.mentor.delete({ where: { id: mentor.id } });
    }
    // Delete user accounts
    await prisma.user.deleteMany({
      where: { email: { in: [clientEmail, mentorEmail] } }
    });
    logs.push("Cleanup completed.");
  });

  // 1. Set user roles / create user
  let clientUser: any = null;
  await runTest("setUserRole (Client)", async () => {
    clientUser = await setUserRole(clientEmail, "CLIENT");
    logs.push(`Client created with ID: ${clientUser.id}`);
  });

  // 2. Add Mentor
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

  // 3. Assign Client to Mentor
  await runTest("assignClientToMentor", async () => {
    const assignment = await assignClientToMentor(clientUser.id, mentorProfile.id);
    logs.push(`Assigned Client ${clientUser.id} to Mentor ${mentorProfile.id}`);
    return assignment;
  });

  // 4. Get Mentorship Overview (Client side)
  await runTest("getMentorshipOverview", async () => {
    const overview = await getMentorshipOverview(clientEmail);
    logs.push(`Overview mentor name: ${overview.assignedMentor?.name}`);
    logs.push(`Overview requests count: ${overview.reviewRequests.length}`);
    return overview;
  });

  // 5. Submit Review Request (Client side)
  let reviewRequest: any = null;
  await runTest("submitReviewRequest", async () => {
    reviewRequest = await submitReviewRequest(
      clientEmail,
      ["test_trade_1", "test_trade_2"],
      "Please review my execution on these trades",
      8
    );
    logs.push(`ReviewRequest created with ID: ${reviewRequest.id}`);
    return reviewRequest;
  });

  // 6. Get Mentor Clients
  await runTest("getMentorClients", async () => {
    const clients = await getMentorClients(mentorEmail);
    logs.push(`Mentor has ${clients.length} active clients.`);
    return clients;
  });

  // 7. Get Review Queue
  await runTest("getReviewQueue", async () => {
    const queue = await getReviewQueue(mentorEmail);
    logs.push(`Mentor queue length: ${queue.length}`);
    return queue;
  });

  // 8. Submit Mentorship Review
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

  // 9. Get Admin Overview
  await runTest("getAdminOverview", async () => {
    const adminData = await getAdminOverview();
    logs.push(`Admin Overview mentors count: ${adminData.mentors.length}`);
    logs.push(`Admin Overview unassigned clients count: ${adminData.unassignedClients.length}`);
    logs.push(`Admin Overview review requests count: ${adminData.reviewRequests.length}`);
    return adminData;
  });

  return NextResponse.json({ success: true, logs });
}
