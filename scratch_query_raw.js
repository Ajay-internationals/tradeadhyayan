const fs = require('fs');
const path = require('path');

let databaseUrl = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
  if (match) {
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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function main() {
  console.log("Connecting via Prisma to run raw queries...");
  try {
    const schemas = await prisma.$queryRawUnsafe(`
      SELECT schema_name FROM information_schema.schemata;
    `);
    console.log("\n=== SCHEMAS ===");
    console.log(schemas.map(r => r.schema_name));

    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'trade_adhyayan')
      ORDER BY table_schema, table_name;
    `);
    console.log("\n=== TABLES IN PUBLIC / TRADE_ADHYAYAN ===");
    console.table(tables);

  } catch (err) {
    console.error("Prisma Raw Query Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
