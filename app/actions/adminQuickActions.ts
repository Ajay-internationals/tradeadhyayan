"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// ─── Add Mentor ──────────────────────────────────────────────────────────────
export async function adminAddMentor(formData: {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  category: string;
  capacity: number;
  payoutShare: number;
}) {
  try {
    const userId = randomUUID();
    const mentorId = randomUUID();

    await prisma.user.create({
      data: {
        id: userId,
        name: formData.name,
        email: formData.email,
        role: "MENTOR",
        passwordHash: "",
        updatedAt: new Date(),
      },
    });

    await prisma.mentor.create({
      data: {
        id: mentorId,
        userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        designation: formData.designation || null,
        category: formData.category,
        capacity: formData.capacity,
        payoutShare: formData.payoutShare,
        status: "ACTIVE",
        statusDetail: "AVAILABLE",
      },
    });

    revalidatePath("/admin/dashboard/mentors");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// ─── Allocate Client to Mentor ────────────────────────────────────────────────
export async function adminAllocateClient(formData: {
  clientId: string;
  mentorId: string;
}) {
  try {
    await prisma.mentorClient.deleteMany({
      where: { clientId: formData.clientId },
    });

    await prisma.mentorClient.create({
      data: {
        id: randomUUID(),
        mentorId: formData.mentorId,
        clientId: formData.clientId,
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/dashboard/allocation");
    revalidatePath("/admin/dashboard/clients");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// ─── Fetch active mentors (dropdown) ─────────────────────────────────────────
export async function adminGetMentors() {
  return prisma.mentor.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

// ─── Fetch users with CLIENT role ─────────────────────────────────────────────
export async function adminGetClients() {
  return prisma.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

// ─── Create Mentorship Session ────────────────────────────────────────────────
export async function adminCreateSession(formData: {
  mentorId: string;
  clientId: string;
  scheduledAt: string;
  durationMins: number;
  sessionType: string;
  notes?: string;
}) {
  try {
    await prisma.mentorSession.create({
      data: {
        id: randomUUID(),
        mentorId: formData.mentorId,
        clientId: formData.clientId,
        scheduledAt: new Date(formData.scheduledAt),
        durationMins: formData.durationMins,
        sessionType: formData.sessionType,
        notes: formData.notes || null,
        status: "SCHEDULED",
      },
    });

    revalidatePath("/admin/dashboard/sessions");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// ─── Broadcast Message (stored as MentorMessage from each mentor to their clients) ─
export async function adminBroadcastMessage(formData: {
  title: string;
  body: string;
  targetRole: "ALL" | "CLIENT" | "MENTOR";
}) {
  try {
    const firstMentor = await prisma.mentor.findFirst({ select: { id: true } });
    if (!firstMentor) return { success: false, error: "No mentors exist to log broadcast." };

    await prisma.mentorAudit.create({
      data: {
        id: randomUUID(),
        mentorId: firstMentor.id,
        auditType: "QUALITY_CHECK",
        description: `[ADMIN BROADCAST] ${formData.title} → Target: ${formData.targetRole} | ${formData.body}`,
        adminNotes: `Sent at ${new Date().toISOString()}`,
        severity: "LOW",
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
