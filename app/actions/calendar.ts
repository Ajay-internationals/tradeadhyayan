"use server";

import { prisma } from "@/lib/db";

export interface CalendarEventData {
  id: string;
  eventType: string; // TRADING_PLAN, REVIEW, GOAL, MENTOR, EVENT, REMINDER
  title: string;
  startTime: string;
  status: string; // UPCOMING, COMPLETED
}

// Mock fallback events matching mockup exactly
const MOCK_EVENTS: Omit<CalendarEventData, "id">[] = [
  { eventType: "TRADING_PLAN", title: "Trading Plan Review", startTime: "2024-05-01T09:00:00.000Z", status: "COMPLETED" },
  { eventType: "EVENT", title: "Weekly Market Analysis", startTime: "2024-05-03T08:30:00.000Z", status: "COMPLETED" },
  { eventType: "REVIEW", title: "Review Trades (May)", startTime: "2024-05-06T19:00:00.000Z", status: "COMPLETED" },
  { eventType: "GOAL", title: "Goal Check-in", startTime: "2024-05-07T20:00:00.000Z", status: "COMPLETED" },
  { eventType: "MENTOR", title: "Mentor Call", startTime: "2024-05-09T19:30:00.000Z", status: "COMPLETED" },
  { eventType: "EVENT", title: "Backtest Strategy", startTime: "2024-05-11T10:00:00.000Z", status: "COMPLETED" },
  { eventType: "TRADING_PLAN", title: "Trading Plan", startTime: "2024-05-12T09:00:00.000Z", status: "UPCOMING" },
  { eventType: "REVIEW", title: "Journal Review", startTime: "2024-05-12T20:00:00.000Z", status: "UPCOMING" },
  { eventType: "GOAL", title: "Risk Management Review", startTime: "2024-05-14T19:00:00.000Z", status: "UPCOMING" },
  { eventType: "GOAL", title: "Goal Progress Review", startTime: "2024-05-16T20:00:00.000Z", status: "UPCOMING" },
  { eventType: "MENTOR", title: "Mentor Review Submission", startTime: "2024-05-17T18:00:00.000Z", status: "UPCOMING" },
  { eventType: "REVIEW", title: "Review Losing Trades", startTime: "2024-05-20T19:00:00.000Z", status: "UPCOMING" },
  { eventType: "EVENT", title: "Strategy Backtest", startTime: "2024-05-22T10:00:00.000Z", status: "UPCOMING" },
  { eventType: "EVENT", title: "Monthly Reflection", startTime: "2024-05-24T19:30:00.000Z", status: "UPCOMING" },
  { eventType: "EVENT", title: "Economic Calendar Prep", startTime: "2024-05-28T09:00:00.000Z", status: "UPCOMING" },
  { eventType: "MENTOR", title: "Mentor Call", startTime: "2024-05-30T19:30:00.000Z", status: "UPCOMING" }
];

export async function getCalendarEvents(email: string): Promise<CalendarEventData[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        CalendarEvent: {
          orderBy: { startTime: "asc" }
        }
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.CalendarEvent.length === 0) {
      return MOCK_EVENTS.map((e, idx) => ({
        id: `mock_evt_${idx + 1}`,
        ...e
      }));
    }

    return user.CalendarEvent.map(e => ({
      id: e.id,
      eventType: e.eventType,
      title: e.title,
      startTime: e.startTime.toISOString(),
      status: e.status
    }));
  } catch (error) {
    console.error("Failed to load calendar events:", error);
    return [];
  }
}

export async function addCalendarEvent(
  email: string,
  eventData: { title: string; eventType: string; startTime: string }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        id: `evt_${Date.now()}`,
        userId: user.id,
        title: eventData.title,
        eventType: eventData.eventType,
        startTime: new Date(eventData.startTime),
        status: "UPCOMING"
      }
    });

    return { success: true, event: newEvent };
  } catch (error: any) {
    console.error("Failed to add calendar event:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleCalendarEventStatus(email: string, eventId: string) {
  try {
    if (eventId.startsWith("mock_evt_")) {
      return { success: true, isMock: true };
    }

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const nextStatus = event.status === "COMPLETED" ? "UPCOMING" : "COMPLETED";
    const updated = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: { status: nextStatus }
    });

    return { success: true, event: updated };
  } catch (error: any) {
    console.error("Failed to toggle event status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCalendarEvent(email: string, eventId: string) {
  try {
    if (eventId.startsWith("mock_evt_")) {
      return { success: true, isMock: true };
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return { success: false, error: error.message };
  }
}
