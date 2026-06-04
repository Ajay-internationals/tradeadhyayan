import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getUserFromSession() {
  return await prisma.user.findFirst();
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
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
      mood,
      notes,
      batchId,
    } = data;

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
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    console.error("Trade create error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
