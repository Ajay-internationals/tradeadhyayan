import { prisma } from "@/lib/db";
import { rescheduleMentorshipSession } from "@/lib/session-booking";
import { NextResponse } from "next/server";
import { z } from "zod";
import { differenceInHours } from "date-fns";

const RescheduleSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

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
    const parsed = RescheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { startTime, endTime } = parsed.data;
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    const session = await prisma.mentorshipSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Clients can only reschedule before 12 hours
    if (userRole === "CLIENT") {
      const hoursUntilSession = differenceInHours(session.startTime, new Date());
      if (hoursUntilSession < 12) {
        return NextResponse.json(
          { error: "Cannot reschedule less than 12 hours before the session" },
          { status: 400 }
        );
      }

      // Clients can only reschedule their own sessions
      if (session.clientId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await rescheduleMentorshipSession({
      sessionId: params.sessionId,
      newStartTime: newStart,
      newEndTime: newEnd,
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
