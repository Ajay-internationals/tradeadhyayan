const fs = require('fs');
const path = require('path');

// Manually parse .env to load DATABASE_URL
let databaseUrl = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  const match = envContent.match(/PRISMA_DATABASE_URL=["']?([^"'\r\n]+)/);
  if (match) {
    databaseUrl = match[1].trim();
  }
} catch (e) {
  console.error('Failed to read .env', e);
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function main() {
  const email = "student1_loss@tradeadhyayan.com";
  console.log("Loading summary for user:", email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found!");
    return;
  }

  // Simulate API Logic
  const mistakes = await prisma.tradeMistake.findMany({
    where: { userId: user.id },
    include: { trade: true },
    orderBy: { createdAt: "desc" }
  });

  console.log("Total mistakes count:", mistakes.length);

  let mostRepeatedMistake = "None";
  const typeCounts = {};
  mistakes.forEach(m => {
    typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  if (sortedTypes.length > 0) {
    mostRepeatedMistake = sortedTypes[0][0];
  }
  console.log("Most repeated mistake:", mostRepeatedMistake);

  const mistakeTradeIds = Array.from(new Set(mistakes.map(m => m.tradeId)));
  const tradesWithMistakes = await prisma.trade.findMany({
    where: {
      id: { in: mistakeTradeIds },
      pnl: { lt: 0 }
    }
  });
  const lossDueToMistakes = tradesWithMistakes.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0);
  console.log("Loss due to mistakes:", lossDueToMistakes);

  const majorMistakeCount = mistakes.filter(m => m.severity === "HIGH").length;
  const disciplineScore = Math.max(0, 100 - (mistakes.length * 3) - (majorMistakeCount * 5));
  console.log("Discipline score:", disciplineScore);

  const byTimeOfDay = { Morning: 0, Afternoon: 0, Late: 0 };
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
  console.log("By Time of Day:", byTimeOfDay);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const revengeTradesInLastWeek = mistakes.filter(m => {
    return m.type === "Revenge Trading" && new Date(m.createdAt) >= oneWeekAgo;
  }).length;
  const showWarning = revengeTradesInLastWeek >= 3;
  console.log("Show warning (Mistake Lock Rule):", showWarning);
}

main().catch(console.error).finally(() => prisma.$disconnect());
