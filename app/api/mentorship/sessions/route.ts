import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET — fetch sessions based on role (client/mentor/admin)
export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role"); // CLIENT, MENTOR, ADMIN
    const { searchParams } = new URL(req.url);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin query params
    const filterMentorId = searchParams.get("mentorId");
    const filterClientId = searchParams.get("clientId");
    const filterStatus = searchParams.get("status");
    const filterDate = searchParams.get("date"); // YYYY-MM-DD

    let where: any = {};

    if (userRole === "ADMIN") {
      // Admin can see all sessions, with optional filters
      if (filterMentorId) where.mentorId = filterMentorId;
      if (filterClientId) where.clientId = filterClientId;
      if (filterStatus) where.status = filterStatus;
      if (filterDate) {
        where.startTime = {
          gte: new Date(`${filterDate}T00:00:00+05:30`),
          lte: new Date(`${filterDate}T23:59:59+05:30`),
        };
      }
    } else if (userRole === "MENTOR") {
      // Mentor sees their sessions
      const mentor = await prisma.mentor.findUnique({ where: { userId } });
      if (!mentor) return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
      where.mentorId = mentor.id;
      if (filterStatus) where.status = filterStatus;
      if (filterDate) {
        where.startTime = {
          gte: new Date(`${filterDate}T00:00:00+05:30`),
          lte: new Date(`${filterDate}T23:59:59+05:30`),
        };
      }
    } else {
      // Client sees their own sessions
      where.clientId = userId;
      if (filterStatus) where.status = filterStatus;
      if (filterDate) {
        where.startTime = {
          gte: new Date(`${filterDate}T00:00:00+05:30`),
          lte: new Date(`${filterDate}T23:59:59+05:30`),
        };
      }
    }

    const sessions = await prisma.mentorshipSession.findMany({
      where,
      include: {
        Client: {
          select: { id: true, name: true, email: true },
        },
        MentorRef: {
          select: {
            id: true,
            name: true,
            email: true,
            User: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
