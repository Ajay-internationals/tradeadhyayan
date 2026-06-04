import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZerodhaAdapter } from "@/lib/brokers/zerodha.adapter";
import { UpstoxAdapter } from "@/lib/brokers/upstox.adapter";
import { BrokerConnectionData } from "@/lib/brokers/adapter.interface";

export async function POST(req: Request) {
  try {
    const { brokerName } = await req.json();

    // In a real scenario, fetch the current user and their broker connection.
    // Here we use a mock user ID
    const mockUserId = "cmp86dqje0000l2040im7xgg1";

    let adapter;
    if (brokerName === "Zerodha") {
      adapter = new ZerodhaAdapter();
    } else if (brokerName === "Upstox") {
      adapter = new UpstoxAdapter();
    } else {
      return NextResponse.json({ success: false, error: "Unsupported broker" }, { status: 400 });
    }

    // Mock connection data to bypass adapter validations
    const mockConnection: BrokerConnectionData = {
      brokerName,
      accessTokenEncrypted: "mock_token",
    };

    // Fetch executions from adapter
    const executions = await adapter.fetchTrades(mockConnection);
    
    // Normalization Step: Group BUY and SELL by Symbol
    const tradesMap = new Map();
    for (const exec of executions) {
      if (!tradesMap.has(exec.symbol)) {
        tradesMap.set(exec.symbol, { buy: null, sell: null });
      }
      if (exec.transactionType === "BUY") {
        tradesMap.get(exec.symbol).buy = exec;
      } else {
        tradesMap.get(exec.symbol).sell = exec;
      }
    }

    const batchId = `sync_${Date.now()}`;
    let importedCount = 0;

    for (const [symbol, pair] of Array.from(tradesMap.entries())) {
      if (pair.buy && pair.sell) {
        // Complete trade
        const entryExec = pair.buy;
        const exitExec = pair.sell;
        
        const quantity = Math.min(entryExec.quantity, exitExec.quantity);
        const entryPrice = entryExec.price;
        const exitPrice = exitExec.price;
        const grossPnl = (exitPrice - entryPrice) * quantity;
        
        let result = "BREAKEVEN";
        if (grossPnl > 0) result = "WIN";
        if (grossPnl < 0) result = "LOSS";

        await prisma.trade.create({
          data: {
            id: `trd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            userId: mockUserId,
            source: brokerName.toUpperCase(),
            symbol: entryExec.symbol,
            instrumentType: entryExec.segment === "OPTIONS" ? "OPTION" : "STOCK",
            direction: "LONG",
            entryPrice,
            exitPrice,
            quantity,
            entryTime: new Date(entryExec.tradeTime),
            exitTime: new Date(exitExec.tradeTime),
            charges: 0,
            netPnl: grossPnl, // Mock assuming 0 charges
            pnl: grossPnl,
            result: result as any,
            brokerTradeId: batchId, // Storing batchId here for deletion
            status: "CLOSED",
            updatedAt: new Date(),
          }
        });
        importedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      batchId, 
      records: importedCount, 
      rawExecutions: executions.length 
    });

  } catch (error: any) {
    console.error("Broker sync error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to sync broker" }, { status: 500 });
  }
}
