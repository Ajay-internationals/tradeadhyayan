import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/subscription/access";
import { prisma } from "@/lib/db";

async function getUserFromSession(req: Request) {
  // Mock/Fallback for demo
  const user = await prisma.user.findFirst();
  return user;
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getUserPlan(user.id);
    return NextResponse.json({ access });
  } catch (error: any) {
    console.error("Access error:", error);
    return NextResponse.json({ error: "Failed to fetch access rights" }, { status: 500 });
  }
}
