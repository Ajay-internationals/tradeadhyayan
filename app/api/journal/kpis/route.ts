import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getUserFromSession() {
  return await prisma.user.findFirst();
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startDate = new Date(0); // Epoch
    let endDate = new Date(); // Now

    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) {
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    }

    const trades = await prisma.trade.findMany({
      where: {
        userId: user.id,
        tradeDate: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    let totalPnl = 0;
    let totalClosedTrades = 0;
    let winningTrades = 0;
    let grossWinSum = 0;
    let grossLossSum = 0;
    let winningTradesCount = 0;
    let losingTradesCount = 0;
    let bestRR = 0;

    trades.forEach((trade: any) => {
      totalPnl += trade.netPnl || 0;
      
      if (trade.status === "CLOSED") {
        totalClosedTrades++;
        
        if (trade.result === "WIN") {
          winningTrades++;
        }
      }

      if (trade.netPnl > 0) {
        grossWinSum += trade.netPnl;
        winningTradesCount++;
      } else if (trade.netPnl < 0) {
        grossLossSum += Math.abs(trade.netPnl);
        losingTradesCount++;
      }

      if (trade.actualRr && trade.actualRr > bestRR) {
        bestRR = trade.actualRr;
      }
    });

    const winRate = totalClosedTrades > 0 ? (winningTrades / totalClosedTrades) * 100 : 0;
    const averageWin = winningTradesCount > 0 ? (grossWinSum / winningTradesCount) : 0;
    const averageLoss = losingTradesCount > 0 ? (grossLossSum / losingTradesCount) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalPnl,
        winRate,
        totalTrades: trades.length,
        averageWin,
        averageLoss,
        bestRR,
        previousPeriodChange: {
          // Placeholder for prev period change logic
          pnlChangePct: 0
        }
      }
    });
  } catch (error: any) {
    console.error("Journal KPI error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
