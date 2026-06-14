const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "student1_loss@tradeadhyayan.com";
  console.log("Loading user:", email);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  console.log("User found ID:", user.id);

  // Fetch settings
  const settings = await prisma.userSetting.findUnique({
    where: { userId: user.id }
  }) || {
    maxTradesPerDay: 3,
    revengeTradeWindowMinutes: 15,
    defaultRisk: 1.0,
  };
  console.log("Settings:", settings);

  // Fetch trades
  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    orderBy: { entryTime: "asc" },
    include: { TradePlan: true }
  });
  console.log(`Found ${trades.length} trades.`);

  // Clear previous OPEN mistakes of auto types
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

  const deleted = await prisma.tradeMistake.deleteMany({
    where: {
      userId: user.id,
      status: "OPEN",
      rootCause: null,
      type: { in: autoMistakeTypes }
    }
  });
  console.log("Deleted old OPEN mistakes:", deleted.count);

  const mistakesToCreate = [];
  const tradesByDay = {};

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

    console.log(`\nEvaluating trade ${trade.id} - Symbol: ${trade.symbol}, Price: ${trade.entryPrice}, StopLoss: ${trade.stopLoss}, Target: ${trade.target}, PNL: ${trade.pnl}`);

    // Rule 1: Overtrading
    const dateStr = new Date(trade.entryTime).toLocaleDateString("en-US", {
      timeZone: user.timezone || "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const dayTrades = tradesByDay[dateStr] || [];
    const tradeIdx = dayTrades.findIndex(t => t.id === trade.id);
    if (tradeIdx >= dailyTradeLimit) {
      console.log("-> OVERTRADING triggered!");
      mistakesToCreate.push({
        userId: user.id,
        tradeId: trade.id,
        type: "Overtrading",
        severity: lossImpact > 3000 ? "HIGH" : lossImpact > 1000 ? "MEDIUM" : "LOW",
        reason: `You took trade #${tradeIdx + 1} today, which exceeds your daily trade limit of ${dailyTradeLimit}.`,
        suggestion: `Stick to your daily limit of ${dailyTradeLimit} trades. Lock your trading terminal after your limit is reached.`,
        lossImpact,
        status: "OPEN"
      });
    }

    // Rule 2: Revenge Trading
    const revengeWindowMs = 15 * 60 * 1000;
    if (previousTrade) {
      const timeDiff = trade.entryTime.getTime() - previousTrade.exitTime.getTime();
      console.log(`   Time difference from previous exit: ${timeDiff / 60000} mins. Prev PnL: ${previousTrade.pnl}`);
      if (
        previousTrade.pnl < 0 &&
        timeDiff <= revengeWindowMs &&
        timeDiff > 0
      ) {
        console.log("-> REVENGE TRADING triggered!");
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "Revenge Trading",
          severity: lossImpact > 3000 ? "HIGH" : lossImpact > 1000 ? "MEDIUM" : "LOW",
          reason: `You entered this trade within ${Math.round(timeDiff / 60000)} minutes after a loss. This indicates revenge trading.`,
          suggestion: "After every loss, take a 20-minute break before next trade.",
          lossImpact,
          status: "OPEN"
        });
      }
    }

    // Rule 3: No Stop Loss
    if (!trade.stopLoss || trade.stopLoss <= 0) {
      console.log("-> NO STOP LOSS triggered!");
      mistakesToCreate.push({
        userId: user.id,
        tradeId: trade.id,
        type: "No Stop Loss",
        severity: "HIGH",
        reason: "This trade was executed without a stop loss.",
        suggestion: "Always define and set a stop loss before entry.",
        lossImpact,
        status: "OPEN"
      });
    }

    // Rule 4: Risk Too High
    if (trade.stopLoss && trade.stopLoss > 0) {
      const riskAmount = Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity;
      const riskPercent = (riskAmount / capital) * 100;
      console.log(`   Risk percent calculated: ${riskPercent}%`);
      if (riskPercent > maxRiskPercent) {
        console.log("-> RISK TOO HIGH triggered!");
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "Risk Too High",
          severity: lossImpact > 3000 ? "HIGH" : lossImpact > 1000 ? "MEDIUM" : "LOW",
          reason: `Your risk per trade was ${riskPercent.toFixed(2)}%, which exceeds your max risk limit of ${maxRiskPercent}%.`,
          suggestion: `Reduce your quantity size or widen/narrow your stop loss to keep risk below ${maxRiskPercent}% of capital.`,
          lossImpact,
          status: "OPEN"
        });
      }
    }

    // Rule 5: Early Exit
    if (trade.target && trade.target > 0 && pnl > 0) {
      const isEarlyExit =
        (trade.direction === "LONG" && trade.exitPrice < trade.target) ||
        (trade.direction === "SHORT" && trade.exitPrice > trade.target);
      const isFear =
        trade.mood?.toLowerCase().includes("fear") ||
        trade.notes?.toLowerCase().includes("fear") ||
        trade.notes?.toLowerCase().includes("scared") ||
        trade.notes?.toLowerCase().includes("early exit");
      
      console.log(`   Early Exit check: isEarlyExit=${isEarlyExit}, isFear=${isFear}`);
      if (isEarlyExit && isFear) {
        console.log("-> EARLY EXIT triggered!");
        mistakesToCreate.push({
          userId: user.id,
          tradeId: trade.id,
          type: "Early Exit",
          severity: "LOW",
          reason: "You exited this trade early before reaching your target due to fear/impatience.",
          suggestion: "Let your winning setups reach the target, or use a trailing stop loss to protect profits.",
          lossImpact: 0,
          status: "OPEN"
        });
      }
    }
  }

  console.log(`\nInserting ${mistakesToCreate.length} mistakes.`);
  if (mistakesToCreate.length > 0) {
    const inserted = await prisma.tradeMistake.createMany({
      data: mistakesToCreate,
      skipDuplicates: true
    });
    console.log("Inserted count:", inserted.count);
  }

  const finalMistakes = await prisma.tradeMistake.findMany({
    where: { userId: user.id }
  });
  console.log("Final total mistakes in DB for user:", finalMistakes.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
