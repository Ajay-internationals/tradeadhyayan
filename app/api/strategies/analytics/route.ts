import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

async function getUserIdByEmail(email: string): Promise<string> {
  if (!email) return MOCK_USER_ID;
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  });
  if (user) return user.id;

  // Fallback to first user in db if any
  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser.id;

  return MOCK_USER_ID;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const userId = await getUserIdByEmail(email);

    // Filter by dates if passed
    const dateFilter: any = {};
    if (fromStr) {
      dateFilter.gte = new Date(fromStr);
    }
    if (toStr) {
      dateFilter.lte = new Date(toStr);
    }

    // Retrieve active and inactive strategies
    const strategies = await prisma.strategy.findMany({
      where: { userId, status: { in: ["ACTIVE", "INACTIVE"] } },
      orderBy: { createdAt: "desc" }
    });

    // Retrieve all user trades in date range
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        ...(fromStr || toStr ? { entryTime: dateFilter } : {})
      },
      orderBy: { entryTime: "asc" }
    });

    // Strategy Performance Mapping
    const analytics = strategies.map(strat => {
      // Find trades tagged by strategyId OR match on setup name
      const stratTrades = trades.filter(t => 
        t.strategyId === strat.id || 
        (t.setup && t.setup.toLowerCase().trim() === strat.name.toLowerCase().trim())
      );

      const totalTrades = stratTrades.length;
      const winningTrades = stratTrades.filter(t => t.netPnl > 0);
      const losingTrades = stratTrades.filter(t => t.netPnl < 0);

      const grossProfit = winningTrades.reduce((sum, t) => sum + t.netPnl, 0);
      const grossLoss = losingTrades.reduce((sum, t) => sum + t.netPnl, 0);
      const totalPnl = stratTrades.reduce((sum, t) => sum + t.netPnl, 0);

      const winRate = totalTrades > 0 ? parseFloat(((winningTrades.length / totalTrades) * 100).toFixed(1)) : 0;
      const profitFactor = Math.abs(grossLoss) > 0 
        ? parseFloat((grossProfit / Math.abs(grossLoss)).toFixed(2)) 
        : (grossProfit > 0 ? 999.0 : 0.0);

      // R:R Calculations
      let totalRisk = 0;
      let totalReward = 0;
      let tradesWithRrCount = 0;
      let rrSum = 0;

      stratTrades.forEach(t => {
        const direction = t.direction;
        const qty = t.quantity || 1;
        const entry = t.entryPrice;
        const sl = t.stopLoss || 0;
        const tgt = t.target || 0;

        let risk = 0;
        let reward = 0;

        if (sl > 0) {
          risk = direction === "LONG" ? (entry - sl) * qty : (sl - entry) * qty;
        }
        if (tgt > 0) {
          reward = direction === "LONG" ? (tgt - entry) * qty : (entry - tgt) * qty;
        }

        if (risk > 0 && reward > 0) {
          rrSum += reward / risk;
          tradesWithRrCount++;
        }
      });

      let avgRR = 0;
      if (tradesWithRrCount > 0) {
        avgRR = parseFloat((rrSum / tradesWithRrCount).toFixed(2));
      } else {
        // Fallback R:R
        const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? Math.abs(grossLoss) / losingTrades.length : 0;
        avgRR = avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(2)) : 0;
      }

      return {
        strategy: strat,
        tradesCount: totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        totalPnl,
        winRate,
        profitFactor,
        avgRR,
        trades: stratTrades
      };
    });

    // Filter out strategies with 0 trades if we want to show strict empty states,
    // but here we keep all strategies to populate the main table properly.
    const activeStrategiesCount = strategies.filter(s => s.status === "ACTIVE").length;
    const totalStrategiesCount = strategies.length;

    // Aggregate stats across all strategies
    const totalTradesAll = analytics.reduce((sum, s) => sum + s.tradesCount, 0);
    const totalPnlAll = analytics.reduce((sum, s) => sum + s.totalPnl, 0);
    const profitableStrategiesCount = analytics.filter(s => s.tradesCount > 0 && s.totalPnl > 0).length;

    // Overall win rate
    const totalWinsAll = analytics.reduce((sum, s) => sum + s.winningTrades, 0);
    const overallWinRate = totalTradesAll > 0 ? parseFloat(((totalWinsAll / totalTradesAll) * 100).toFixed(1)) : 0;

    // Overall average R:R
    const overallRR = totalTradesAll > 0 
      ? parseFloat((analytics.reduce((sum, s) => sum + (s.avgRR * s.tradesCount), 0) / totalTradesAll).toFixed(2))
      : 0;

    // Best performing strategy
    let bestStrategy: any = null;
    let maxPnl = -Infinity;
    analytics.forEach(a => {
      if (a.tradesCount > 0 && a.totalPnl > maxPnl) {
        maxPnl = a.totalPnl;
        bestStrategy = a;
      }
    });

    // Generate daily P&L data for sparklines/curves
    // Map date strings to cumulative P&L
    const dailyPnlMap: Record<string, number> = {};
    trades.forEach(t => {
      const dateStr = new Date(t.entryTime).toISOString().split("T")[0];
      dailyPnlMap[dateStr] = (dailyPnlMap[dateStr] || 0) + t.netPnl;
    });

    const dailyPnlChart = Object.entries(dailyPnlMap).map(([date, pnl]) => ({
      date,
      pnl
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Donut chart distribution
    const donutChartData = analytics.map(a => ({
      name: a.strategy.name,
      value: a.tradesCount,
      pnl: a.totalPnl
    })).filter(d => d.value > 0);

    // Insights Engine
    const insights: string[] = [];

    // Insight 1: Focus on Best Strategy
    if (bestStrategy && bestStrategy.totalPnl > 0 && bestStrategy.winRate > overallWinRate) {
      insights.push(`Focus on ${bestStrategy.strategy.name}. It has the highest profit (₹${bestStrategy.totalPnl.toLocaleString("en-IN")}) and a strong win rate of ${bestStrategy.winRate}%.`);
    }

    // Insight 2: Improve Weak Strategy
    const weakStrategy = analytics.find(a => a.tradesCount >= 2 && a.totalPnl < 0 && a.winRate < 40);
    if (weakStrategy) {
      insights.push(`Improve ${weakStrategy.strategy.name}. Low win rate (${weakStrategy.winRate}%) and negative returns (₹${weakStrategy.totalPnl.toLocaleString("en-IN")}).`);
    }

    // Insight 3: Diversify Entries
    if (bestStrategy && totalTradesAll > 0) {
      const topShare = (bestStrategy.tradesCount / totalTradesAll) * 100;
      if (topShare > 50) {
        insights.push(`Diversify your entries. ${bestStrategy.strategy.name} accounts for ${topShare.toFixed(0)}% of your trades. Try combining 2–3 strategies.`);
      }
    }

    // Insight 4: Stick to Rules
    // Check rule violations (followedPlan = false)
    const ruleViolations = trades.filter(t => !t.followedPlan).length;
    if (ruleViolations > 3) {
      insights.push(`Set rules and stick to them. You committed ${ruleViolations} discipline violations recently. Consistency will improve results.`);
    }

    // Ensure we have at least 1-2 generic insights if empty
    if (insights.length === 0) {
      insights.push("Start tagging your trades to strategies to unlock customized performance recommendations.");
      insights.push("Keep your risk per trade below 1% to maintain a steady equity curve.");
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalStrategies: totalStrategiesCount,
        activeStrategies: activeStrategiesCount,
        bestStrategyName: bestStrategy ? bestStrategy.strategy.name : "None",
        bestStrategyPnl: bestStrategy ? bestStrategy.totalPnl : 0,
        totalPnl: totalPnlAll,
        winRate: overallWinRate,
        avgRR: overallRR,
        profitableStrategiesCount,
        totalTrades: totalTradesAll
      },
      analyticsList: analytics,
      donutChartData,
      dailyPnlChart,
      insights
    });

  } catch (error: any) {
    console.error("Strategies Analytics GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
