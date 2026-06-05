const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log("Checking Dashboard and Mistakes Engine...");

  try {
    // 1. Get the 3 students we just created
    const users = await prisma.user.findMany({
      where: { email: { startsWith: 'student' } },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    if (users.length === 0) {
      console.log("No test students found.");
      return;
    }

    // 2. We will import the actual server actions logic to run mistake detection
    // But since this is a Node script running outside Next.js, we can just execute the logic
    // Actually, calling the TS function from JS might be tricky if we don't compile.
    // I will simulate what runAutoDetectMistakes does by invoking it if I can, OR just check if mistakes were ALREADY generated, because addDbTrade generates mistakes!

    for (const user of users) {
      console.log(`\n===========================================`);
      console.log(`Analyzing User: ${user.email} (ID: ${user.id})`);

      // Get trades
      const trades = await prisma.trade.findMany({
        where: { userId: user.id }
      });
      console.log(`Total Trades Found: ${trades.length}`);

      // Calculate Metrics manually
      let totalPnl = 0;
      let totalTrades = trades.length;
      let winningTrades = 0;
      
      trades.forEach(t => {
        totalPnl += t.netPnl;
        if (t.netPnl > 0) winningTrades++;
      });
      let winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      console.log(`Calculated Metrics: PnL: ${totalPnl.toFixed(2)}, Win Rate: ${winRate.toFixed(2)}%`);

      // Check Mistakes Engine
      const mistakes = await prisma.mistake.findMany({
        where: { userId: user.id },
        include: { Trade: true }
      });

      console.log(`Mistakes Detected Automatically: ${mistakes.length}`);
      mistakes.forEach(m => {
        console.log(`  - [${m.severity}] ${m.mistakeType} (Loss: ${m.estimatedLoss}) -> ${m.reason}`);
      });

      if (mistakes.length > 0) {
        console.log(`✅ Mistakes Engine Successfully Detected Issues!`);
      } else {
        console.log(`⚠️ No mistakes detected. This could be because trades were perfect, or engine wasn't triggered.`);
      }

      // 3. Verify other tables
      const strategies = await prisma.strategy.findMany({ where: { userId: user.id } });
      const goals = await prisma.goal.findMany({ where: { userId: user.id } });
      const calendar = await prisma.calendarEvent.findMany({ where: { userId: user.id } });

      console.log(`Other Tables Check:`);
      console.log(`  - Strategies: ${strategies.length}`);
      console.log(`  - Goals: ${goals.length}`);
      console.log(`  - Calendar Events: ${calendar.length}`);
    }

    console.log("\n✅ Done checking all tabs and metrics.");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
