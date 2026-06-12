import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { addMinutes, format, parseISO, isBefore, isEqual } from "date-fns";

// GET — compute available booking slots for a mentor on a specific date
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");
    const date = searchParams.get("date"); // format: "YYYY-MM-DD"

    if (!mentorId || !date) {
      return NextResponse.json(
        { error: "mentorId and date are required" },
        { status: 400 }
      );
    }

    const selectedDate = parseISO(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday

    // Get mentor's availability slots for this day
    const availabilitySlots = await prisma.mentorAvailabilitySlot.findMany({
      where: { mentorId, dayOfWeek, isActive: true },
    });

    if (availabilitySlots.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get already booked sessions on this date
    const bookedSessions = await prisma.mentorshipSession.findMany({
      where: {
        mentorId,
        status: { in: ["UPCOMING", "RESCHEDULED"] },
        startTime: {
          gte: new Date(`${date}T00:00:00+05:30`),
          lte: new Date(`${date}T23:59:59+05:30`),
        },
      },
      select: { startTime: true, endTime: true },
    });

    const now = new Date();
    const slots: {
      startTime: string;
      endTime: string;
      label: string;
    }[] = [];

    for (const avail of availabilitySlots) {
      let current = new Date(`${date}T${avail.startTime}:00+05:30`);
      const end = new Date(`${date}T${avail.endTime}:00+05:30`);

      while (true) {
        const slotEnd = addMinutes(current, avail.slotSize);

        // Stop if slotEnd exceeds availability end
        if (slotEnd > end) break;

        // Skip past slots
        if (slotEnd <= now) {
          current = slotEnd;
          continue;
        }

        // Check if this slot overlaps with any booked session
        const isBooked = bookedSessions.some(
          (s) => current < s.endTime && slotEnd > s.startTime
        );

        if (!isBooked) {
          slots.push({
            startTime: current.toISOString(),
            endTime: slotEnd.toISOString(),
            label: `${format(current, "hh:mm a")} – ${format(slotEnd, "hh:mm a")}`,
          });
        }

        current = slotEnd;
      }
    }

    return NextResponse.json({ slots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
