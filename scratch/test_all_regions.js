const { Client } = require('pg');

const regions = [
  'ap-south-1',       // Mumbai
  'ap-southeast-1',   // Singapore
  'ap-southeast-2',   // Sydney
  'ap-northeast-1',   // Tokyo
  'ap-northeast-2',   // Seoul
  'us-east-1',        // N. Virginia
  'eu-west-1',        // Ireland
  'eu-central-1'      // Frankfurt
];

async function testRegion(region, index) {
  const host = `aws-${index}-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected via aws-${index}-${region}!`);
    const res = await client.query('SELECT NOW()');
    console.log(`[SUCCESS] Query response from aws-${index}-${region}:`, res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.log(`[FAILED] Region aws-${index}-${region}:`, err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function main() {
  console.log("Testing all regions for Supabase pooler...");
  for (const region of regions) {
    for (const index of [0, 1]) {
      const ok = await testRegion(region, index);
      if (ok) {
        console.log(`Found active region: aws-${index}-${region}`);
        return;
      }
    }
  }
  console.log("Completed testing all regions.");
}

main();
