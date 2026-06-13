import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userIdParam = searchParams.get("userId");

    let user = null;
    if (userIdParam) {
      user = await prisma.user.findUnique({ where: { id: userIdParam } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all user mistakes using TradeMistake
    const mistakes = await prisma.tradeMistake.findMany({
      where: { userId: user.id },
      include: {
        trade: true
      },
      orderBy: { createdAt: "desc" }
    });

    const totalMistakesCount = mistakes.length;

    // Most Repeated Mistake
    let mostRepeatedMistake = "None";
    const typeCounts: Record<string, number> = {};
    mistakes.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    if (sortedTypes.length > 0) {
      mostRepeatedMistake = sortedTypes[0][0];
    }

    // Loss Due To Mistakes
    // Logic: sum(trade.pnl where trade.hasMistake = true and pnl < 0)
    // Find unique trades that have at least one mistake and where pnl < 0
    const mistakeTradeIds = Array.from(new Set(mistakes.map(m => m.tradeId)));
    const tradesWithMistakes = await prisma.trade.findMany({
      where: {
        id: { in: mistakeTradeIds },
        pnl: { lt: 0 }
      }
    });
    const lossDueToMistakes = tradesWithMistakes.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0);

    // Discipline Score
    // Logic: disciplineScore = 100 - (mistakeCount * 3) - (majorMistakeCount * 5)
    // Minimum value should be 0.
    const majorMistakeCount = mistakes.filter(m => m.severity === "HIGH").length;
    const disciplineScore = Math.max(0, 100 - (totalMistakesCount * 3) - (majorMistakeCount * 5));

    // Pattern Analysis Breakdowns
    // 1. By Day of Week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const byDayOfWeek: Record<string, number> = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
    };
    mistakes.forEach(m => {
      const dayIndex = new Date(m.createdAt).getDay();
      const dayName = daysOfWeek[dayIndex];
      byDayOfWeek[dayName] = (byDayOfWeek[dayName] || 0) + 1;
    });

    // 2. By Time of Day
    // Morning: 9:00 - 12:00
    // Afternoon: 12:00 - 15:30
    // Late / Night: after 15:30
    const byTimeOfDay = {
      Morning: 0,
      Afternoon: 0,
      Late: 0
    };
    mistakes.forEach(m => {
      if (m.trade && m.trade.entryTime) {
        const time = new Date(m.trade.entryTime);
        const hour = time.getHours();
        const min = time.getMinutes();
        const totalMinutes = hour * 60 + min;

        if (totalMinutes < 12 * 60) {
          byTimeOfDay.Morning++;
        } else if (totalMinutes <= 15 * 60 + 30) {
          byTimeOfDay.Afternoon++;
        } else {
          byTimeOfDay.Late++;
        }
      }
    });

    // 3. By Root Cause
    const rootCauses = ["Fear", "Greed", "FOMO", "Anger", "Impatience", "No plan", "Overconfidence"];
    const byRootCause: Record<string, number> = {
      Fear: 0, Greed: 0, FOMO: 0, Anger: 0, Impatience: 0, "No plan": 0, Overconfidence: 0
    };
    mistakes.forEach(m => {
      if (m.rootCause) {
        // Normalize rootCause casing
        const normalized = rootCauses.find(rc => rc.toLowerCase() === m.rootCause?.toLowerCase());
        if (normalized) {
          byRootCause[normalized] = (byRootCause[normalized] || 0) + 1;
        } else {
          byRootCause[m.rootCause] = (byRootCause[m.rootCause] || 0) + 1;
        }
      }
    });

    // 4. By Severity
    const bySeverity = {
      HIGH: mistakes.filter(m => m.severity === "HIGH").length,
      MEDIUM: mistakes.filter(m => m.severity === "MEDIUM").length,
      LOW: mistakes.filter(m => m.severity === "LOW").length
    };

    // 5. Types breakdown for chart/table
    const breakdown = Object.entries(typeCounts).map(([type, count]) => {
      const typeMistakes = mistakes.filter(m => m.type === type);
      const typeLossImpact = typeMistakes.reduce((sum, m) => sum + (m.lossImpact || 0), 0);
      return {
        type,
        count,
        lossImpact: typeLossImpact
      };
    }).sort((a, b) => b.count - a.count);

    // Mistake Lock Rule: check if 3+ revenge trades in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const revengeTradesInLastWeek = mistakes.filter(m => {
      return m.type === "Revenge Trading" && new Date(m.createdAt) >= oneWeekAgo;
    }).length;

    const showWarning = revengeTradesInLastWeek >= 3;
    const warningMessage = showWarning
      ? "You are not allowed to take next trade until checklist is completed."
      : "";

    // Generate dynamic insights
    const insights: string[] = [];
    if (mistakes.length > 0) {
      if (byTimeOfDay.Afternoon > byTimeOfDay.Morning) {
        insights.push("Your trading mistakes increase during the afternoon session. Consider taking a break after 12:00 PM.");
      }
      if (byRootCause.Fear > byRootCause.Greed) {
        insights.push("Fear is your main psychological barrier. Focus on proper position sizing to reduce emotional stress.");
      } else if (byRootCause.Greed > byRootCause.Fear) {
        insights.push("Greed-driven mistakes are prevalent. Stick strictly to your target exits and avoid chasing extra profits.");
      }
      if (typeCounts["Revenge Trading"] && typeCounts["Revenge Trading"] >= 2) {
        insights.push("Revenge trading is damaging your performance. Establish a hard 20-minute timeout rule after any loss.");
      }
      if (typeCounts["No Stop Loss"] && typeCounts["No Stop Loss"] >= 1) {
        insights.push("You entered trades without a stop loss. Secure your capital by setting hard stops on every position.");
      }
    }

    return NextResponse.json({
      success: true,
      totalMistakes: totalMistakesCount,
      mostRepeatedMistake,
      lossDueToMistakes,
      disciplineScore,
      breakdown,
      byDayOfWeek,
      byTimeOfDay,
      byRootCause,
      bySeverity,
      showWarning,
      warningMessage,
      insights,
      mistakes // send all mistakes for table view
    });
  } catch (error: any) {
    console.error("Error in GET /api/mistakes/summary:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
