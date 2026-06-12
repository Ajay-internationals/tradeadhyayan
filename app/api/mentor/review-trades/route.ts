import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/mentor/review-trades?ids=id1,id2,id3
// Allows mentor to fetch specific trades shared by a client for review
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ trades: [] });
  }

  const ids = idsParam.split(",").map(id => id.trim()).filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ trades: [] });
  }

  try {
    const trades = await prisma.trade.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        symbol: true,
        direction: true,
        entryTime: true,
        exitTime: true,
        entryPrice: true,
        exitPrice: true,
        quantity: true,
        pnl: true,
        netPnl: true,
        charges: true,
        status: true,
        tags: true,
        notes: true,
        strategy: true,
        tradeType: true,
        exchange: true,
        stopLoss: true,
        target: true,
        riskReward: true,
        emotionTag: true,
        mistakeTags: true,
        // Include related mistakes if any
        Mistake: {
          select: {
            mistakeType: true,
            severity: true,
            description: true,
          }
        }
      },
      orderBy: { entryTime: "asc" },
    });

    return NextResponse.json({ trades });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
