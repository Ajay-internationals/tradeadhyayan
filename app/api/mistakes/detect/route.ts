import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Severity logic based on Section 5
function calculateSeverity(lossImpact: number, mistakeType: string): "HIGH" | "MEDIUM" | "LOW" {
  if (lossImpact > 3000 || mistakeType === "No Stop Loss") {
    return "HIGH";
  } else if (lossImpact > 1000) {
    return "MEDIUM";
  } else {
    return "LOW";
  }
}

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user settings (risk limit, trade limit, etc.)
    const settings = await prisma.userSetting.findUnique({
      where: { userId: user.id }
    }) || {
      maxTradesPerDay: 3,
      revengeTradeWindowMinutes: 15,
      defaultRisk: 1.0,
    };

    // Fetch trades
    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { entryTime: "asc" },
      include: { TradePlan: true }
    });

    // Fetch market snapshots to check Against Trend rule
    const snapshots = await prisma.marketSnapshot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    // Clean up previous OPEN mistakes of the 8 standard types to avoid duplicates on re-scan
    const autoMistakeTypes = [
      "Overtrading",
      "Revenge Trading",
      "No Stop Loss",
      "Risk Too High",
      "Early Exit",
      "Late Entry",
      "Against Trend",
      "Checklist Ignored"
    ];

    await prisma.tradeMistake.deleteMany({
      where: {
        userId: user.id,
        status: "OPEN",
        rootCause: null, // manual edits have a rootCause or status set, keep them
        type: { in: autoMistakeTypes }
      }
    });

    const mistakesToCreate = [];

    // Helper for Overtrading: group trades by day string in User's timezone
    const tradesByDay: Record<string, typeof trades> = {};
    for (const trade of trades) {
      const dateStr = new Date(trade.entryTime).toLocaleDateString("en-US", {
        timeZone: user.timezone || "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      if (!tradesByDay[dateStr]) {
        tradesByDay[dateStr] = [];
      }
      tradesByDay[dateStr].push(trade);
    }

    const dailyTradeLimit = settings.maxTradesPerDay || 3;
    const capital = user.initialCapital || 100000;
    const maxRiskPercent = settings.defaultRisk || 1.0;

    for (let i = 0; i < trades.length; i++) {
      const trade = trades[i];
      const previousTrade = trades[i - 1];

      const pnl = trade.pnl || 0;
      const lossImpact = pnl < 0 ? Math.abs(pnl) : 0;

      // 1. Overtrading
      const dateStr = new Date(trade.entryTime).toLocaleDateString("en-US", {
        timeZone: user.timezone || "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      const dayTrades = tradesByDay[dateStr] || [];
      const tradeIdx = dayTrades.findIndex(t => t.id === trade.id);
      if (tradeIdx >= dailyTradeLimit) {
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "Overtrading",
          severity: calculateSeverity(lossImpact, "Overtrading"),
          reason: `You took trade #${tradeIdx + 1} today, which exceeds your daily trade limit of ${dailyTradeLimit}.`,
          suggestion: `Stick to your daily limit of ${dailyTradeLimit} trades. Lock your trading terminal after your limit is reached.`,
          lossImpact,
          status: "OPEN"
        });
      }

      // 2. Revenge Trading
      // Revenge window is 15 minutes as per spec, or custom settings if specified
      const revengeWindowMs = 15 * 60 * 1000;
      if (
        previousTrade &&
        previousTrade.pnl < 0 &&
        trade.entryTime.getTime() - previousTrade.exitTime.getTime() <= revengeWindowMs &&
        trade.entryTime.getTime() - previousTrade.exitTime.getTime() > 0
      ) {
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "Revenge Trading",
          severity: calculateSeverity(lossImpact, "Revenge Trading"),
          reason: `You entered this trade within ${Math.round((trade.entryTime.getTime() - previousTrade.exitTime.getTime()) / 60000)} minutes after a loss. This indicates revenge trading.`,
          suggestion: "After every loss, take a 20-minute break before next trade.",
          lossImpact,
          status: "OPEN"
        });
      }

      // 3. No Stop Loss
      if (!trade.stopLoss || trade.stopLoss <= 0) {
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "No Stop Loss",
          severity: "HIGH", // always High severity for No Stop Loss as per Section 5
          reason: "This trade was executed without a stop loss.",
          suggestion: "Always define and set a stop loss before entry.",
          lossImpact,
          status: "OPEN"
        });
      }

      // 4. Risk Too High
      if (trade.stopLoss && trade.stopLoss > 0) {
        const riskAmount = Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity;
        const riskPercent = (riskAmount / capital) * 100;
        if (riskPercent > maxRiskPercent) {
          mistakesToCreate.push({
            userId: user.id,
            tradeId: trade.id,
            type: "Risk Too High",
            severity: calculateSeverity(lossImpact, "Risk Too High"),
            reason: `Your risk per trade was ${riskPercent.toFixed(2)}%, which exceeds your max risk limit of ${maxRiskPercent}%.`,
            suggestion: `Reduce your quantity size or widen/narrow your stop loss to keep risk below ${maxRiskPercent}% of capital.`,
            lossImpact,
            status: "OPEN"
          });
        }
      }

      // 5. Early Exit
      if (
        trade.target && trade.target > 0 &&
        pnl > 0
      ) {
        const isEarlyExit =
          (trade.direction === "LONG" && trade.exitPrice < trade.target) ||
          (trade.direction === "SHORT" && trade.exitPrice > trade.target);

        const isFear =
          trade.mood?.toLowerCase().includes("fear") ||
          trade.notes?.toLowerCase().includes("fear") ||
          trade.notes?.toLowerCase().includes("scared") ||
          trade.notes?.toLowerCase().includes("early exit") ||
          trade.notes?.toLowerCase().includes("fearful");

        if (isEarlyExit && isFear) {
          mistakesToCreate.push({
            userId: user.id,
            tradeId: trade.id,
            type: "Early Exit",
            severity: calculateSeverity(0, "Early Exit"),
            reason: "You exited this trade early before reaching your target due to fear/impatience.",
            suggestion: "Let your winning setups reach the target, or use a trailing stop loss to protect profits.",
            lossImpact: 0,
            status: "OPEN"
          });
        }
      }

      // 6. Late Entry
      if (trade.TradePlan && trade.TradePlan.plannedEntry > 0) {
        const breakoutPrice = trade.TradePlan.plannedEntry;
        const moveBeforeEntry = (Math.abs(trade.entryPrice - breakoutPrice) / breakoutPrice) * 100;
        if (moveBeforeEntry > 1.5) {
          mistakesToCreate.push({
            userId: user.id,
            tradeId: trade.id,
            type: "Late Entry",
            severity: calculateSeverity(lossImpact, "Late Entry"),
            reason: `You entered this trade after price moved ${moveBeforeEntry.toFixed(2)}% from your planned breakout entry price of ${breakoutPrice}.`,
            suggestion: "Avoid chasing a breakout once price moves past your 1.5% entry deviation window.",
            lossImpact,
            status: "OPEN"
          });
        }
      }

      // 7. Trading Against Trend
      const closestSnapshot = snapshots.find(s => s.createdAt.getTime() <= trade.entryTime.getTime());
      if (closestSnapshot) {
        const marketTrend = closestSnapshot.marketBias; // "Bullish" or "Bearish"
        const isAgainstTrend =
          (trade.direction === "LONG" && marketTrend === "Bearish") ||
          (trade.direction === "SHORT" && marketTrend === "Bullish");

        if (isAgainstTrend) {
          mistakesToCreate.push({
            userId: user.id,
            tradeId: trade.id,
            type: "Against Trend",
            severity: calculateSeverity(lossImpact, "Against Trend"),
            reason: `You entered a ${trade.direction === "LONG" ? "BUY/LONG" : "SELL/SHORT"} trade while the market trend was ${marketTrend}.`,
            suggestion: "Only take trades in the direction of the macro market trend. Trade with the trend.",
            lossImpact,
            status: "OPEN"
          });
        }
      }

      // 8. Ignored Checklist
      if (trade.TradePlan && trade.TradePlan.checklistCompleted === false) {
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "Checklist Ignored",
          severity: calculateSeverity(lossImpact, "Checklist Ignored"),
          reason: "You took this trade without completing your pre-trade checklist.",
          suggestion: "Never enter a trade until all checklist items are confirmed and checked off.",
          lossImpact,
          status: "OPEN"
        });
      }
    }

    if (mistakesToCreate.length > 0) {
      await prisma.tradeMistake.createMany({
        data: mistakesToCreate,
        skipDuplicates: true
      });
    }

    // Return the newly created/updated mistakes list
    const updatedMistakes = await prisma.tradeMistake.findMany({
      where: { userId: user.id },
      include: { trade: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, count: updatedMistakes.length, mistakes: updatedMistakes });
  } catch (error: any) {
    console.error("Error in POST /api/mistakes/detect:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
