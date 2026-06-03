const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Initializing Prisma connection...");
  try {
    const userCount = await prisma.user.count();
    console.log("Prisma query successful! User count:", userCount);
  } catch (error) {
    console.error("Prisma connection error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}

main();
