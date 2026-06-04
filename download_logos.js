const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'brokers');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const brokers = [
  {name: 'zerodha', domain: 'zerodha.com'},
  {name: 'upstox', domain: 'upstox.com'},
  {name: 'fyers', domain: 'fyers.in'},
  {name: 'angelone', domain: 'angelone.in'},
  {name: 'dhan', domain: 'dhan.co'},
  {name: 'motilaloswal', domain: 'motilaloswal.com'}
];

async function download() {
  for (const b of brokers) {
    try {
      const res = await fetch(`https://www.google.com/s2/favicons?domain=${b.domain}&sz=128`);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(path.join(dir, b.name + '.png'), Buffer.from(buffer));
        console.log('Downloaded', b.name);
      } else {
        console.log('Failed', b.name, res.status);
      }
    } catch (e) {
      console.log('Error', b.name, e.message);
    }
  }
}

download();
