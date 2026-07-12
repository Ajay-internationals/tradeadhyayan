const { Client } = require('pg');

async function test(port, name) {
  const host = 'aws-1-ap-southeast-2.pooler.supabase.com';
  const connectionString = `postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@${host}:${port}/postgres?sslmode=no-verify`;
  console.log(`Testing ${name} (Port ${port})...`);
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to ${name}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`[FAILED] ${name}:`, err.message);
    return false;
  }
}

async function main() {
  await test(5432, "Direct Port 5432 (Session Mode)");
  await test(6543, "Transaction Port 6543 (Transaction Mode)");
}

main();
