const fs = require('fs');
let c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('app/dashboard/page.tsx', c);
