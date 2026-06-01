import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    let userId = DEFAULT_USER_ID;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (user) {
        userId = user.id;
      }
    }

    // Fetch trades and mistakes
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { entryTime: "asc" }
    });

    const mistakes = await prisma.mistake.findMany({
      where: { userId },
      include: { Trade: true }
    });

    const totalTradesCount = trades.length;
    const closedTradesCount = trades.filter(t => t.result !== "BREAKEVEN" && t.exitPrice > 0).length;

    // 1. Basic Stats
    const totalMistakesCount = mistakes.length;

    // Count of unique trades that have at least one mistake
    const mistakeTradeIds = new Set(mistakes.map(m => m.tradeId));
    const mistakeTradesCount = mistakeTradeIds.size;

    // Total Loss from Mistakes (sum net_pnl of trades having mistake, if net_pnl < 0)
    const mistakeTrades = trades.filter(t => mistakeTradeIds.has(t.id));
    const totalLossFromMistakes = mistakeTrades
      .filter(t => t.netPnl < 0)
      .reduce((sum, t) => sum + Math.abs(t.netPnl), 0);

    // Mistake Rate = mistake trades / total trades * 100
    const mistakeRate = totalTradesCount > 0 
      ? Math.round((mistakeTradesCount / totalTradesCount) * 100) 
      : 0;

    // 2. Mistake Breakdown (frequency count)
    const breakdownMap: Record<string, number> = {};
    mistakes.forEach(m => {
      breakdownMap[m.mistakeType] = (breakdownMap[m.mistakeType] || 0) + 1;
    });

    const breakdown = Object.entries(breakdownMap).map(([type, count]) => ({
      type,
      count
    })).sort((a, b) => b.count - a.count);

    // 3. Repeat Mistakes (mistakes repeated more than once)
    const repeatMistakes = breakdown.filter(b => b.count > 1).map(b => b.type);

    // Improvement Score: 100 - mistake rate adjusted by repeat mistakes
    const repeatPenalty = repeatMistakes.length * 5;
    const improvementScore = Math.max(0, 100 - mistakeRate - repeatPenalty);

    // 4. Mistakes Over Time
    const overTimeMap: Record<string, number> = {};
    mistakes.forEach(m => {
      const dateStr = new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
      overTimeMap[dateStr] = (overTimeMap[dateStr] || 0) + 1;
    });
    const overTime = Object.entries(overTimeMap).map(([date, count]) => ({
      date,
      count
    }));

    // 5. Pattern-based Insights Generation (No mocks)
    const insights: string[] = [];

    if (closedTradesCount < 10) {
      insights.push("Add at least 10 closed trades to generate mistake insights.");
    } else {
      // Rule A: Overtrading increases after 12 PM
      const overtradingAfter12 = mistakes.filter(m => {
        if (m.mistakeType !== "Overtrading") return false;
        const entryHour = new Date(m.Trade.entryTime).getHours();
        return entryHour >= 12;
      }).length;
      if (overtradingAfter12 > 0) {
        insights.push("Overtrading increases after 12 PM. Lock your terminal before the afternoon session.");
      }

      // Rule B: Mistakes after winning streak (2 wins)
      let winStreakLapses = 0;
      for (let i = 2; i < trades.length; i++) {
        const prev1 = trades[i - 1];
        const prev2 = trades[i - 2];
        const curr = trades[i];
        if (prev1.netPnl > 0 && prev2.netPnl > 0 && mistakeTradeIds.has(curr.id)) {
          winStreakLapses++;
        }
      }
      if (winStreakLapses > 0) {
        insights.push("You make more mistakes after 2 consecutive winning trades. Watch out for overconfidence.");
      }

      // Rule C: Emotional trading losses
      const emotionalLossCount = mistakes.filter(m => m.mistakeType === "Emotional Trading" && m.Trade && m.Trade.netPnl < 0).length;
      if (emotionalLossCount >= 2) {
        insights.push("Most losses come from emotional trading. Keep a cooling period after any trigger.");
      }

      // Rule D: Win rate drops when taking > 3 trades/day
      const tradesByDate: Record<string, typeof trades> = {};
      trades.forEach((t) => {
        const dateStr = new Date(t.entryTime).toDateString();
        if (!tradesByDate[dateStr]) tradesByDate[dateStr] = [];
        tradesByDate[dateStr].push(t);
      });

      let highTradeDaysCount = 0;
      let highTradeDaysWins = 0;
      let lowTradeDaysCount = 0;
      let lowTradeDaysWins = 0;

      Object.values(tradesByDate).forEach(dayTrades => {
        if (dayTrades.length > 3) {
          highTradeDaysCount += dayTrades.length;
          highTradeDaysWins += dayTrades.filter(t => t.netPnl > 0).length;
        } else {
          lowTradeDaysCount += dayTrades.length;
          lowTradeDaysWins += dayTrades.filter(t => t.netPnl > 0).length;
        }
      });

      const highWinRate = highTradeDaysCount > 0 ? highTradeDaysWins / highTradeDaysCount : 0;
      const lowWinRate = lowTradeDaysCount > 0 ? lowTradeDaysWins / lowTradeDaysCount : 0;
      if (lowWinRate > highWinRate) {
        insights.push("Your win rate drops when you take more than 3 trades per day. Stick to your daily limit.");
      }

      // Rule E: Early exits impact
      const earlyExits = mistakes.filter(m => m.mistakeType === "Early Exit");
      if (earlyExits.length > 0) {
        insights.push("Your early exits reduce your average reward. Let your winning setups reach the target.");
      }
    }

    return NextResponse.json({
      totalMistakes: totalMistakesCount,
      mistakeTrades: mistakeTradesCount,
      totalLossFromMistakes,
      repeatMistakes,
      mistakeRate,
      improvementScore,
      breakdown,
      overTime,
      insights
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
