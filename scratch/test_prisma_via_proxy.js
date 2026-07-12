const net = require('net');
const { PrismaClient } = require('@prisma/client');

// 1. Create a local TCP proxy
const PROXY_PORT = 6439;
const DB_HOST = 'db.fmgoaqkcpjalhnbnuqni.supabase.co';
const DB_PORT = 5432;

const proxyServer = net.createServer((localSocket) => {
  console.log('Proxy: New connection from Prisma client.');
  
  const remoteSocket = net.connect(DB_PORT, DB_HOST, () => {
    console.log('Proxy: Connected to Supabase.');
  });
  
  localSocket.pipe(remoteSocket);
  remoteSocket.pipe(localSocket);
  
  localSocket.on('error', (err) => {
    console.error('Proxy: Local socket error:', err.message);
    remoteSocket.destroy();
  });
  
  remoteSocket.on('error', (err) => {
    console.error('Proxy: Remote socket error:', err.message);
    localSocket.destroy();
  });
});

proxyServer.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`Proxy: Listening on 127.0.0.1:${PROXY_PORT}`);
  runPrismaTest();
});

// 2. Run Prisma Test
async function runPrismaTest() {
  const localUrl = `postgresql://postgres:Ajay%40tradeadhyayan2529@127.0.0.1:${PROXY_PORT}/postgres?schema=trade_adhyayan&sslmode=no-verify`;
  console.log("Connecting Prisma to local proxy URL...");
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: localUrl
      }
    }
  });

  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! User count via local proxy:", userCount);
  } catch (error) {
    console.error("FAILED via local proxy:", error.message || error);
  } finally {
    await prisma.$disconnect();
    proxyServer.close(() => {
      console.log("Proxy server closed.");
    });
  }
}
