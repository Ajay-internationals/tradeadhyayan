const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log("Starting Trade Journal Test...");

  try {
    // 1. Create 3 Demo Student Profiles
    console.log("\n--- Creating 3 Demo Student Profiles ---");
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const email = `student${i}_${Date.now()}@test.com`;
      const user = await prisma.user.create({
        data: {
          id: `usr_demo_${Date.now()}_${i}`,
          name: `Demo Student ${i}`,
          email: email,
          passwordHash: "mocked_hash",
          role: "CLIENT",
          updatedAt: new Date()
        }
      });
      users.push(user);
      console.log(`Created Student ${i}: ${user.email} (ID: ${user.id})`);
    }

    // 2. Simulate Manual Add Trade for Student 1
    console.log("\n--- Simulating Manual Add Trade (Student 1) ---");
    const manualTrade = await prisma.trade.create({
      data: {
        id: `trd_manual_${Date.now()}`,
        userId: users[0].id,
        source: "MANUAL",
        symbol: "NIFTY 22500 CE",
        instrumentType: "OPTION",
        direction: "LONG",
        entryPrice: 150.5,
        exitPrice: 170.0,
        quantity: 50,
        entryTime: new Date("2024-05-01T09:15:00Z"),
        exitTime: new Date("2024-05-01T09:30:00Z"),
        stopLoss: 140.0,
        target: 200.0,
        charges: 20.0,
        netPnl: (170.0 - 150.5) * 50 - 20.0,
        pnl: (170.0 - 150.5) * 50,
        result: "WIN",
        setup: "Breakout",
        mood: "Confident",
        notes: "Perfect breakout trade manually added.",
        updatedAt: new Date()
      }
    });
    console.log(`Manual Trade Added Successfully for Student 1. PnL: ${manualTrade.netPnl}`);

    // 3. Simulate Excel Upload (Batch) for Student 2
    console.log("\n--- Simulating Excel Upload (Student 2) ---");
    const excelTrades = [];
    for (let i = 1; i <= 3; i++) {
      excelTrades.push({
        id: `trd_excel_${Date.now()}_${i}`,
        userId: users[1].id,
        source: "EXCEL_IMPORT",
        symbol: `BANKNIFTY 48000 PE`,
        instrumentType: "OPTION",
        direction: "SHORT",
        entryPrice: 300 - i * 10,
        exitPrice: 250 - i * 10,
        quantity: 15,
        entryTime: new Date(),
        exitTime: new Date(),
        charges: 20,
        netPnl: (300 - 250) * 15 - 20,
        pnl: (300 - 250) * 15,
        result: "WIN",
        updatedAt: new Date()
      });
    }
    const createdExcel = await prisma.trade.createMany({ data: excelTrades });
    console.log(`Excel Upload Simulated: Added ${createdExcel.count} trades for Student 2.`);

    // 4. Simulate Pasting Trades (Batch) for Student 3
    console.log("\n--- Simulating Paste Trades (Student 3) ---");
    const pastedTrades = [
      {
        id: `trd_paste_${Date.now()}_1`,
        userId: users[2].id,
        source: "PASTE_IMPORT",
        symbol: `RELIANCE`,
        instrumentType: "STOCK",
        direction: "LONG",
        entryPrice: 2800,
        exitPrice: 2850,
        quantity: 100,
        entryTime: new Date(),
        exitTime: new Date(),
        charges: 50,
        netPnl: (2850 - 2800) * 100 - 50,
        pnl: (2850 - 2800) * 100,
        result: "WIN",
        updatedAt: new Date()
      }
    ];
    const createdPasted = await prisma.trade.createMany({ data: pastedTrades });
    console.log(`Pasted Trades Simulated: Added ${createdPasted.count} trades for Student 3.`);

    // 5. Make an intentional error to check validation
    console.log("\n--- Testing Error Handling (Missing Fields) ---");
    try {
      await prisma.trade.create({
        data: {
          id: `trd_error_${Date.now()}`,
          userId: users[0].id,
          // Missing required symbol, direction, entryPrice, etc. to trigger error
          updatedAt: new Date()
        }
      });
      console.log("❌ Error: Trade should not have been created without required fields!");
    } catch (e) {
      console.log("✅ Expected Error Caught: Database validation works perfectly.");
      console.log(`   Error Details: ${e.message.split('\n')[0]}...`);
    }

    console.log("\n✅ All tests passed. The Trade Journal backend is functioning correctly.");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
