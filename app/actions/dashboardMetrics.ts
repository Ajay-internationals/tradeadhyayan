"use server";

import { prisma } from "@/lib/db";

export async function getDashboardMetrics(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        UserSetting: true,
        Trade: {
          orderBy: { entryTime: "asc" } // Need ASC for equity curve
        },
        Mistake: true,
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const trades = user.Trade;
    const settings = user.UserSetting || { maxTradesPerDay: 3, revengeTradeWindowMinutes: 30 };

    if (trades.length === 0) {
      return { hasTrades: false };
    }

    // 1. Core KPIs
    let totalPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let grossWin = 0;
    let grossLoss = 0;
    let bestTrade = -Infinity;
    let worstTrade = Infinity;
    let totalInvested = 0;
    
    // For Equity Curve
    let currentEquity = user.initialCapital || 100000;
    const equityCurve = [];
    
    // For Daily P&L
    const dailyMap: Record<string, number> = {};
    const tradesToday = [];
    
    // Strategy & Instrument Aggregation
    const strategyMap: Record<string, { pnl: number; count: number; wins: number }> = {};
    const instrumentMap: Record<string, { pnl: number; count: number; wins: number }> = {};

    let followedPlanCount = 0;
    let revengeAlert = false;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let currentMonthPnl = 0;

    for (let i = 0; i < trades.length; i++) {
      const t = trades[i];
      const pnl = t.netPnl || 0;
      totalPnl += pnl;
      totalInvested += (t.entryPrice || 0) * (t.quantity || 0);

      // Update Equity
      currentEquity += pnl;
      equityCurve.push({
        date: new Date(t.entryTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        equity: currentEquity,
      });

      // Daily mapping
      const dateStr = new Date(t.entryTime).toISOString().split('T')[0];
      if (!dailyMap[dateStr]) dailyMap[dateStr] = 0;
      dailyMap[dateStr] += pnl;

      // Today check
      const todayStr = new Date().toISOString().split('T')[0];
      if (dateStr === todayStr) {
        tradesToday.push(t);
      }

      // Month check
      const tDate = new Date(t.entryTime);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        currentMonthPnl += pnl;
      }

      // Wins / Losses
      if (pnl > 0) {
        winCount++;
        grossWin += pnl;
      } else if (pnl < 0) {
        lossCount++;
        grossLoss += Math.abs(pnl);
      }

      if (pnl > bestTrade) bestTrade = pnl;
      if (pnl < worstTrade) worstTrade = pnl;

      // Strategy
      const strat = t.setup || "Other";
      if (!strategyMap[strat]) strategyMap[strat] = { pnl: 0, count: 0, wins: 0 };
      strategyMap[strat].pnl += pnl;
      strategyMap[strat].count++;
      if (pnl > 0) strategyMap[strat].wins++;

      // Instrument
      const inst = t.instrumentType || "STOCK";
      if (!instrumentMap[inst]) instrumentMap[inst] = { pnl: 0, count: 0, wins: 0 };
      instrumentMap[inst].pnl += pnl;
      instrumentMap[inst].count++;
      if (pnl > 0) instrumentMap[inst].wins++;

      // Discipline
      if (t.followedPlan) followedPlanCount++;

      // Revenge check: if this trade was entered within X mins of a PREVIOUS losing trade
      if (i > 0 && !revengeAlert) {
        const prev = trades[i - 1];
        if ((prev.netPnl || 0) < 0) {
          const prevExit = new Date(prev.exitTime || prev.entryTime).getTime();
          const currentEntry = new Date(t.entryTime).getTime();
          const diffMins = (currentEntry - prevExit) / 60000;
          if (diffMins > 0 && diffMins <= settings.revengeTradeWindowMinutes) {
            revengeAlert = true;
          }
        }
      }
    }

    const totalTrades = trades.length;
    const winRate = (winCount / totalTrades) * 100;
    const averageWin = winCount > 0 ? grossWin / winCount : 0;
    const averageLoss = lossCount > 0 ? grossLoss / lossCount : 0;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? 99.9 : 0);
    const riskReward = averageLoss > 0 ? averageWin / averageLoss : (averageWin > 0 ? 99.9 : 0);
    const disciplineScore = (followedPlanCount / totalTrades) * 100;

    // Convert dailyMap to array
    const dailyPnlChart = Object.keys(dailyMap).map(k => ({
      date: new Date(k).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      pnl: dailyMap[k],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Formatting strategies
    const strategyPerf = Object.keys(strategyMap).map(k => ({
      name: k,
      pnl: strategyMap[k].pnl,
      winRate: (strategyMap[k].wins / strategyMap[k].count) * 100,
    })).sort((a, b) => b.pnl - a.pnl);

    const instrumentPerf = Object.keys(instrumentMap).map(k => ({
      name: k,
      pnl: instrumentMap[k].pnl,
      winRate: (instrumentMap[k].wins / instrumentMap[k].count) * 100,
    })).sort((a, b) => b.pnl - a.pnl);

    // Recent trades (descending)
    const recentTrades = [...trades].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()).slice(0, 5);

    return {
      hasTrades: true,
      totalTrades,
      netPnl: totalPnl,
      totalInvested,
      winRate,
      averageProfit: averageWin,
      averageLoss,
      profitFactor,
      riskReward,
      bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
      worstTrade: worstTrade === Infinity ? 0 : worstTrade,
      currentMonthPnl,
      disciplineScore,
      mistakeCount: user.Mistake.length,
      overtradingAlert: tradesToday.length > settings.maxTradesPerDay,
      revengeAlert,
      equityCurve,
      dailyPnlChart,
      strategyPerf,
      instrumentPerf,
      recentTrades,
    };

  } catch (error) {
    console.error("Failed to aggregate dashboard metrics:", error);
    return { hasTrades: false, error: "Failed to fetch metrics" };
  }
}
