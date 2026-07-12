const { Client } = require('pg');

async function testConnection() {
  const connectionString = "postgresql://postgres:Ajay%40tradeadhyayan2529@db.fmgoaqkcpjalhnbnuqni.supabase.co:5432/postgres";
  console.log("Testing connection with pg client (rejectUnauthorized: false)...");
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log("SUCCESS: Connected to database!");
    const res = await client.query('SELECT NOW()');
    console.log("Query response:", res.rows[0]);
  } catch (err) {
    console.error("CONNECTION ERROR:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
