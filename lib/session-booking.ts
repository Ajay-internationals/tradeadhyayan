import { prisma } from "@/lib/db";
import { getGoogleCalendarClient } from "@/lib/google-calendar";

export async function createMentorshipGoogleMeetSession({
  clientId,
  mentorId,
  title,
  sessionType,
  startTime,
  endTime,
  bookedByRole,
  notes,
  customMeetLink,
}: {
  clientId: string;
  mentorId: string;
  title: string;
  sessionType: string;
  startTime: Date;
  endTime: Date;
  bookedByRole: "CLIENT" | "MENTOR" | "ADMIN";
  notes?: string;
  customMeetLink?: string;
}) {
  // Fetch mentor (with user info for email/name)
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: { User: true },
  });

  const client = await prisma.user.findUnique({
    where: { id: clientId },
  });

  if (!mentor || !client) {
    throw new Error("Mentor or client not found");
  }

  // Validate: no past bookings
  if (startTime < new Date()) {
    throw new Error("Cannot book a session in the past");
  }

  // Validate: no overlap with existing UPCOMING sessions for this mentor
  const overlap = await prisma.mentorshipSession.findFirst({
    where: {
      mentorId,
      status: "UPCOMING",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (overlap) {
    throw new Error("Mentor already has a session booked during this time slot");
  }

  // Try to create Google Calendar event (if mentor has connected their Calendar)
  let googleEventId: string | undefined;
  let googleCalendarLink: string | undefined;
  let googleMeetLink: string | undefined;

  try {
    const calendar = await getGoogleCalendarClient(mentor.userId);

    const requestBody: any = {
      summary: title,
      description:
        notes ||
        `Trade Adhyayan mentorship session between ${mentor.User.name} and ${client.name}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: [
        { email: mentor.User.email, displayName: mentor.User.name },
        { email: client.email, displayName: client.name },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    if (customMeetLink) {
      requestBody.location = customMeetLink;
    } else {
      requestBody.conferenceData = {
        createRequest: {
          requestId: `trade-adhyayan-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      };
    }

    const googleEvent = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: customMeetLink ? 0 : 1,
      sendUpdates: "all",
      requestBody,
    });

    googleEventId = googleEvent.data.id ?? undefined;
    googleCalendarLink = googleEvent.data.htmlLink ?? undefined;
    googleMeetLink = (customMeetLink || googleEvent.data.hangoutLink) ?? googleEvent.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video"
    )?.uri ?? undefined;
  } catch (err: any) {
    // If Google Calendar not connected, session is still created without Meet link
    console.warn("Google Calendar not available:", err.message);
    if (customMeetLink) {
      googleMeetLink = customMeetLink;
    }
  }

  // Create session in DB
  const session = await prisma.mentorshipSession.create({
    data: {
      clientId,
      mentorId,
      title,
      sessionType,
      startTime,
      endTime,
      bookedByRole,
      notes,
      googleEventId,
      googleCalendarLink,
      googleMeetLink,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      actorId: clientId,
      targetId: mentorId,
      activityType: "SESSION_BOOKED",
      description: `Mentorship session booked: ${title} on ${startTime.toLocaleDateString("en-IN")}`,
    },
  });

  return session;
}

export async function rescheduleMentorshipSession({
  sessionId,
  newStartTime,
  newEndTime,
}: {
  sessionId: string;
  newStartTime: Date;
  newEndTime: Date;
}) {
  const session = await prisma.mentorshipSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new Error("Session not found");
  if (session.status === "CANCELLED") throw new Error("Cannot reschedule a cancelled session");

  const mentor = await prisma.mentor.findUnique({ where: { id: session.mentorId } });

  // Update Google Calendar event if exists
  if (session.googleEventId && mentor) {
    try {
      const calendar = await getGoogleCalendarClient(mentor.userId);
      await calendar.events.patch({
        calendarId: "primary",
        eventId: session.googleEventId,
        sendUpdates: "all",
        requestBody: {
          start: { dateTime: newStartTime.toISOString(), timeZone: "Asia/Kolkata" },
          end: { dateTime: newEndTime.toISOString(), timeZone: "Asia/Kolkata" },
        },
      });
    } catch (err: any) {
      console.warn("Failed to update Google Calendar event:", err.message);
    }
  }

  return prisma.mentorshipSession.update({
    where: { id: sessionId },
    data: {
      startTime: newStartTime,
      endTime: newEndTime,
      status: "RESCHEDULED",
    },
  });
}

export async function cancelMentorshipSession({
  sessionId,
  reason,
}: {
  sessionId: string;
  reason?: string;
}) {
  const session = await prisma.mentorshipSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new Error("Session not found");
  if (session.status === "CANCELLED") throw new Error("Session already cancelled");

  const mentor = await prisma.mentor.findUnique({ where: { id: session.mentorId } });

  // Delete Google Calendar event
  if (session.googleEventId && mentor) {
    try {
      const calendar = await getGoogleCalendarClient(mentor.userId);
      await calendar.events.delete({
        calendarId: "primary",
        eventId: session.googleEventId,
        sendUpdates: "all",
      });
    } catch (err: any) {
      console.warn("Failed to delete Google Calendar event:", err.message);
    }
  }

  return prisma.mentorshipSession.update({
    where: { id: sessionId },
    data: {
      status: "CANCELLED",
      cancellationReason: reason || "Cancelled",
    },
  });
}
