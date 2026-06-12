import { prisma } from "@/lib/db";
import { cancelMentorshipSession } from "@/lib/session-booking";
import { NextResponse } from "next/server";
import { differenceInHours } from "date-fns";

export async function PATCH(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role") || "CLIENT";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const reason = body?.reason || "Cancelled";

    const session = await prisma.mentorshipSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Clients can only cancel before 12 hours
    if (userRole === "CLIENT") {
      const hoursUntilSession = differenceInHours(session.startTime, new Date());
      if (hoursUntilSession < 12) {
        return NextResponse.json(
          { error: "Cannot cancel less than 12 hours before the session" },
          { status: 400 }
        );
      }

      // Clients can only cancel their own sessions
      if (session.clientId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await cancelMentorshipSession({
      sessionId: params.sessionId,
      reason,
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
