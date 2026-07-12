const { PrismaClient } = require('@prisma/client');

const regions = [
  'ap-south-1',       // Mumbai
  'ap-southeast-1',   // Singapore
  'ap-northeast-1',   // Tokyo
  'ap-northeast-2',   // Seoul
  'ap-southeast-2',   // Sydney
  'us-east-1',        // N. Virginia
  'us-west-2',        // Oregon
  'eu-central-1'      // Frankfurt
];

async function checkRegion(region) {
  const url = `postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@aws-0-${region}.pooler.supabase.com:5432/postgres?schema=trade_adhyayan`;
  console.log(`Checking region ${region} on port 5432...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    await prisma.user.count();
    console.log(`SUCCESS in region ${region}!`);
    return true;
  } catch (err) {
    const errMsg = err.message || '';
    const cleanMsg = errMsg.replace(/\r/g, '').replace(/\n/g, ' | ').trim();
    if (cleanMsg.includes('does not exist') || cleanMsg.includes('table') || cleanMsg.includes('relation')) {
      console.log(`FOUND region ${region}! (Connected successfully)`);
      return true;
    } else {
      console.log(`Region ${region} failed: ${cleanMsg}`);
      return false;
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const region of regions) {
    const found = await checkRegion(region);
    if (found) {
      console.log(`\nActive region is: ${region}`);
      break;
    }
  }
  console.log("Finished.");
}

main();
