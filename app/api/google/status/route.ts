import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/google/status?userId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ connected: false });

  const conn = await prisma.googleCalendarConnection.findUnique({ where: { userId } });
  return NextResponse.json({ connected: !!conn && !!conn.accessToken });
}
