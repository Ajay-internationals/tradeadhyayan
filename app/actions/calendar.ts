"use server";

import { prisma } from "@/lib/db";

export interface CalendarEventData {
  id: string;
  eventType: string; // TRADING_PLAN, REVIEW, GOAL, MENTOR, EVENT, REMINDER
  title: string;
  startTime: string;
  status: string; // UPCOMING, COMPLETED
}

// Removed MOCK_EVENTS

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
      return [];
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


    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return { success: false, error: error.message };
  }
}
