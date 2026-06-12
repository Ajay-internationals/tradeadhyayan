import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/user/me?email=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, role: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}
