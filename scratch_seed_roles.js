const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Ajay%40trade2529@db.kdrvqtptpymaoekiwirf.supabase.co:5432/postgres?schema=trade_adhyayan"
    }
  }
});

async function main() {
  console.log("Seeding admin and mentor roles...");

  const adminEmails = [
    "work.ajayy@gmail.com",
    "ajay.tradeadhyayan@gmail.com",
    "gaurav.tradeadhyayan@gmail.com",
    "admin.ta@gmail.com",
    "ajay@tradeadhyayan.com",
    "gaurav@tradeadhyayan.com"
  ];

  const mentorEmails = [
    "work.ajayy@gmail.com",
    "ajay@tradeadhyayan.com",
    "gaurav@tradeadhyayan.com",
    "gaurav.jhanwar91@gmail.com",
    "gaurav.tradeadhyayan@gmail.com"
  ];

  const defaultPasswordHash = await bcrypt.hash("Admin@123", 10);

  // Set admins
  for (const email of adminEmails) {
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: `usr_adm_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          name: cleanEmail.split("@")[0].toUpperCase(),
          email: cleanEmail,
          passwordHash: defaultPasswordHash,
          role: "ADMIN",
          updatedAt: new Date()
        }
      });
      console.log(`Created admin user: ${cleanEmail}`);
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "ADMIN" }
      });
      console.log(`Updated existing user to ADMIN: ${cleanEmail}`);
    }
  }

  // Set mentors
  for (const email of mentorEmails) {
    const cleanEmail = email.trim().toLowerCase();
    let existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    
    const isAdmin = adminEmails.includes(cleanEmail);
    const targetRole = isAdmin ? "ADMIN" : "MENTOR";

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          id: `usr_men_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          name: cleanEmail.split("@")[0].toUpperCase(),
          email: cleanEmail,
          passwordHash: defaultPasswordHash,
          role: targetRole,
          updatedAt: new Date()
        }
      });
      console.log(`Created user for mentor: ${cleanEmail} (role: ${targetRole})`);
    } else {
      if (!isAdmin) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: "MENTOR" }
        });
        console.log(`Updated user to MENTOR: ${cleanEmail}`);
      }
    }

    // Now make sure they have a Mentor profile
    const existingMentor = await prisma.mentor.findUnique({
      where: { email: cleanEmail }
    });

    if (!existingMentor) {
      await prisma.mentor.create({
        data: {
          id: `men_seed_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          userId: existingUser.id,
          name: existingUser.name,
          email: cleanEmail,
          designation: "Trading Coach",
          bio: "Trade Adhyayan seed mentor profile.",
          experience: "5 Years",
          specialization: "General Technical Analysis",
          capacity: 10,
          payoutShare: 40.0,
          status: "ACTIVE"
        }
      });
      console.log(`Created mentor profile for: ${cleanEmail}`);
    } else {
      // Ensure it is ACTIVE
      await prisma.mentor.update({
        where: { id: existingMentor.id },
        data: { status: "ACTIVE" }
      });
      console.log(`Set mentor profile status to ACTIVE for: ${cleanEmail}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
