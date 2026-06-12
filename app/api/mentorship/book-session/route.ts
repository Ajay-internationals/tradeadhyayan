import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMentorshipGoogleMeetSession } from "@/lib/session-booking";
import { z } from "zod";

const BookSessionSchema = z.object({
  mentorId: z.string().min(1),
  title: z.string().optional(),
  sessionType: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const clientId = req.headers.get("x-user-id");
    if (!clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BookSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { mentorId, title, sessionType, startTime, endTime, notes } = parsed.data;

    // Rule: Client can only book with their assigned mentor
    const assignment = await prisma.mentorClient.findFirst({
      where: { clientId, mentorId, status: "ACTIVE" },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "You can only book sessions with your assigned mentor" },
        { status: 403 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Rule: Cannot book past date/time
    if (start < new Date()) {
      return NextResponse.json(
        { error: "Cannot book a session in the past" },
        { status: 400 }
      );
    }

    const session = await createMentorshipGoogleMeetSession({
      clientId,
      mentorId,
      title: title || "Trade Adhyayan 1:1 Mentorship Session",
      sessionType: sessionType || "1:1",
      startTime: start,
      endTime: end,
      bookedByRole: "CLIENT",
      notes,
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
