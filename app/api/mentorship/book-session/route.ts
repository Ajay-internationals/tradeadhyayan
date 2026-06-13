import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMentorshipGoogleMeetSession } from "@/lib/session-booking";
import { z } from "zod";

const BookSessionSchema = z.object({
  mentorId: z.string().min(1),
  clientId: z.string().optional(),
  title: z.string().optional(),
  sessionType: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
  googleMeetLink: z.string().optional(), // Custom meeting link
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role") || "CLIENT";
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BookSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { mentorId: bodyMentorId, clientId: bodyClientId, title, sessionType, startTime, endTime, notes, googleMeetLink } = parsed.data;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Rule: Cannot book/request a session in the past
    if (start < new Date()) {
      return NextResponse.json(
        { error: "Cannot book or request a session in the past" },
        { status: 400 }
      );
    }

    if (userRole === "CLIENT") {
      // Client is requesting a session with their assigned mentor
      const assignment = await prisma.mentorClient.findFirst({
        where: { clientId: userId, mentorId: bodyMentorId, status: "ACTIVE" },
      });

      if (!assignment) {
        return NextResponse.json(
          { error: "You can only request sessions with your assigned mentor" },
          { status: 403 }
        );
      }

      // Create session in DB as REQUESTED (no overlap check or calendar sync needed for requests)
      const session = await prisma.mentorshipSession.create({
        data: {
          clientId: userId,
          mentorId: bodyMentorId,
          title: title || "Requested 1:1 Mentorship Session",
          sessionType: sessionType || "1:1",
          startTime: start,
          endTime: end,
          bookedByRole: "CLIENT",
          status: "REQUESTED",
          notes,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          actorId: userId,
          targetId: bodyMentorId,
          activityType: "SESSION_BOOKED",
          description: `Client requested mentorship session: ${title || "Requested 1:1 Mentorship Session"} on ${start.toLocaleDateString("en-IN")}`,
        },
      });

      return NextResponse.json({ success: true, session });
    } else {
      // Mentor or Admin is scheduling a session directly
      let targetClientId = bodyClientId;
      let targetMentorId = bodyMentorId;

      if (userRole === "MENTOR") {
        const mentor = await prisma.mentor.findUnique({ where: { userId } });
        if (!mentor) {
          return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }
        targetMentorId = mentor.id;

        // Verify assignment
        if (targetClientId) {
          const assignment = await prisma.mentorClient.findFirst({
            where: { clientId: targetClientId, mentorId: targetMentorId, status: "ACTIVE" },
          });
          if (!assignment) {
            return NextResponse.json(
              { error: "This client is not assigned to you" },
              { status: 403 }
            );
          }
        } else {
          return NextResponse.json({ error: "clientId is required for mentors" }, { status: 400 });
        }
      } else if (userRole === "ADMIN") {
        if (!targetClientId) {
          return NextResponse.json({ error: "clientId is required for admins" }, { status: 400 });
        }
      }

      const session = await createMentorshipGoogleMeetSession({
        clientId: targetClientId as string,
        mentorId: targetMentorId,
        title: title || "1:1 Mentorship Session",
        sessionType: sessionType || "1:1",
        startTime: start,
        endTime: end,
        bookedByRole: userRole as "MENTOR" | "ADMIN",
        notes,
        customMeetLink: googleMeetLink,
      });

      return NextResponse.json({ success: true, session });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
