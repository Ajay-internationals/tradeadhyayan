import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const mentorEmail = "newmentor@tradeadhyayan.com";
  const rawPassword = "Mentor123!@#";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  
  await prisma.user.update({
    where: { email: mentorEmail },
    data: { passwordHash: hashedPassword }
  });
  
  console.log("Updated password for", mentorEmail);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
