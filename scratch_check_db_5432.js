const { Client } = require('pg');

const url1 = "postgresql://postgres.kdrvqtptpymaoekiwirf:Ajay%40trade2529@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=trade_adhyayan";
const url2 = "postgresql://postgres.kdrvqtptpymaoekiwirf:Ajay%40trade2529@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?schema=trade_adhyayan";

async function test(url, name) {
  console.log(`Testing ${name}...`);
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`${name} connected successfully!`);
    await client.end();
    return true;
  } catch (err) {
    console.error(`${name} failed to connect:`, err.message);
    return false;
  }
}

async function main() {
  const res1 = await test(url1, "Pgbouncer Port 6543");
  const res2 = await test(url2, "Direct Port 5432");
}

main();
