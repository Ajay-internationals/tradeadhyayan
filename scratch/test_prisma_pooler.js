const { PrismaClient } = require('@prisma/client');

async function main() {
  // Try connecting via connection pooler
  const poolerUrl = "postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?schema=trade_adhyayan";
  console.log("Connecting using pooler URL...");
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: poolerUrl
      }
    }
  });

  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! User count via pooler:", userCount);
  } catch (error) {
    console.error("FAILED via pooler:", error.message || error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}

main();
