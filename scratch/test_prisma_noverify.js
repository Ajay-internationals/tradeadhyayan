const { PrismaClient } = require('@prisma/client');

async function main() {
  const directUrl = "postgresql://postgres:Ajay%40tradeadhyayan2529@db.fmgoaqkcpjalhnbnuqni.supabase.co:5432/postgres?schema=trade_adhyayan&sslmode=no-verify";
  console.log("Connecting using direct URL with sslmode=no-verify...");
  
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
    console.error("FAILED with sslmode=no-verify:", error.message || error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}

main();
