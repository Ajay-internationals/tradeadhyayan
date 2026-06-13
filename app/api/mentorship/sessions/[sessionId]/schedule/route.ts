import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getGoogleCalendarClient } from "@/lib/google-calendar";

const ScheduleSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  googleMeetLink: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role"); // MENTOR or ADMIN

    if (!userId || (userRole !== "MENTOR" && userRole !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { startTime, endTime, googleMeetLink } = parsed.data;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate: no past scheduling
    if (start < new Date()) {
      return NextResponse.json(
        { error: "Cannot schedule a session in the past" },
        { status: 400 }
      );
    }

    const session = await prisma.mentorshipSession.findUnique({
      where: { id: params.sessionId },
      include: {
        Client: { select: { id: true, name: true, email: true } },
        MentorRef: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true,
            User: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session request not found" }, { status: 404 });
    }

    // Double check: if user is MENTOR, verify it is their session
    if (userRole === "MENTOR") {
      const mentor = await prisma.mentor.findUnique({ where: { userId } });
      if (!mentor || session.mentorId !== mentor.id) {
        return NextResponse.json({ error: "Forbidden: You are not the assigned mentor" }, { status: 403 });
      }
    }

    // Validate: no overlap with other UPCOMING sessions for this mentor
    const overlap = await prisma.mentorshipSession.findFirst({
      where: {
        mentorId: session.mentorId,
        status: "UPCOMING",
        id: { not: params.sessionId },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Mentor already has an upcoming session booked during this time slot" },
        { status: 400 }
      );
    }

    let finalMeetLink = googleMeetLink;
    let googleEventId = null;
    let googleCalendarLink = null;

    // Try Google Calendar event creation if no custom link is provided
    if (!finalMeetLink) {
      try {
        const calendar = await getGoogleCalendarClient(session.MentorRef.userId);
        const googleEvent = await calendar.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          sendUpdates: "all",
          requestBody: {
            summary: session.title,
            description: session.notes || `Trade Adhyayan mentorship session`,
            start: {
              dateTime: start.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            end: {
              dateTime: end.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            attendees: [
              { email: session.MentorRef.User.email, displayName: session.MentorRef.User.name },
              { email: session.Client.email, displayName: session.Client.name },
            ],
            conferenceData: {
              createRequest: {
                requestId: `trade-adhyayan-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                conferenceSolutionKey: {
                  type: "hangoutsMeet",
                },
              },
            },
          },
        });

        googleEventId = googleEvent.data.id ?? null;
        googleCalendarLink = googleEvent.data.htmlLink ?? null;
        finalMeetLink =
          googleEvent.data.hangoutLink ??
          googleEvent.data.conferenceData?.entryPoints?.find(
            (e) => e.entryPointType === "video"
          )?.uri ??
          undefined;
      } catch (err: any) {
        console.warn("Failed to create Google Calendar event for scheduling:", err.message);
      }
    } else {
      // If a custom meeting link is provided, optionally create a calendar event with that link as location
      try {
        const calendar = await getGoogleCalendarClient(session.MentorRef.userId);
        const googleEvent = await calendar.events.insert({
          calendarId: "primary",
          sendUpdates: "all",
          requestBody: {
            summary: session.title,
            description: session.notes || `Trade Adhyayan mentorship session`,
            location: finalMeetLink,
            start: {
              dateTime: start.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            end: {
              dateTime: end.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            attendees: [
              { email: session.MentorRef.User.email, displayName: session.MentorRef.User.name },
              { email: session.Client.email, displayName: session.Client.name },
            ],
          },
        });

        googleEventId = googleEvent.data.id ?? null;
        googleCalendarLink = googleEvent.data.htmlLink ?? null;
      } catch (err: any) {
        console.warn("Failed to create Google Calendar event with custom location:", err.message);
      }
    }

    const updated = await prisma.mentorshipSession.update({
      where: { id: params.sessionId },
      data: {
        startTime: start,
        endTime: end,
        googleMeetLink: finalMeetLink || null,
        googleEventId,
        googleCalendarLink,
        status: "UPCOMING",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: userId,
        targetId: session.clientId,
        activityType: "SESSION_BOOKED",
        description: `Mentorship session scheduled: ${session.title} for ${start.toLocaleDateString("en-IN")}`,
      },
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
