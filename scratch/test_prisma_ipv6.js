const { PrismaClient } = require('@prisma/client');

async function main() {
  const directUrl = "postgresql://postgres:Ajay%40tradeadhyayan2529@[2406:da1c:61c:d601:35c9:faf0:f918:9e65]:5432/postgres?schema=trade_adhyayan&sslmode=no-verify";
  console.log("Connecting using direct IPv6 URL...");
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: directUrl
      }
    }
  });

  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! User count:", userCount);
  } catch (error) {
    console.error("FAILED with direct IPv6:", error.message || error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}

main();
