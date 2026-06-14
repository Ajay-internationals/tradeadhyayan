const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("=== Users ===");
    users.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

    const mentors = await prisma.mentor.findMany();
    console.log("\n=== Mentors ===");
    mentors.forEach(m => {
      console.log(`ID: ${m.id}, Name: ${m.name}, Email: ${m.email}, UserId: ${m.userId}`);
    });

    const assignments = await prisma.mentorClient.findMany({
      include: {
        Mentor: true,
        Client: true
      }
    });
    console.log("\n=== MentorClient Assignments ===");
    assignments.forEach(a => {
      console.log(`Mentor: ${a.Mentor.name} (${a.Mentor.email}) -> Client: ${a.Client.name} (${a.Client.email})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
