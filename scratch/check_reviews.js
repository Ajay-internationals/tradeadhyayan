const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const reviews = await prisma.reviewRequest.findMany({
      include: {
        Client: true,
        Mentor: true,
        MentorshipReview: true
      }
    });
    console.log("Review Requests count:", reviews.length);
    console.log("Review Requests details:", JSON.stringify(reviews.slice(0, 5), null, 2));

    const trades = await prisma.trade.findMany({
      take: 5
    });
    console.log("Trades count:", trades.length);
    console.log("Trades samples:", JSON.stringify(trades, null, 2));
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
