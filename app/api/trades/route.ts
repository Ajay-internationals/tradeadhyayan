import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectAndSaveMistakesForTrade } from "@/app/actions/trades";

async function getUserFromSession() {
  return await prisma.user.findFirst();
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      email,
      symbol,
      instrumentType,
      direction, // "LONG" | "SHORT"
      entryPrice,
      exitPrice,
      quantity,
      entryTime,
      exitTime,
      stopLoss,
      target,
      charges = 0,
      setup,
      strategyId,
      mood,
      notes,
      batchId,
      followedPlan,
      confidenceLevel,
      tags
    } = data;

    let user = null;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
    }
    if (!user) {
      user = await getUserFromSession();
    }
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Validate minimum required fields
    if (!symbol || !direction || !entryPrice || !quantity || !entryTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Trade Calculation Algorithms
    let grossPnl = 0;
    if (exitPrice) {
      if (direction === "LONG") {
        grossPnl = (exitPrice - entryPrice) * quantity;
      } else {
        grossPnl = (entryPrice - exitPrice) * quantity;
      }
    }

    const netPnl = grossPnl - charges;
    const tradeValue = entryPrice * quantity;
    const pnlPercent = tradeValue > 0 ? (netPnl / tradeValue) * 100 : 0;

    // Risk and Reward calculations
    let riskAmount = null;
    let actualRr = null;
    let plannedRr = null;
    let rewardAmount = null;

    if (stopLoss) {
      riskAmount = direction === "LONG" ? (entryPrice - stopLoss) * quantity : (stopLoss - entryPrice) * quantity;
      if (riskAmount && riskAmount !== 0) {
        actualRr = netPnl / riskAmount;
      }
    }

    if (target) {
      rewardAmount = direction === "LONG" ? (target - entryPrice) * quantity : (entryPrice - target) * quantity;
      if (riskAmount && riskAmount !== 0) {
        plannedRr = rewardAmount / riskAmount;
      }
    }

    // Status and Result calculation
    let status = exitPrice ? "CLOSED" : "OPEN";
    let result = "BREAKEVEN"; // Default neutral state for TradeResult enum

    if (status === "CLOSED" || exitPrice) {
      if (netPnl > 0) result = "WIN";
      else if (netPnl < 0) result = "LOSS";
      else result = "BREAKEVEN";
    }

    // Insert into DB
    const trade = await prisma.trade.create({
      data: {
        id: `trd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        source: "MANUAL",
        symbol,
        instrumentType: instrumentType || "STOCK",
        direction,
        entryPrice: Number(entryPrice),
        exitPrice: exitPrice ? Number(exitPrice) : 0,
        quantity: Number(quantity),
        entryTime: new Date(entryTime),
        exitTime: exitTime ? new Date(exitTime) : new Date(entryTime),
        tradeDate: new Date(entryTime),
        stopLoss: stopLoss ? Number(stopLoss) : null,
        target: target ? Number(target) : null,
        charges: Number(charges),
        netPnl,
        pnl: netPnl,
        rr: actualRr || null,
        result: result as any, // Enum
        setup,
        mood,
        notes,
        brokerTradeId: batchId || null,
        followedPlan: followedPlan !== undefined ? Boolean(followedPlan) : true,
        confidenceLevel: confidenceLevel !== undefined ? Number(confidenceLevel) : null,
        tags: tags ? JSON.parse(JSON.stringify(tags)) : null,
        updatedAt: new Date(),
      },
    });

    // Run mistake detector on this manual trade (legacy)
    await detectAndSaveMistakesForTrade(user.id, trade.id);

    // Trigger the new TradeMistake auto-detection in the background
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    fetch(`${appUrl}/api/mistakes/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id })
    }).catch(err => console.error("Auto detect API trigger failed:", err));

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    console.error("Trade create error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
