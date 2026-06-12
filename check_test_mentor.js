const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test_mentor@example.com' }
    });
    console.log("User in db:", user);

    const mentor = await prisma.mentor.findFirst({
      where: { email: 'test_mentor@example.com' }
    });
    console.log("Mentor in db:", mentor);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
