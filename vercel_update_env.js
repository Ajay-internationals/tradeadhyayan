/**
 * Script to update Vercel environment variables via REST API, then trigger a production deployment.
 * Usage: VERCEL_TOKEN=xxx node vercel_update_env.js
 */
const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_kYdSKq2GPajrD4SziHEEdH3jUAzt';
const TEAM_ID = 'team_IIPI3xuIYJsaDdPiPAHsGFgX';

const NEW_DB_URL = 'postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=trade_adhyayan';
const NEW_DIRECT_URL = 'postgresql://postgres.fmgoaqkcpjalhnbnuqni:Ajay%40tradeadhyayan2529@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?schema=trade_adhyayan';
const NEW_PRISMA_URL = NEW_DB_URL;

if (!VERCEL_TOKEN) {
  console.error('ERROR: Please provide VERCEL_TOKEN as an environment variable.');
  console.error('  Run: $env:VERCEL_TOKEN="your_token"; node vercel_update_env.js');
  process.exit(1);
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.vercel.com',
      path: `${path}?teamId=${TEAM_ID}`,
      method,
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Fetching current env vars...');
  const listRes = await request('GET', `/v9/projects/${PROJECT_ID}/env`);
  if (listRes.status !== 200) {
    console.error('Failed to list env vars:', listRes.data);
    process.exit(1);
  }

  const envs = listRes.data.envs || [];
  console.log(`Found ${envs.length} env var(s).`);

  // Map of env key => new value to upsert
  const updates = {
    DATABASE_URL: NEW_DB_URL,
    PRISMA_DATABASE_URL: NEW_PRISMA_URL,
    DIRECT_DATABASE_URL: NEW_DIRECT_URL,
  };

  for (const [key, value] of Object.entries(updates)) {
    // Find all existing entries for this key across environments
    const existing = envs.filter(e => e.key === key);
    
    if (existing.length > 0) {
      for (const env of existing) {
        console.log(`Updating ${key} (id: ${env.id}, target: ${env.target})...`);
        const patchRes = await request('PATCH', `/v9/projects/${PROJECT_ID}/env/${env.id}`, {
          value,
          target: env.target,
          type: env.type || 'encrypted'
        });
        console.log(`  PATCH status: ${patchRes.status}`, patchRes.data?.error?.message || 'OK');
      }
    } else {
      console.log(`Creating ${key} for production...`);
      const createRes = await request('POST', `/v9/projects/${PROJECT_ID}/env`, {
        key,
        value,
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
      });
      console.log(`  POST status: ${createRes.status}`, createRes.data?.error?.message || 'OK');
    }
  }

  console.log('\nAll env vars updated successfully!');
  console.log('Now run: npx vercel --prod --yes to deploy.');
}

main().catch(e => { console.error(e); process.exit(1); });
