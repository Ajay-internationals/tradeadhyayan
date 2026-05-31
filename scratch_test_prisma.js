const fs = require('fs');
const path = require('path');

// Manually parse .env.local file to load DATABASE_URL
let databaseUrl = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
  if (match) {
    // Strip literal escaped '\r\n' or actual newline characters
    databaseUrl = match[1].replace(/\\r\\n/g, '').replace(/\r/g, '').replace(/\n/g, '').trim();
  }
} catch (e) {
  console.error('Failed to read .env.local', e);
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Using DATABASE_URL:', databaseUrl);

const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function main() {
  console.log('Connecting via Prisma...');
  try {
    const userCount = await prisma.user.count();
    console.log('Successfully connected! User count:', userCount);
  } catch (err) {
    console.error('Prisma connection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
