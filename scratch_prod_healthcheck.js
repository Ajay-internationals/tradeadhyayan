/**
 * Comprehensive production webapp health check
 * Tests: Auth, Dashboard, Trades, Reports, Mentor, Admin endpoints on production
 */
const https = require('https');
const http = require('http');

const PROD_URL = 'https://trade-adhyayan-next.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

function fetchUrl(url, opts = {}) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    const req = mod.get(url, { timeout: 15000, ...opts }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body.slice(0, 500), ms: Date.now() - startTime });
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message, ms: Date.now() - startTime }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT', ms: 15000 }); });
  });
}

const pages = [
  // Public pages
  { name: 'Home Page',           url: '/',                  expectStatus: 200 },
  { name: 'Login Page',          url: '/login',             expectStatus: 200 },
  { name: 'Signup Page',         url: '/signup',            expectStatus: 200 },
  { name: 'Features Page',       url: '/features',          expectStatus: 200 },
  { name: 'Pricing Page',        url: '/pricing',           expectStatus: 200 },
  { name: 'Blog Page',           url: '/blog',              expectStatus: 200 },
  { name: 'Contact Page',        url: '/contact',           expectStatus: 200 },
  { name: 'Mentor Landing',      url: '/mentor-program',    expectStatus: 200 },

  // Dashboard pages (may redirect to login - 200 or 307)
  { name: 'Dashboard',           url: '/dashboard',         expectStatus: [200, 307, 308] },
  { name: 'Trade Journal',       url: '/dashboard/trade-journal', expectStatus: [200, 307, 308] },
  { name: 'Reports',             url: '/dashboard/reports', expectStatus: [200, 307, 308] },
  { name: 'Mistakes',            url: '/dashboard/mistakes',expectStatus: [200, 307, 308] },
  { name: 'Mentorship',          url: '/dashboard/mentorship', expectStatus: [200, 307, 308] },
  { name: 'Goals',               url: '/dashboard/goals',   expectStatus: [200, 307, 308] },
  { name: 'Market',              url: '/dashboard/market',  expectStatus: [200, 307, 308] },
  { name: 'Strategies',          url: '/dashboard/strategies', expectStatus: [200, 307, 308] },
  { name: 'Settings',            url: '/dashboard/settings',expectStatus: [200, 307, 308] },
  { name: 'Mentor Dashboard',    url: '/mentor/dashboard',  expectStatus: [200, 307, 308] },
  { name: 'Mentor Reviews',      url: '/mentor/reviews',    expectStatus: [200, 307, 308] },
  { name: 'Mentor Sessions',     url: '/mentor/sessions',   expectStatus: [200, 307, 308] },

  // API Health Checks (should return 200 or 401/403 - not 500)
  { name: 'API: Journal Trades', url: '/api/journal/trades',expectStatus: [200, 401, 403, 405] },
  { name: 'API: Journal KPIs',   url: '/api/journal/kpis',  expectStatus: [200, 401, 403, 405] },
  { name: 'API: User Me',        url: '/api/user/me',       expectStatus: [200, 401, 403, 405] },
  { name: 'API: Brokers Status', url: '/api/brokers/status',expectStatus: [200, 401, 403, 405] },
  { name: 'API: Strategies',     url: '/api/strategies',    expectStatus: [200, 401, 403, 405] },
  { name: 'API: Mistakes Summary',url: '/api/mistakes/summary',expectStatus: [200, 401, 403, 405] },
  { name: 'API: Market Snapshot',url: '/api/market/snapshot',expectStatus: [200, 401, 403, 405] },
];

async function main() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  TRADE ADHYAYAN — PRODUCTION HEALTH CHECK`);
  console.log(`  Target: ${PROD_URL}`);
  console.log(`${'='.repeat(70)}\n`);

  let passed = 0, failed = 0, warnings = 0;
  const results = [];

  for (const page of pages) {
    const res = await fetchUrl(`${PROD_URL}${page.url}`);
    const expected = Array.isArray(page.expectStatus) ? page.expectStatus : [page.expectStatus];
    const ok = expected.includes(res.status);
    
    // Check for server errors in body
    const hasServerError = res.body.includes('Application error') || 
                           res.body.includes('500') && res.status === 500 ||
                           res.body.includes('PrismaClientInitializationError') ||
                           res.body.includes('ENOTFOUND');

    const status = hasServerError ? 'ERROR' : ok ? 'PASS' : 'FAIL';
    if (status === 'PASS') passed++;
    else if (status === 'ERROR') { failed++; }
    else failed++;

    const icon = status === 'PASS' ? '✅' : status === 'ERROR' ? '❌' : '⚠️';
    const line = `${icon} [${res.status}] ${page.name.padEnd(25)} ${res.ms}ms`;
    console.log(line);
    results.push({ ...page, result: status, status: res.status, ms: res.ms, hasServerError, body: res.body });
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  SUMMARY: ${passed} passed | ${failed} failed`);
  console.log(`${'='.repeat(70)}\n`);

  // Print failed ones with details
  const failures = results.filter(r => r.result !== 'PASS');
  if (failures.length > 0) {
    console.log('FAILED CHECKS:');
    for (const f of failures) {
      console.log(`\n  ❌ ${f.name} (${f.url})`);
      console.log(`     Status: ${f.status} | Body preview: ${f.body.slice(0, 200)}`);
    }
  } else {
    console.log('🎉 All checks passed! Production is healthy.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
