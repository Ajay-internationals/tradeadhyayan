const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  const plans = [
    {
      name: "Free",
      slug: "FREE",
      price: 0,
      tradeLimit: 30,
      brokerSync: false,
      analytics: false,
      reports: false,
      exports: false,
      mentorAccess: false
    },
    {
      name: "Pro",
      slug: "PRO",
      price: 499,
      tradeLimit: 999999, // Represents unlimited
      brokerSync: true,
      analytics: true,
      reports: true,
      exports: true,
      mentorAccess: false
    },
    {
      name: "Mentorship",
      slug: "MENTORSHIP",
      price: 4999,
      tradeLimit: 999999,
      brokerSync: true,
      analytics: true,
      reports: true,
      exports: true,
      mentorAccess: true
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`Upserted plan: ${plan.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
