import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ success: false, error: "batchId is required" }, { status: 400 });
    }

    const result = await prisma.trade.deleteMany({
      where: {
        brokerTradeId: batchId
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("Batch delete error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
