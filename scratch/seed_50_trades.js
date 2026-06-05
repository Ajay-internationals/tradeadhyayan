const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function runSeed() {
  console.log("Starting to seed 50 trades per student...");

  try {
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create Students
    const students = [
      { email: "student1_loss@tradeadhyayan.com", name: "Student 1 (Loss)", role: "CLIENT", source: "MANUAL", profile: "loss" },
      { email: "student2_breakeven@tradeadhyayan.com", name: "Student 2 (Breakeven)", role: "CLIENT", source: "EXCEL_IMPORT", profile: "breakeven" },
      { email: "student3_profit@tradeadhyayan.com", name: "Student 3 (Profit)", role: "CLIENT", source: "PASTE_IMPORT", profile: "profit" }
    ];

    const dbUsers = [];
    
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      let user = await prisma.user.findUnique({ where: { email: s.email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: `usr_${Date.now()}_${i}`,
            name: s.name,
            email: s.email,
            passwordHash: passwordHash,
            role: "CLIENT",
            updatedAt: new Date()
          }
        });
        console.log(`Created user: ${s.email}`);
      } else {
        // Clear old trades if any
        await prisma.trade.deleteMany({ where: { userId: user.id }});
      }
      dbUsers.push({ user, config: s });
    }

    // Generate Dates over the last 50 days
    const today = new Date();
    today.setHours(15, 30, 0, 0);

    const generateDates = (count) => {
      const dates = [];
      for (let i = count; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        // Skip weekends
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          dates.push(d);
        }
      }
      // Fill remaining if weekends skipped
      let offset = count + 1;
      while (dates.length < count) {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          dates.unshift(d);
        }
        offset++;
      }
      return dates;
    };

    const tradeDates = generateDates(50);

    // Insert 50 Trades for each
    for (const { user, config } of dbUsers) {
      console.log(`Generating 50 ${config.source} trades for ${user.email}...`);
      const tradesData = [];
      
      let runningPnl = 0;

      for (let i = 0; i < 50; i++) {
        const date = tradeDates[i];
        const entryTime = new Date(date);
        entryTime.setHours(9, 15 + Math.floor(Math.random() * 60)); // Random entry 9:15 to 10:15
        
        const exitTime = new Date(entryTime);
        exitTime.setMinutes(entryTime.getMinutes() + 15 + Math.floor(Math.random() * 120)); // Trade lasts 15-135 mins

        const isLong = Math.random() > 0.5;
        const entryPrice = 200 + Math.random() * 1000;
        const quantity = 50 + Math.floor(Math.random() * 150);
        
        let exitPrice;
        let resultType;

        // Determine outcome based on profile
        if (config.profile === "loss") {
          // Mostly losses: 80% loss, 20% win
          resultType = Math.random() > 0.2 ? "LOSS" : "WIN";
        } else if (config.profile === "breakeven") {
          // Mix: 45% win, 45% loss, 10% breakeven
          const r = Math.random();
          resultType = r < 0.45 ? "WIN" : r < 0.9 ? "LOSS" : "BREAKEVEN";
        } else {
          // Mostly wins: 75% win, 25% loss
          resultType = Math.random() > 0.25 ? "WIN" : "LOSS";
        }

        // Assign exit price to match resultType
        const priceDiff = (Math.random() * 0.02 + 0.005) * entryPrice; // 0.5% to 2.5% move
        if (resultType === "WIN") {
          exitPrice = isLong ? entryPrice + priceDiff : entryPrice - priceDiff;
        } else if (resultType === "LOSS") {
          exitPrice = isLong ? entryPrice - priceDiff : entryPrice + priceDiff;
        } else {
          exitPrice = entryPrice;
        }

        const grossPnl = isLong ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
        const charges = 40 + Math.random() * 20;
        const netPnl = grossPnl - charges;

        const result = netPnl > 0 ? "WIN" : netPnl < 0 ? "LOSS" : "BREAKEVEN";
        runningPnl += netPnl;

        const symbols = ["NIFTY 22500 CE", "BANKNIFTY 48000 PE", "RELIANCE", "TCS", "HDFCBANK"];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const instrumentType = symbol.includes("CE") || symbol.includes("PE") ? "OPTION" : "STOCK";

        tradesData.push({
          id: `trd_${config.profile}_${Date.now()}_${i}`,
          userId: user.id,
          source: config.source,
          symbol: symbol,
          instrumentType: instrumentType,
          direction: isLong ? "LONG" : "SHORT",
          entryPrice: parseFloat(entryPrice.toFixed(2)),
          exitPrice: parseFloat(exitPrice.toFixed(2)),
          quantity: quantity,
          entryTime: entryTime,
          exitTime: exitTime,
          stopLoss: isLong ? parseFloat((entryPrice * 0.98).toFixed(2)) : parseFloat((entryPrice * 1.02).toFixed(2)),
          target: isLong ? parseFloat((entryPrice * 1.04).toFixed(2)) : parseFloat((entryPrice * 0.96).toFixed(2)),
          charges: parseFloat(charges.toFixed(2)),
          netPnl: parseFloat(netPnl.toFixed(2)),
          pnl: parseFloat(grossPnl.toFixed(2)),
          result: result,
          setup: ["Breakout", "Retest", "Scalping", "Support/Resistance"][Math.floor(Math.random() * 4)],
          mood: ["Confident", "Discipline ✓", "FOMO Entry ⚠️", "Revenge Trade ⚠️"][Math.floor(Math.random() * 4)],
          updatedAt: new Date()
        });
      }

      await prisma.trade.createMany({ data: tradesData });
      console.log(`✅ Student ${config.profile} done. Final Net PnL: ${runningPnl.toFixed(2)}`);
    }

    console.log("\nAll Done!");
    console.log("\nCredentials to use:");
    console.log("1. Loss Making Student (Manual Adds):");
    console.log("   Email: student1_loss@tradeadhyayan.com");
    console.log("   Password: password123\n");
    console.log("2. Breakeven Student (Excel Uploads):");
    console.log("   Email: student2_breakeven@tradeadhyayan.com");
    console.log("   Password: password123\n");
    console.log("3. Profitable Student (Pasted Trades):");
    console.log("   Email: student3_profit@tradeadhyayan.com");
    console.log("   Password: password123\n");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();
