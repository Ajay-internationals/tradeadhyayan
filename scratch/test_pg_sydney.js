const { Client } = require('pg');

async function testConnection() {
  const connectionString = "postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres";
  console.log("Testing connection to Sydney pooler with pg client...");
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log("SUCCESS: Connected to Sydney pooler!");
    const res = await client.query('SELECT NOW()');
    console.log("Query response:", res.rows[0]);
  } catch (err) {
    console.error("CONNECTION ERROR:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
