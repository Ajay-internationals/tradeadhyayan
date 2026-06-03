const { PrismaClient } = require('@prisma/client');

const supabaseUrl = "postgresql://postgres.kdrvqtptpymaoekiwirf:Ajay%40trade2529@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=trade_adhyayan&connection_limit=10";

process.env.DATABASE_URL = supabaseUrl;

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function main() {
  console.log("Connecting to Supabase DB via Prisma...");
  const start = Date.now();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`\n=== USERS (${users.length}) ===`);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.name}, Email: "${u.email}", Role: ${u.role}, Plan: ${u.plan}`);
    });

    const mentors = await prisma.mentor.findMany({
      include: {
        MentorClient: true,
        ReviewRequest: true,
        MentorshipReview: true
      }
    });
    console.log(`\n=== MENTORS (${mentors.length}) ===`);
    mentors.forEach(m => {
      console.log(`- ID: ${m.id}, Name: ${m.name}, Email: "${m.email}", Clients Assigned: ${m.MentorClient.length}/${m.capacity}`);
    });

    const mentorClients = await prisma.mentorClient.findMany();
    console.log(`\n=== MENTOR CLIENTS (${mentorClients.length}) ===`);
    mentorClients.forEach(mc => {
      console.log(`- ID: ${mc.id}, MentorID: ${mc.mentorId}, ClientID: ${mc.clientId}, Status: ${mc.status}`);
    });

    const reviews = await prisma.reviewRequest.findMany({
      include: {
        MentorshipReview: true
      }
    });
    console.log(`\n=== REVIEW REQUESTS (${reviews.length}) ===`);
    reviews.forEach(r => {
      console.log(`- ID: ${r.id}, ClientID: ${r.clientId}, MentorID: ${r.mentorId}, Status: ${r.status}, ReviewScore: ${r.MentorshipReview?.overallScore || 'N/A'}`);
    });

  } catch (error) {
    console.error("Prisma query failed:", error);
  } finally {
    await prisma.$disconnect();
    console.log(`\nFinished in ${Date.now() - start}ms.`);
  }
}

main();
