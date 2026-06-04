import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

export async function GET(req: Request) {
  try {
    const connections = await prisma.brokerConnection.findMany({
      where: { userId: MOCK_USER_ID }
    });

    return NextResponse.json({ success: true, connections });
  } catch (error: any) {
    console.error("Failed to fetch broker status:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch status" }, { status: 500 });
  }
}
