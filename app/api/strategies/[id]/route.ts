import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;
    const body = await request.json();
    const {
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

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (description !== undefined) data.description = description;
    if (market !== undefined) data.market = market;
    if (instrument !== undefined) data.instrument = instrument;
    if (timeframe !== undefined) data.timeframe = timeframe;
    if (setupRules !== undefined) data.setupRules = setupRules;
    if (entryRules !== undefined) data.entryRules = entryRules;
    if (exitRules !== undefined) data.exitRules = exitRules;
    if (stopLossRules !== undefined) data.stopLossRules = stopLossRules;
    if (targetRules !== undefined) data.targetRules = targetRules;
    if (riskPerTrade !== undefined) {
      data.riskPerTrade = riskPerTrade !== null && riskPerTrade !== "" ? parseFloat(riskPerTrade) : null;
    }
    if (maxTradesPerDay !== undefined) {
      data.maxTradesPerDay = maxTradesPerDay !== null && maxTradesPerDay !== "" ? parseInt(maxTradesPerDay, 10) : null;
    }
    if (status !== undefined) data.status = status;

    const updatedStrategy = await prisma.strategy.update({
      where: { id: strategyId },
      data
    });

    return NextResponse.json({ success: true, strategy: updatedStrategy });
  } catch (error: any) {
    console.error("Error in PATCH /api/strategies/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;

    // Archive instead of hard-deleting to preserve trade tagging history
    const updatedStrategy = await prisma.strategy.update({
      where: { id: strategyId },
      data: { status: "ARCHIVED" }
    });

    return NextResponse.json({ success: true, message: "Strategy archived successfully.", strategy: updatedStrategy });
  } catch (error: any) {
    console.error("Error in DELETE /api/strategies/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
