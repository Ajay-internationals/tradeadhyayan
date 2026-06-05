import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing email" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { entryTime: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: trades
    });
  } catch (error: any) {
    console.error("Trades API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
