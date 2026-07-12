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
    const userId = await getUserIdByEmail(email);

    let strategies = await prisma.strategy.findMany({
      where: { userId, status: { in: ["ACTIVE", "INACTIVE"] } },
      orderBy: { createdAt: "desc" }
    });

    // Seed default strategies if none exist and the user exists in DB to prevent foreign key errors
    if (strategies.length === 0) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (userExists) {
        const defaultStrats = [
          {
            id: `strat_seed_1`,
            userId,
            name: "Breakout Setup",
            type: "Breakout Setup",
            description: "High momentum breakout of support or resistance levels.",
            market: "NSE Equity",
            instrument: "Stocks",
            timeframe: "15m",
            setupRules: "Price consolidates near a key level, then breaks with high volume.",
            entryRules: "Enter 1 tick above breakout high.",
            exitRules: "Exit at next pivot resistance or 1.5R target.",
            stopLossRules: "Below consolidation range low.",
            targetRules: "1 : 2 risk reward.",
            riskPerTrade: 1000,
            maxTradesPerDay: 3,
            status: "ACTIVE"
          },
          {
            id: `strat_seed_2`,
            userId,
            name: "Momentum Play",
            type: "Momentum Play",
            description: "Following strong index momentum with moving averages.",
            market: "NSE Options",
            instrument: "Nifty / Bank Nifty",
            timeframe: "5m",
            setupRules: "EMA 9 crosses EMA 30 and price stays above VWAP.",
            entryRules: "Enter CE on bullish crossover candle close.",
            exitRules: "Exit when price closes below EMA 9.",
            stopLossRules: "Previous swing low.",
            targetRules: "Trailing stop loss.",
            riskPerTrade: 1500,
            maxTradesPerDay: 2,
            status: "ACTIVE"
          },
          {
            id: `strat_seed_3`,
            userId,
            name: "Mean Reversion",
            type: "Mean Reversion",
            description: "Trading range extremes using Bollinger Bands.",
            market: "NSE Equity",
            instrument: "High Beta Stocks",
            timeframe: "15m",
            setupRules: "ADX is below 18 and price touches lower or upper Bollinger Band.",
            entryRules: "Enter opposite direction on rejection pinbar candle.",
            exitRules: "Exit near the 20-period moving average line.",
            stopLossRules: "5 points beyond rejection high/low.",
            targetRules: "Mean average target.",
            riskPerTrade: 800,
            maxTradesPerDay: 2,
            status: "ACTIVE"
          }
        ];

        for (const strat of defaultStrats) {
          await prisma.strategy.upsert({
            where: { id: strat.id },
            update: { userId, updatedAt: new Date() },
            create: { ...strat, updatedAt: new Date() }
          });
        }

        strategies = await prisma.strategy.findMany({
          where: { userId, status: { in: ["ACTIVE", "INACTIVE"] } },
          orderBy: { createdAt: "desc" }
        });
      }
    }

    return NextResponse.json({ success: true, strategies });
  } catch (error: any) {
    console.error("Strategies GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      type,
      description,
      market,
      instrument,
      timeframe,
      setupRules,
      entryRules,
      exitRules,
      stopLossRules,
      targetRules,
      riskPerTrade,
      maxTradesPerDay,
      status
    } = body;

    const userId = await getUserIdByEmail(email);

    if (!name) {
      return NextResponse.json({ success: false, error: "Strategy name is required" }, { status: 400 });
    }

    const strategy = await prisma.strategy.create({
      data: {
        id: `strat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId,
        name,
        type: type || "Custom",
        description: description || "",
        market: market || "",
        instrument: instrument || "",
        timeframe: timeframe || "",
        setupRules: setupRules || "",
        entryRules: entryRules || "",
        exitRules: exitRules || "",
        stopLossRules: stopLossRules || "",
        targetRules: targetRules || "",
        riskPerTrade: riskPerTrade ? parseFloat(riskPerTrade) : null,
        maxTradesPerDay: maxTradesPerDay ? parseInt(maxTradesPerDay, 10) : null,
        status: status || "ACTIVE",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    console.error("Strategy POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
