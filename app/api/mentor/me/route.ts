import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/mentor/me?email=xxx — returns userId + mentorId for the logged-in mentor
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const mentor = await prisma.mentor.findFirst({
    where: { OR: [{ email }, { userId: user.id }] }
  });

  return NextResponse.json({
    userId: user.id,
    mentorId: mentor?.id || null,
    name: user.name,
    email: user.email,
    isMentor: !!mentor,
  });
}
