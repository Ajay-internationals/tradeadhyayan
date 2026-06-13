import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, email, tradeId, type, severity, reason, lossImpact, rootCause, suggestion } = await req.json();

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!tradeId || !type || !severity || !reason) {
      return NextResponse.json({ error: "Missing required fields (tradeId, type, severity, reason)" }, { status: 400 });
    }

    // Verify trade exists and belongs to the user
    const trade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId: user.id
      }
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found or access denied" }, { status: 404 });
    }

    // Default lossImpact if not provided
    let finalLossImpact = parseFloat(lossImpact);
    if (isNaN(finalLossImpact)) {
      finalLossImpact = trade.pnl < 0 ? Math.abs(trade.pnl) : 0;
    }

    const newMistake = await prisma.tradeMistake.create({
      data: {
        userId: user.id,
        tradeId,
        type,
        severity: severity.toUpperCase(),
        reason,
        lossImpact: finalLossImpact,
        rootCause: rootCause || null,
        suggestion: suggestion || null,
        status: "OPEN"
      },
      include: {
        trade: true
      }
    });

    return NextResponse.json({ success: true, mistake: newMistake });
  } catch (error: any) {
    console.error("Error in POST /api/mistakes/manual:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
