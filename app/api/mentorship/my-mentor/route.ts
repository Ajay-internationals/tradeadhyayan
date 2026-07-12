import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/subscription/access";

// GET /api/mentorship/my-mentor?userId=xxx — returns assigned mentorId for client
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const access = await getUserPlan(userId);
  if (!access.mentorAccess) {
    return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  const assignment = await prisma.mentorClient.findUnique({
    where: { clientId: userId },
    include: { Mentor: { select: { id: true, name: true, email: true } } }
  });

  if (!assignment) return NextResponse.json({ mentorId: null, mentor: null });

  return NextResponse.json({
    mentorId: assignment.mentorId,
    mentor: assignment.Mentor,
  });
}
