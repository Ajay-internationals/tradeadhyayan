import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  slotSize: z.number().int().min(15).max(240).default(45),
});

// POST — mentor creates an availability slot
export async function POST(req: Request) {
  try {
    const mentorUserId = req.headers.get("x-user-id");
    if (!mentorUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mentor = await prisma.mentor.findUnique({ where: { userId: mentorUserId } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = CreateSlotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { dayOfWeek, startTime, endTime, slotSize } = parsed.data;

    if (startTime >= endTime) {
      return NextResponse.json({ error: "startTime must be before endTime" }, { status: 400 });
    }

    const slot = await prisma.mentorAvailabilitySlot.create({
      data: {
        mentorId: mentor.id,
        dayOfWeek,
        startTime,
        endTime,
        slotSize,
      },
    });

    return NextResponse.json({ success: true, slot });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — fetch availability slots for a mentor
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");

    if (!mentorId) {
      return NextResponse.json({ error: "mentorId is required" }, { status: 400 });
    }

    const slots = await prisma.mentorAvailabilitySlot.findMany({
      where: { mentorId, isActive: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ slots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — deactivate a slot
export async function DELETE(req: Request) {
  try {
    const mentorUserId = req.headers.get("x-user-id");
    if (!mentorUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("slotId");

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    const mentor = await prisma.mentor.findUnique({ where: { userId: mentorUserId } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Verify slot belongs to this mentor
    const slot = await prisma.mentorAvailabilitySlot.findFirst({
      where: { id: slotId, mentorId: mentor.id },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    await prisma.mentorAvailabilitySlot.update({
      where: { id: slotId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
