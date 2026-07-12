const { PrismaClient } = require('@prisma/client');
const dns = require('dns').promises;

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

async function getIPv4(host) {
  try {
    const addresses = await dns.resolve4(host);
    return addresses[0];
  } catch (err) {
    return null;
  }
}

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const ip = await getIPv4(host);
  if (!ip) {
    console.log(`Region ${region}: could not resolve host IPv4`);
    return false;
  }

  // Also try aws-1 prefix if aws-0 fails to resolve
  const host1 = `aws-1-${region}.pooler.supabase.com`;
  const ip1 = await getIPv4(host1) || ip;

  // Let's test the primary IP first
  const url = `postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@${ip}:5432/postgres?schema=trade_adhyayan`;
  console.log(`Checking region ${region} via IPv4 ${ip} on port 5432...`);
  
  let prisma = new PrismaClient({
    datasources: { db: { url } }
  });

  try {
    await prisma.user.count();
    console.log(`SUCCESS in region ${region}!`);
    return true;
  } catch (err) {
    const errMsg = err.message || '';
    if (errMsg.includes('does not exist') || errMsg.includes('table') || errMsg.includes('relation')) {
      console.log(`FOUND region ${region}! (Connected successfully via pooler IPv4 ${ip})`);
      return { region, ip };
    } else if (errMsg.includes('tenant/user') && errMsg.includes('not found')) {
      // Try the aws-1 IP if it was different
      if (ip1 !== ip) {
        const url1 = `postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@${ip1}:5432/postgres?schema=trade_adhyayan`;
        console.log(`Checking region ${region} via alternate IPv4 ${ip1} on port 5432...`);
        let prisma1 = new PrismaClient({ datasources: { db: { url: url1 } } });
        try {
          await prisma1.user.count();
          return { region, ip: ip1 };
        } catch (err1) {
          const errMsg1 = err1.message || '';
          if (errMsg1.includes('does not exist') || errMsg1.includes('table') || errMsg1.includes('relation')) {
            console.log(`FOUND region ${region}! (Connected successfully via pooler IPv4 ${ip1})`);
            return { region, ip: ip1 };
          }
        } finally {
          await prisma1.$disconnect();
        }
      }
      console.log(`Region ${region} failed: tenant not found`);
      return false;
    } else {
      console.log(`Region ${region} failed with other error:`);
      console.log(errMsg);
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
      console.log(`\n=============================================`);
      console.log(`ACTIVE REGION DETECTED: ${found.region}`);
      console.log(`ACTIVE POOLER IP: ${found.ip}`);
      console.log(`=============================================`);
      break;
    }
  }
  console.log("Finished.");
}

main();
