const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  const email = 'test@example.com';
  console.log("Testing database queries for user email:", email);

  try {
    console.log("1. Finding user...");
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    console.log("User:", user);
    
    if (!user) {
      console.log("No user found. Stopping.");
      return;
    }

    console.log("2. Querying trades...");
    const trades = await prisma.trade.findMany({
      where: { userId: user.id }
    });
    console.log("Trades count:", trades.length);

    console.log("3. Querying strategies...");
    const strategies = await prisma.strategy.findMany({
      where: { userId: user.id }
    });
    console.log("Strategies count:", strategies.length);

    console.log("4. Querying goals...");
    const goals = await prisma.goal.findMany({
      where: { userId: user.id }
    });
    console.log("Goals count:", goals.length);

    console.log("5. Querying userSetting...");
    const settings = await prisma.userSetting.findUnique({
      where: { userId: user.id }
    });
    console.log("Settings found:", !!settings);

    console.log("6. Querying calendarEvent...");
    const events = await prisma.calendarEvent.findMany({
      where: { userId: user.id }
    });
    console.log("Events count:", events.length);

    console.log("7. Querying brokerConnection...");
    const brokerConnections = await prisma.brokerConnection.findMany({
      where: { userId: user.id }
    });
    console.log("BrokerConnections count:", brokerConnections.length);

    console.log("8. Querying syncLog...");
    const connectionIds = brokerConnections.map(c => c.id);
    const syncLogs = await prisma.syncLog.findMany({
      where: { connectionId: { in: connectionIds } }
    });
    console.log("SyncLogs count:", syncLogs.length);

    console.log("9. Querying mistake...");
    const mistakes = await prisma.mistake.findMany({
      where: { userId: user.id },
      include: { Trade: true }
    });
    console.log("Mistakes count:", mistakes.length);

    console.log("10. Querying mentorReview...");
    const mentorReviews = await prisma.mentorReview.findMany({
      where: { userId: user.id }
    });
    console.log("MentorReviews count:", mentorReviews.length);

  } catch (error) {
    console.error("Database query failed:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Done.");
  }
}

runTest();
