import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role") || "MENTOR";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only mentors and admins can mark sessions complete
    if (userRole === "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const mentorNotes = body?.mentorNotes || undefined;

    const session = await prisma.mentorshipSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot complete a cancelled session" },
        { status: 400 }
      );
    }

    // Verify mentor is owner if role is MENTOR
    if (userRole === "MENTOR") {
      const mentor = await prisma.mentor.findUnique({ where: { userId } });
      if (!mentor || session.mentorId !== mentor.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await prisma.mentorshipSession.update({
      where: { id: params.sessionId },
      data: {
        status: "COMPLETED",
        ...(mentorNotes ? { mentorNotes } : {}),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: userId,
        targetId: session.clientId,
        activityType: "SESSION_COMPLETED",
        description: `Mentorship session completed: ${session.title}`,
      },
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
