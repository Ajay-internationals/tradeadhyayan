"use server";

import { prisma } from "@/lib/db";

export interface ReportMetricsData {
  hasTrades: boolean;
  totalTrades: number;
  netPnl: number;
  winRate: number;
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  riskReward: number;
  expectancy: number;
  grossProfit: number;
  grossLoss: number;
  longTrades: number;
  longWins: number;
  shortTrades: number;
  shortWins: number;
  disciplineScore: number;
  pnlOverTime: { date: string; pnl: number }[];
  dailyPerformance: { day: string; pnl: number; tradesCount: number }[];
}

export async function getReportsData(email: string): Promise<ReportMetricsData> {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        Trade: {
          where: { status: "CLOSED" },
          orderBy: { entryTime: "asc" },
        },
        Mistake: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const trades = user.Trade;

    // Fallback Mock Data matching the user's mockup image
    const mockupData: ReportMetricsData = {
      hasTrades: false,
      totalTrades: 28,
      netPnl: 18420,
      winRate: 62.5,
      winCount: 17,
      lossCount: 11,
      breakevenCount: 0,
      profitFactor: 1.85,
      averageProfit: 1692,
      averageLoss: 940,
      riskReward: 2.18,
      expectancy: 658,
      grossProfit: 28760,
      grossLoss: 10340,
      longTrades: 18,
      longWins: 11,
      shortTrades: 10,
      shortWins: 6,
      disciplineScore: 76,
      pnlOverTime: [
        { date: "12 May", pnl: -3500 },
        { date: "13 May", pnl: 4500 },
        { date: "14 May", pnl: 2800 },
        { date: "15 May", pnl: 9200 },
        { date: "16 May", pnl: 7500 },
        { date: "17 May", pnl: 13500 },
        { date: "18 May", pnl: 18420 },
      ],
      dailyPerformance: [
        { day: "Mon", pnl: 2800, tradesCount: 4 },
        { day: "Tue", pnl: 6900, tradesCount: 6 },
        { day: "Wed", pnl: 7200, tradesCount: 5 },
        { day: "Thu", pnl: -1200, tradesCount: 4 },
        { day: "Fri", pnl: 3400, tradesCount: 5 },
        { day: "Sat", pnl: -800, tradesCount: 4 },
        { day: "Sun", pnl: 0, tradesCount: 0 },
      ],
    };

    if (trades.length === 0) {
      return mockupData;
    }

    // Dynamic Calculations
    let totalPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let breakevenCount = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let followedPlanCount = 0;

    let longTrades = 0;
    let longWins = 0;
    let shortTrades = 0;
    let shortWins = 0;

    // Grouping by Date for Line Chart
    const dailyPnlMap: Record<string, number> = {};
    // Grouping by Weekday for Bar Chart
    const weekdayPnlMap: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const weekdayCountMap: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const weekdaysOrdered = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    trades.forEach((t) => {
      const pnl = t.netPnl || t.pnl || 0;
      totalPnl += pnl;

      // Grouping by date (e.g. "15 May")
      const dateLabel = new Date(t.entryTime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      dailyPnlMap[dateLabel] = (dailyPnlMap[dateLabel] || 0) + pnl;

      // Grouping by weekday
      const dayLabel = weekdaysOrdered[new Date(t.entryTime).getDay()];
      weekdayPnlMap[dayLabel] += pnl;
      weekdayCountMap[dayLabel]++;

      // Win / Loss / Breakeven
      if (pnl > 0) {
        winCount++;
        grossProfit += pnl;
        if (t.direction === "LONG") longWins++;
        else if (t.direction === "SHORT") shortWins++;
      } else if (pnl < 0) {
        lossCount++;
        grossLoss += Math.abs(pnl);
      } else {
        breakevenCount++;
      }

      // Direction
      if (t.direction === "LONG") {
        longTrades++;
      } else if (t.direction === "SHORT") {
        shortTrades++;
      }

      if (t.followedPlan) {
        followedPlanCount++;
      }
    });

    const totalTrades = trades.length;
    const winRate = (winCount / totalTrades) * 100;
    const averageProfit = winCount > 0 ? grossProfit / winCount : 0;
    const averageLoss = lossCount > 0 ? grossLoss / lossCount : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;
    const riskReward = averageLoss > 0 ? averageProfit / averageLoss : averageProfit > 0 ? 99.9 : 0;
    const disciplineScore = (followedPlanCount / totalTrades) * 100;

    // Expectancy calculation: (Win% * AvgWin) - (Loss% * AvgLoss)
    const winPct = winRate / 100;
    const lossPct = 1 - winPct;
    const expectancy = (winPct * averageProfit) - (lossPct * averageLoss);

    // Cumulative P&L Over Time Curve
    let runningCumulativePnl = 0;
    const pnlOverTime = Object.keys(dailyPnlMap).map((date) => {
      runningCumulativePnl += dailyPnlMap[date];
      return {
        date,
        pnl: Math.round(runningCumulativePnl),
      };
    });

    // Weekday performance formatting
    const dailyPerformance = weekdaysOrdered.map((day) => ({
      day,
      pnl: Math.round(weekdayPnlMap[day]),
      tradesCount: weekdayCountMap[day],
    }));

    return {
      hasTrades: true,
      totalTrades,
      netPnl: Math.round(totalPnl),
      winRate,
      winCount,
      lossCount,
      breakevenCount,
      profitFactor: Number(profitFactor.toFixed(2)),
      averageProfit: Math.round(averageProfit),
      averageLoss: Math.round(averageLoss),
      riskReward: Number(riskReward.toFixed(2)),
      expectancy: Math.round(expectancy),
      grossProfit: Math.round(grossProfit),
      grossLoss: Math.round(grossLoss),
      longTrades,
      longWins,
      shortTrades,
      shortWins,
      disciplineScore,
      pnlOverTime,
      dailyPerformance,
    };
  } catch (error) {
    console.error("Failed to aggregate reports metrics:", error);
    throw new Error("Failed to fetch reports data");
  }
}
