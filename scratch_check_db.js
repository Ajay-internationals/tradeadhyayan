const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const usage = await prisma.featureUsage.findMany();
  console.log("Usage:", usage);
  const trades = await prisma.trade.groupBy({
    by: ['userId'],
    _count: {
      id: true,
    },
  })
  console.log("Trades count:", trades);
}

check().catch(console.error).finally(() => process.exit(0));