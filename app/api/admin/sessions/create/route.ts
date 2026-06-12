import { NextResponse } from "next/server";
import { createMentorshipGoogleMeetSession } from "@/lib/session-booking";
import { z } from "zod";

const AdminCreateSessionSchema = z.object({
  clientId: z.string().min(1),
  mentorId: z.string().min(1),
  title: z.string().optional(),
  sessionType: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

// Admin can create sessions for any mentor-client pair, overriding availability
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AdminCreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { clientId, mentorId, title, sessionType, startTime, endTime, notes } = parsed.data;

    const session = await createMentorshipGoogleMeetSession({
      clientId,
      mentorId,
      title: title || "Trade Adhyayan Admin Scheduled Session",
      sessionType: sessionType || "Admin Scheduled",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      bookedByRole: "ADMIN",
      notes,
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
