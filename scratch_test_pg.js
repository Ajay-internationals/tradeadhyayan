const { Client } = require('pg');

const connectionString = "postgresql://postgres:Ajay%40tradeadhyayan2529@127.0.0.1:5433/postgres?schema=trade_adhyayan";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  console.log("Connecting using pg client...");
  try {
    await client.connect();
    console.log("SUCCESS! Connected using pg client.");
    const res = await client.query("SELECT VERSION()");
    console.log("Version:", res.rows[0].version);
  } catch (err) {
    console.error("FAILED to connect using pg client:", err);
  } finally {
    await client.end();
  }
}

main();
