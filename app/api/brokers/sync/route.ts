import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZerodhaAdapter } from "@/lib/brokers/zerodha.adapter";
import { UpstoxAdapter } from "@/lib/brokers/upstox.adapter";
import { FyersAdapter } from "@/lib/brokers/fyers.adapter";

export async function POST(req: Request) {
  try {
    const { brokerName, email } = await req.json();

    // Resolve user from email (if provided)
    let userId = "cmp86dqje0000l2040im7xgg1"; // default/mock fallback
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (user) {
        userId = user.id;
      }
    }

    let adapter;
    if (brokerName === "Zerodha") {
      adapter = new ZerodhaAdapter();
    } else if (brokerName === "Upstox") {
      adapter = new UpstoxAdapter();
    } else if (brokerName === "FYERS") {
      adapter = new FyersAdapter();
    } else {
      return NextResponse.json({ success: false, error: "Unsupported broker" }, { status: 400 });
    }

    // Fetch connection from database
    const connection = await prisma.brokerConnection.findFirst({
      where: { userId, brokerName }
    });

    if (!connection || !connection.accessTokenEncrypted) {
      return NextResponse.json({ success: false, error: `Not connected to ${brokerName}` }, { status: 401 });
    }

    // Fetch executions and other snapshots from live broker API concurrently
    const [executions, orders, positions, holdings] = await Promise.all([
      adapter.fetchTrades(connection as any),
      adapter.fetchOrders(connection as any),
      adapter.fetchPositions(connection as any),
      adapter.fetchHoldings(connection as any)
    ]);
    
    // Clear old snapshots
    await prisma.$transaction([
      prisma.brokerOrder.deleteMany({ where: { userId, brokerName } }),
      prisma.brokerPosition.deleteMany({ where: { userId, brokerName } }),
      prisma.brokerHolding.deleteMany({ where: { userId, brokerName } }),
    ]);

    // Insert new snapshots
    if (orders.length > 0) {
      await prisma.brokerOrder.createMany({
        data: orders.map(o => ({
          userId,
          brokerName,
          brokerOrderId: o.brokerOrderId,
          symbol: o.symbol,
          exchange: o.exchange,
          transactionType: o.transactionType,
          productType: o.productType,
          quantity: o.quantity,
          price: o.price,
          status: o.status,
          orderTime: o.orderTime ? new Date(o.orderTime) : null,
        }))
      });
    }

    if (positions.length > 0) {
      await prisma.brokerPosition.createMany({
        data: positions.map(p => ({
          userId,
          brokerName,
          symbol: p.symbol,
          exchange: p.exchange,
          productType: p.productType,
          quantity: p.quantity,
          averagePrice: p.averagePrice,
          mtm: p.mtm,
          realizedPnl: p.realizedPnl,
          unrealizedPnl: p.unrealizedPnl,
        }))
      });
    }

    if (holdings.length > 0) {
      await prisma.brokerHolding.createMany({
        data: holdings.map(h => ({
          userId,
          brokerName,
          symbol: h.symbol,
          exchange: h.exchange,
          quantity: h.quantity,
          averagePrice: h.averagePrice,
          currentPrice: h.currentPrice,
          currentValue: h.currentValue,
          pnl: h.pnl,
        }))
      });
    }

    // Normalization Step: Group BUY and SELL by Symbol for Trades
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

    // Prevent Duplicates: Delete any existing synced trades from this broker for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    await prisma.trade.deleteMany({
      where: {
        userId,
        source: brokerName.toUpperCase(),
        entryTime: {
          gte: startOfDay
        }
      }
    });

    for (const [symbol, pair] of Array.from(tradesMap.entries())) {
      if (pair.buy && pair.sell) {
        // Complete trade matched
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
            userId,
            brokerConnectionId: connection.id,
            source: brokerName.toUpperCase(),
            symbol: entryExec.symbol,
            instrumentType: entryExec.segment === "OPTIONS" ? "OPTION" : "STOCK",
            direction: "LONG",
            entryPrice,
            exitPrice,
            quantity,
            entryTime: new Date(entryExec.tradeTime || entryExec.orderTime),
            exitTime: new Date(exitExec.tradeTime || exitExec.orderTime),
            tradeDate: new Date(entryExec.tradeTime || entryExec.orderTime),
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

    await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        lastSyncAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      batchId, 
      records: importedCount, 
      rawExecutions: executions.length,
      orders: orders.length,
      positions: positions.length,
      holdings: holdings.length
    });

  } catch (error: any) {
    console.error("Broker sync error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to sync broker" }, { status: 500 });
  }
}
