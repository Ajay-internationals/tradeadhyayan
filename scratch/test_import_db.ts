import { prisma } from '../lib/db';

async function main() {
  console.log("Testing Prisma connection via lib/db.ts import...");
  
  // Set development mode and mock process platform if needed to trigger proxy
  process.env.NODE_ENV = 'development';
  
  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! User count queried via lib/db.ts:", userCount);
  } catch (error) {
    console.error("FAILED via lib/db.ts:", error.message || error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
    process.exit(0);
  }
}

main();
