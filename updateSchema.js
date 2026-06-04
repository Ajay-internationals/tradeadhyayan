const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Update BrokerConnection
schema = schema.replace(
  /model BrokerConnection \{([\s\S]*?)\}/,
  (match, p1) => {
    if (!p1.includes('clientId')) {
      return `model BrokerConnection {${p1}  clientId              String?\n  apiKey                String?\n}`;
    }
    return match;
  }
);

// Update SyncLog
schema = schema.replace(
  /model SyncLog \{([\s\S]*?)\}/,
  (match, p1) => {
    if (!p1.includes('recordsFound')) {
      return `model SyncLog {${p1}  recordsFound     Int              @default(0)\n  recordsImported  Int              @default(0)\n  recordsFailed    Int              @default(0)\n  startedAt        DateTime         @default(now())\n  completedAt      DateTime?\n}`;
    }
    return match;
  }
);

// Update Trade
schema = schema.replace(
  /model Trade \{([\s\S]*?)\}/,
  (match, p1) => {
    if (!p1.includes('brokerTradeId')) {
      // Inject new fields right before createdAt
      const replacement = `  brokerTradeId      String?
  brokerOrderIds     Json?
  exchange           String?
  segment            String?
  strikePrice        Float?
  tradeDate          DateTime?
  status             String            @default("CLOSED") // OPEN, CLOSED, PARTIAL, DRAFT
  grossPnl           Float?
  pnlPercent         Float?
  riskAmount         Float?
  rewardAmount       Float?
  plannedRr          Float?
  actualRr           Float?
  confidenceLevel    Int?
  tags               Json?
  createdAt          DateTime          @default(now())`;
      let newTradeModel = p1.replace(/  createdAt\s+DateTime\s+@default\(now\(\)\)/, replacement);
      return `model Trade {${newTradeModel}}`;
    }
    return match;
  }
);

// Add new models
const newModels = `

model BrokerOrderRaw {
  id            String   @id @default(uuid())
  userId        String
  brokerName    String
  brokerOrderId String?
  rawPayload    Json
  orderTime     DateTime?
  syncId        String?
  createdAt     DateTime @default(now())
}

model BrokerExecution {
  id              String   @id @default(uuid())
  userId          String
  brokerName      String
  brokerOrderId   String?
  brokerTradeId   String?
  symbol          String
  exchange        String?
  segment         String?
  productType     String?
  transactionType String   // BUY, SELL
  quantity        Float
  price           Float
  orderTime       DateTime?
  tradeTime       DateTime?
  status          String?
  createdAt       DateTime @default(now())
}

model TradeSetup {
  id          String   @id @default(uuid())
  userId      String
  name        String
  description String?
  rules       Json?
  createdAt   DateTime @default(now())
}

model TradeChecklist {
  id        String   @id @default(uuid())
  tradeId   String
  userId    String
  itemKey   String
  checked   Boolean  @default(false)
  createdAt DateTime @default(now())
}
`;

if (!schema.includes('model BrokerOrderRaw')) {
  schema += newModels;
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully.');
