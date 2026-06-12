const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Fetching latest sync logs...");
  const logs = await prisma.syncLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(logs, null, 2));

  console.log("Fetching latest broker connections...");
  const connections = await prisma.brokerConnection.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });
  console.log(JSON.stringify(connections, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
