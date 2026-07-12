const { PrismaClient } = require('@prisma/client');

async function main() {
  const directUrl = "postgresql://postgres:Ajay%40tradeadhyayan2529@127.0.0.1:5433/postgres?schema=trade_adhyayan&sslmode=no-verify";
  console.log("Connecting using direct URL on port 5432...");
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: directUrl
      }
    }
  });

  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! User count on port 5432:", userCount);
  } catch (error) {
    console.error("FAILED on port 5432:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}

main();
