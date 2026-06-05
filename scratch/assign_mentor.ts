import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Creating new mentor...");
  const mentorEmail = "newmentor@tradeadhyayan.com";
  
  let mentorUser = await prisma.user.findUnique({ where: { email: mentorEmail } });
  
  if (!mentorUser) {
    mentorUser = await prisma.user.create({
      data: {
        id: "usr_mentor_" + Date.now(),
        name: "Pro Mentor Setup",
        email: mentorEmail,
        passwordHash: "Mentor123!@#", // Password for logging in
        role: "MENTOR",
        updatedAt: new Date(),
      }
    });
  }

  console.log("Mentor user created:", mentorUser.email);

  let mentorProfile = await prisma.mentor.findUnique({ where: { userId: mentorUser.id } });
  if (!mentorProfile) {
    mentorProfile = await prisma.mentor.create({
      data: {
        id: "mnt_" + Date.now(),
        userId: mentorUser.id,
        name: mentorUser.name,
        email: mentorUser.email,
        phone: "+91 9999999999",
        capacity: 10,
        payoutShare: 40,
        status: "ACTIVE",
        specialization: "Options Scalping",
        experience: "5 Years",
        updatedAt: new Date(),
      }
    });
  }

  console.log("Mentor profile created:", mentorProfile.id);

  // Unassign all existing students from any mentors
  await prisma.mentorClient.deleteMany({});
  console.log("Cleared existing mentor-client allocations.");

  const students = await prisma.user.findMany({
    where: { 
      email: {
        in: [
          "student1_loss@tradeadhyayan.com",
          "student2_breakeven@tradeadhyayan.com",
          "student3_profit@tradeadhyayan.com"
        ]
      }
    }
  });

  console.log("Found students:", students.map(s => s.email));

  for (const student of students) {
    await prisma.mentorClient.create({
      data: {
        id: "mc_" + student.id + "_" + Date.now(),
        mentorId: mentorProfile.id,
        clientId: student.id,
        status: "ACTIVE"
      }
    });
    console.log(`Assigned ${student.email} to ${mentorEmail}.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
