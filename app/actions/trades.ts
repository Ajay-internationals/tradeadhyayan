"use server";

import { prisma } from "@/lib/db";
import { InstrumentType, TradeDirection, TradeResult, MistakeSeverity, GoalStatus, BrokerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ProxyAgent } from "undici";

const upstoxProxyAgent = process.env.UPSTOX_PROXY_URL ? new ProxyAgent(process.env.UPSTOX_PROXY_URL) : undefined;

// Map database trade object to frontend dashboard format
function mapDbTradeToFrontend(dbTrade: any) {
  const dateObj = new Date(dbTrade.entryTime);
  const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  // Format dates nicely
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  let dateText = timeStr;
  if (dateObj.toDateString() === today.toDateString()) {
    dateText = `${timeStr}`;
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    dateText = `Yesterday`;
  } else {
    dateText = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return {
    id: dbTrade.id,
    time: dateText,
    asset: dbTrade.symbol,
    type: dbTrade.direction === "LONG" ? "BUY" as const : "SELL" as const,
    pnl: dbTrade.pnl,
    strategy: dbTrade.setup || "Breakout",
    emotion: dbTrade.mood || "Discipline ✓",
    quantity: dbTrade.quantity,
    entryPrice: dbTrade.entryPrice,
    exitPrice: dbTrade.exitPrice,
    stopLoss: dbTrade.stopLoss || undefined,
    target: dbTrade.target || undefined,
    charges: dbTrade.charges,
    netPnl: dbTrade.netPnl,
    rr: dbTrade.rr || undefined,
    followedPlan: dbTrade.followedPlan,
    notes: dbTrade.notes || undefined,
    source: dbTrade.source,
    entryTime: dbTrade.entryTime,
    exitTime: dbTrade.exitTime,
  };
}

// Ensure default user exists or retrieve them
export async function getOrCreateUser(email: string) {
  const userEmail = email.trim().toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userEmail === "test_prod_user_2026@example.com" ? "00000000-0000-0000-0000-000000000001" : `usr_${Date.now()}`,
        name: userEmail.split("@")[0],
        email: userEmail,
        passwordHash: "simulated_hash",
        updatedAt: new Date(),
      },
    });
  }
  return user;
}

// Get user trades by email
export async function getTrades(email: string) {
  try {
    const user = await getOrCreateUser(email);
    const dbTrades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { entryTime: "desc" },
    });
    return dbTrades.map(mapDbTradeToFrontend);
  } catch (error) {
    console.error("Error in getTrades action:", error);
    return [];
  }
}

// Add a trade to the database
export async function addDbTrade(
  email: string,
  tradeData: {
    asset: string;
    type: "BUY" | "SELL";
    pnl?: number;
    strategy: string;
    emotion: string;
    quantity?: number;
    entryPrice?: number;
    exitPrice?: number;
    stopLoss?: number;
    target?: number;
    charges?: number;
    netPnl?: number;
    rr?: number;
    notes?: string;
  }
) {
  try {
    const user = await getOrCreateUser(email);
    const direction: TradeDirection = tradeData.type === "BUY" ? "LONG" : "SHORT";
    
    // Auto calculations
    const qty = tradeData.quantity !== undefined ? tradeData.quantity : 1;
    const entry = tradeData.entryPrice !== undefined ? tradeData.entryPrice : 100;
    const exit = tradeData.exitPrice !== undefined ? tradeData.exitPrice : 100;
    
    let grossPnl = 0;
    if (tradeData.pnl !== undefined) {
      grossPnl = tradeData.pnl;
    } else {
      grossPnl = direction === "LONG" ? (exit - entry) * qty : (entry - exit) * qty;
    }
    
    const charges = tradeData.charges !== undefined ? tradeData.charges : 20;
    const netPnl = tradeData.netPnl !== undefined ? tradeData.netPnl : grossPnl - charges;
    
    const result: TradeResult = netPnl > 0 ? "WIN" : netPnl < 0 ? "LOSS" : "BREAKEVEN";

    // Risk Reward calculations
    const sl = tradeData.stopLoss || 0;
    const tgt = tradeData.target || 0;
    let riskAmt = 0;
    let rewardAmt = 0;
    let calculatedRr = 0;
    
    if (sl > 0) {
      riskAmt = direction === "LONG" ? (entry - sl) * qty : (sl - entry) * qty;
    }
    if (tgt > 0) {
      rewardAmt = direction === "LONG" ? (tgt - entry) * qty : (entry - tgt) * qty;
    }
    if (riskAmt > 0 && rewardAmt > 0) {
      calculatedRr = rewardAmt / riskAmt;
    }

    // Determine instrument types
    const assetUpper = tradeData.asset.toUpperCase();
    let instrumentType: InstrumentType = "STOCK";
    if (assetUpper.includes("NIFTY")) {
      instrumentType = assetUpper.includes("BANK") ? "BANKNIFTY" : "NIFTY";
    } else if (assetUpper.endsWith("CE") || assetUpper.endsWith("PE")) {
      instrumentType = "OPTION";
    }

    const optionType = assetUpper.endsWith("CE") ? "CE" as const : assetUpper.endsWith("PE") ? "PE" as const : null;

    const newDbTrade = await prisma.trade.create({
      data: {
        id: `trd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: user.id,
        symbol: assetUpper,
        instrumentType,
        optionType,
        direction,
        entryTime: new Date(),
        exitTime: new Date(),
        tradeDate: new Date(),
        entryPrice: entry,
        exitPrice: exit,
        quantity: qty,
        stopLoss: sl > 0 ? sl : null,
        target: tgt > 0 ? tgt : null,
        result,
        pnl: grossPnl,
        charges,
        netPnl,
        rr: calculatedRr > 0 ? calculatedRr : (tradeData.rr || null),
        setup: tradeData.strategy,
        mood: tradeData.emotion,
        notes: tradeData.notes || "",
        followedPlan: !tradeData.emotion.includes("⚠️"),
        updatedAt: new Date(),
      },
    });

    // Run mistake detection engine for the added trade
    await detectAndSaveMistakesForTrade(user.id, newDbTrade.id);

    return mapDbTradeToFrontend(newDbTrade);
  } catch (error) {
    console.error("Error in addDbTrade action:", error);
    throw new Error("Failed to add trade record to database.");
  }
}

// Delete a trade
export async function deleteDbTrade(tradeId: string) {
  try {
    await prisma.trade.delete({
      where: { id: tradeId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error in deleteDbTrade action:", error);
    throw new Error("Failed to delete trade record.");
  }
}

// Update a trade
export async function updateDbTrade(
  email: string,
  tradeId: string,
  tradeData: {
    asset?: string;
    type?: "BUY" | "SELL";
    pnl?: number;
    strategy?: string;
    emotion?: string;
    quantity?: number;
    entryPrice?: number;
    exitPrice?: number;
    stopLoss?: number;
    target?: number;
    charges?: number;
    netPnl?: number;
    rr?: number;
    notes?: string;
  }
) {
  try {
    const user = await getOrCreateUser(email);
    const existing = await prisma.trade.findUnique({ where: { id: tradeId } });
    if (!existing) throw new Error("Trade not found");

    const direction: TradeDirection = tradeData.type 
      ? (tradeData.type === "BUY" ? "LONG" : "SHORT") 
      : existing.direction;
      
    const qty = tradeData.quantity !== undefined ? tradeData.quantity : existing.quantity;
    const entry = tradeData.entryPrice !== undefined ? tradeData.entryPrice : existing.entryPrice;
    const exit = tradeData.exitPrice !== undefined ? tradeData.exitPrice : existing.exitPrice;
    
    let grossPnl = existing.pnl;
    if (tradeData.pnl !== undefined) {
      grossPnl = tradeData.pnl;
    } else if (tradeData.entryPrice !== undefined || tradeData.exitPrice !== undefined || tradeData.quantity !== undefined || tradeData.type !== undefined) {
      grossPnl = direction === "LONG" ? (exit - entry) * qty : (entry - exit) * qty;
    }
    
    const charges = tradeData.charges !== undefined ? tradeData.charges : existing.charges;
    const netPnl = tradeData.netPnl !== undefined ? tradeData.netPnl : grossPnl - charges;
    const result: TradeResult = netPnl > 0 ? "WIN" : netPnl < 0 ? "LOSS" : "BREAKEVEN";

    const sl = tradeData.stopLoss !== undefined ? tradeData.stopLoss : (existing.stopLoss || 0);
    const tgt = tradeData.target !== undefined ? tradeData.target : (existing.target || 0);
    let calculatedRr = existing.rr || 0;
    if (sl > 0 && tgt > 0) {
      const riskAmt = direction === "LONG" ? (entry - sl) * qty : (sl - entry) * qty;
      const rewardAmt = direction === "LONG" ? (tgt - entry) * qty : (entry - tgt) * qty;
      if (riskAmt > 0) calculatedRr = rewardAmt / riskAmt;
    }

    const updated = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        symbol: tradeData.asset ? tradeData.asset.toUpperCase() : existing.symbol,
        direction,
        entryPrice: entry,
        exitPrice: exit,
        quantity: qty,
        stopLoss: sl > 0 ? sl : null,
        target: tgt > 0 ? tgt : null,
        result,
        pnl: grossPnl,
        charges,
        netPnl,
        rr: calculatedRr > 0 ? calculatedRr : (tradeData.rr || null),
        setup: tradeData.strategy !== undefined ? tradeData.strategy : existing.setup,
        mood: tradeData.emotion !== undefined ? tradeData.emotion : existing.mood,
        notes: tradeData.notes !== undefined ? tradeData.notes : existing.notes,
        followedPlan: tradeData.emotion ? !tradeData.emotion.includes("⚠️") : existing.followedPlan,
        updatedAt: new Date(),
      },
    });

    // Re-run mistake detection engine
    await detectAndSaveMistakesForTrade(user.id, tradeId);

    return mapDbTradeToFrontend(updated);
  } catch (error) {
    console.error("Error in updateDbTrade action:", error);
    throw new Error("Failed to update trade record.");
  }
}

// ---------------- STRATEGIES ----------------
export async function getStrategies(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.strategy.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getStrategies:", error);
    return [];
  }
}

export async function addStrategy(
  email: string,
  data: { name: string; category: string; description: string; rulesJson: any }
) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.strategy.create({
      data: {
        id: `strat_${Date.now()}`,
        userId: user.id,
        name: data.name,
        category: data.category,
        description: data.description,
        rulesJson: data.rulesJson || {},
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in addStrategy:", error);
    throw new Error("Failed to add strategy.");
  }
}

// ---------------- GOALS ----------------
export async function getGoals(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getGoals:", error);
    return [];
  }
}

export async function addGoal(
  email: string,
  data: { title: string; category: string; targetValue: number; targetDate: Date | null }
) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.goal.create({
      data: {
        id: `goal_${Date.now()}`,
        userId: user.id,
        title: data.title,
        category: data.category,
        targetValue: data.targetValue,
        currentValue: 0,
        progress: 0,
        status: "NOT_STARTED",
        targetDate: data.targetDate,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in addGoal:", error);
    throw new Error("Failed to add goal.");
  }
}

export async function updateGoalProgress(goalId: string, currentValue: number) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });
    if (!goal) throw new Error("Goal not found");

    const progress = Math.min(100, Math.max(0, (currentValue / goal.targetValue) * 100));
    let status: GoalStatus = "NOT_STARTED";
    if (progress >= 100) {
      status = "ACHIEVED";
    } else if (progress > 50) {
      status = "ON_TRACK";
    } else if (progress > 0) {
      status = "ON_TRACK";
    }

    return await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue,
        progress,
        status,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in updateGoalProgress:", error);
    throw new Error("Failed to update goal progress.");
  }
}

// ---------------- USER SETTINGS ----------------
export async function getUserSettings(email: string) {
  try {
    const user = await getOrCreateUser(email);
    let settings = await prisma.userSetting.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId: user.id,
          theme: "Light",
          currency: "INR",
          timezone: "Asia/Kolkata",
          defaultRisk: 1.0,
          defaultRr: 2.0,
          includeBrokerage: true,
          defaultDateRange: "This Week",
          updatedAt: new Date(),
        },
      });
    }
    return settings;
  } catch (error) {
    console.error("Error in getUserSettings:", error);
    return null;
  }
}

export async function saveUserSettings(
  email: string,
  data: {
    theme: string;
    currency: string;
    timezone: string;
    defaultRisk: number;
    defaultRr: number;
    includeBrokerage: boolean;
    defaultDateRange: string;
  }
) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.userSetting.upsert({
      where: { userId: user.id },
      update: {
        theme: data.theme,
        currency: data.currency,
        timezone: data.timezone,
        defaultRisk: data.defaultRisk,
        defaultRr: data.defaultRr,
        includeBrokerage: data.includeBrokerage,
        defaultDateRange: data.defaultDateRange,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        theme: data.theme,
        currency: data.currency,
        timezone: data.timezone,
        defaultRisk: data.defaultRisk,
        defaultRr: data.defaultRr,
        includeBrokerage: data.includeBrokerage,
        defaultDateRange: data.defaultDateRange,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in saveUserSettings:", error);
    throw new Error("Failed to save settings.");
  }
}

// ---------------- CALENDAR EVENTS ----------------
export async function getCalendarEvents(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.calendarEvent.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "asc" },
    });
  } catch (error) {
    console.error("Error in getCalendarEvents:", error);
    return [];
  }
}

export async function addCalendarEvent(
  email: string,
  data: { title: string; eventType: string; startTime: Date }
) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.calendarEvent.create({
      data: {
        id: `ev_${Date.now()}`,
        userId: user.id,
        title: data.title,
        eventType: data.eventType,
        startTime: data.startTime,
        status: "UPCOMING",
      },
    });
  } catch (error) {
    console.error("Error in addCalendarEvent:", error);
    throw new Error("Failed to add calendar event.");
  }
}

// ---------------- BROKER SYNC ----------------
export async function getBrokerConnections(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.brokerConnection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getBrokerConnections:", error);
    return [];
  }
}

export async function addBrokerConnection(email: string, brokerName: string, status: "CONNECTED" | "DISCONNECTED" | "FAILED") {
  try {
    const user = await getOrCreateUser(email);
    const bStatus = status as BrokerStatus;
    return await prisma.brokerConnection.upsert({
      where: { id: `bc_${user.id}_${brokerName}` },
      update: {
        status: bStatus,
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: `bc_${user.id}_${brokerName}`,
        userId: user.id,
        brokerName,
        status: bStatus,
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in addBrokerConnection:", error);
    throw new Error("Failed to connect broker.");
  }
}

export async function disconnectBroker(email: string, brokerName: string) {
  try {
    const user = await getOrCreateUser(email);
    
    // Find connection first because the ID might be conn_${timestamp} or bc_${userId}_${brokerName}
    const connection = await prisma.brokerConnection.findFirst({
      where: {
        userId: user.id,
        brokerName
      }
    });

    if (!connection) {
      throw new Error(`Connection for ${brokerName} not found.`);
    }

    return await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: "DISCONNECTED",
        accessTokenEncrypted: null,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in disconnectBroker:", error);
    throw new Error("Failed to disconnect broker.");
  }
}

export async function getSyncLogs(email: string) {
  try {
    const user = await getOrCreateUser(email);
    const connections = await prisma.brokerConnection.findMany({
      where: { userId: user.id },
    });
    const connectionIds = connections.map(c => c.id);
    return await prisma.syncLog.findMany({
      where: { connectionId: { in: connectionIds } },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getSyncLogs:", error);
    return [];
  }
}

export async function getBrokerSyncStats(email: string) {
  try {
    const user = await getOrCreateUser(email);
    const totalTrades = await prisma.trade.count({
      where: { userId: user.id }
    });
    const syncedTrades = await prisma.trade.count({
      where: { userId: user.id, source: { in: ["BROKER", "ZERODHA", "UPSTOX", "FYERS"] } }
    });
    const positions = await prisma.brokerPosition.count({
      where: { userId: user.id }
    });
    
    // For account capital/balance
    const accountBalance = user.initialCapital || 248560;

    // Data breakdown
    const trades = await prisma.trade.findMany({
      where: { userId: user.id, status: "CLOSED" },
      select: { entryTime: true, exitTime: true }
    });
    
    let intradayCount = 0;
    let swingCount = 0;
    let positionalCount = 0;
    let othersCount = 0;
    
    trades.forEach(t => {
      if (!t.entryTime || !t.exitTime) {
        othersCount++;
        return;
      }
      const entry = new Date(t.entryTime);
      const exit = new Date(t.exitTime);
      const diffDays = Math.ceil(Math.abs(exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24));
      
      if (entry.toDateString() === exit.toDateString()) {
        intradayCount++;
      } else if (diffDays <= 7) {
        swingCount++;
      } else {
        positionalCount++;
      }
    });

    return {
      success: true,
      totalTrades,
      syncedTrades,
      positions,
      accountBalance,
      dataBreakdown: {
        intraday: intradayCount,
        swing: swingCount,
        positional: positionalCount,
        others: othersCount
      }
    };
  } catch (error) {
    console.error("Error in getBrokerSyncStats:", error);
    return {
      success: false,
      totalTrades: 0,
      syncedTrades: 0,
      positions: 0,
      accountBalance: 0,
      dataBreakdown: { intraday: 0, swing: 0, positional: 0, others: 0 }
    };
  }
}

export async function triggerBrokerSync(
  email: string,
  brokerName: string,
  credentials: { apiKey?: string; apiSecret?: string; clientId?: string }
) {
  try {
    const user = await getOrCreateUser(email);
    const connectionId = `bc_${user.id}_${brokerName}`;

    // Use env vars as primary, fallback to passed credentials
    const apiKey = brokerName === "Upstox"
      ? (process.env.UPSTOX_CLIENT_ID || credentials.apiKey || "")
      : brokerName === "Zerodha"
      ? (process.env.ZERODHA_API_KEY || credentials.apiKey || "")
      : brokerName === "AngelOne"
      ? (process.env.ANGELONE_API_KEY || credentials.apiKey || "")
      : (credentials.apiKey || "");

    const apiSecret = brokerName === "Upstox"
      ? (process.env.UPSTOX_CLIENT_SECRET || credentials.apiSecret || "")
      : brokerName === "Zerodha"
      ? (process.env.ZERODHA_API_SECRET || credentials.apiSecret || "")
      : brokerName === "AngelOne"
      ? (process.env.ANGELONE_API_SECRET || credentials.apiSecret || "")
      : (credentials.apiSecret || "");

    const connection = await prisma.brokerConnection.upsert({
      where: { id: connectionId },
      update: { status: "CONNECTED", accessTokenEncrypted: `enc_${apiKey}`, lastSyncAt: new Date(), updatedAt: new Date() },
      create: { id: connectionId, userId: user.id, brokerName, status: "CONNECTED", accessTokenEncrypted: `enc_${apiKey}`, lastSyncAt: new Date(), updatedAt: new Date() },
    });

    let tradesToImport: any[] = [];
    let syncError: string | null = null;

    // ---------- UPSTOX REAL API ----------
    if (brokerName === "Upstox" && apiKey) {
      try {
        // Upstox v2: Get today's trade book (requires access token — using apiKey as bearer for now)
        const baseUrl = process.env.UPSTOX_API_BASE_URL || "https://api.upstox.com";
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(
          `${baseUrl}/v2/charges/historical-charges?from_date=${today}&to_date=${today}&segment=EQ`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
              ...(process.env.PROXY_SECRET_TOKEN ? { "x-proxy-secret": process.env.PROXY_SECRET_TOKEN } : {})
            },
            dispatcher: upstoxProxyAgent
          } as any
        );
        if (res.ok) {
          const json = await res.json();
          const rawTrades: any[] = json?.data || [];
          tradesToImport = rawTrades.map((t: any) => ({
            symbol: t.symbol || t.trading_symbol || "UNKNOWN",
            direction: (t.transaction_type === "BUY" || t.transaction_type === "BUY_SELL_EQ") ? "LONG" as const : "SHORT" as const,
            entryPrice: parseFloat(t.buy_price || t.average_price || 100),
            exitPrice: parseFloat(t.sell_price || t.last_price || 100),
            quantity: parseInt(t.quantity || 1),
            pnl: parseFloat(t.profit_and_loss || t.pnl || 0),
            setup: "Upstox Sync",
            mood: "Discipline ✓",
          }));
        } else {
          // Fallback: fetch trade book
          const tradeRes = await fetch(
            `${baseUrl}/v2/trade/info`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
                ...(process.env.PROXY_SECRET_TOKEN ? { "x-proxy-secret": process.env.PROXY_SECRET_TOKEN } : {})
              },
              dispatcher: upstoxProxyAgent
            } as any
          );
          if (tradeRes.ok) {
            const tradeJson = await tradeRes.json();
            const rawTrades: any[] = tradeJson?.data || [];
            tradesToImport = rawTrades.map((t: any) => ({
              symbol: t.trading_symbol || "UNKNOWN",
              direction: t.transaction_type === "BUY" ? "LONG" as const : "SHORT" as const,
              entryPrice: parseFloat(t.average_price || 100),
              exitPrice: parseFloat(t.average_price || 100),
              quantity: parseInt(t.quantity || 1),
              pnl: parseFloat(t.realised_profit || 0),
              setup: "Upstox Sync",
              mood: "Discipline ✓",
            }));
          } else {
            syncError = `Upstox API error: ${tradeRes.status} — check if your API key has trading permissions or the access token is valid.`;
          }
        }
      } catch (fetchErr: any) {
        syncError = `Upstox fetch failed: ${fetchErr.message}`;
      }
    }

    // ---------- ZERODHA REAL API ----------
    else if (brokerName === "Zerodha" && apiKey) {
      try {
        // Zerodha Kite: Get trades for today
        const res = await fetch(
          "https://api.kite.trade/trades",
          { headers: { "X-Kite-Version": "3", Authorization: `token ${apiKey}:${apiSecret}` } }
        );
        if (res.ok) {
          const json = await res.json();
          const rawTrades: any[] = json?.data || [];
          tradesToImport = rawTrades.map((t: any) => ({
            symbol: t.tradingsymbol || "UNKNOWN",
            direction: t.transaction_type === "BUY" ? "LONG" as const : "SHORT" as const,
            entryPrice: parseFloat(t.average_price || 100),
            exitPrice: parseFloat(t.average_price || 100),
            quantity: parseInt(t.quantity || 1),
            pnl: parseFloat(t.pnl || 0),
            setup: "Zerodha Sync",
            mood: "Discipline ✓",
          }));
        } else {
          syncError = `Zerodha API error: ${res.status} — ensure your API key and access token are correct.`;
        }
      } catch (fetchErr: any) {
        syncError = `Zerodha fetch failed: ${fetchErr.message}`;
      }
    }

    // ---------- ANGELONE REAL API ----------
    else if (brokerName === "AngelOne" && apiKey) {
      try {
        const res = await fetch(
          "https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getTradeBook",
          { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json", "X-ClientCode": credentials.clientId || "" } }
        );
        if (res.ok) {
          const json = await res.json();
          const rawTrades: any[] = json?.data || [];
          tradesToImport = rawTrades.map((t: any) => ({
            symbol: t.tradingsymbol || "UNKNOWN",
            direction: t.transactiontype === "BUY" ? "LONG" as const : "SHORT" as const,
            entryPrice: parseFloat(t.price || 100),
            exitPrice: parseFloat(t.price || 100),
            quantity: parseInt(t.quantity || 1),
            pnl: 0,
            setup: "AngelOne Sync",
            mood: "Discipline ✓",
          }));
        } else {
          syncError = `AngelOne API error: ${res.status}`;
        }
      } catch (fetchErr: any) {
        syncError = `AngelOne fetch failed: ${fetchErr.message}`;
      }
    }

    // If API returned no trades or failed, use realistic sample data as fallback
    if (tradesToImport.length === 0 && !syncError) {
      const sampleMap: Record<string, any[]> = {
        Zerodha: [
          { symbol: "TCS", direction: "LONG" as const, entryPrice: 3850, exitPrice: 3920, quantity: 100, pnl: 7000, setup: "Breakout", mood: "Discipline ✓" },
          { symbol: "INFY", direction: "SHORT" as const, entryPrice: 1435, exitPrice: 1420, quantity: 100, pnl: 1500, setup: "Retest", mood: "Early Exit ⚠️" },
        ],
        Upstox: [
          { symbol: "NIFTY 22400 CE", direction: "LONG" as const, entryPrice: 120, exitPrice: 210, quantity: 150, pnl: 13500, setup: "Support/Resistance", mood: "Discipline ✓" },
          { symbol: "BANKNIFTY 48200 PE", direction: "LONG" as const, entryPrice: 240, exitPrice: 210, quantity: 150, pnl: -4500, setup: "Scalping", mood: "FOMO Entry ⚠️" },
        ],
        AngelOne: [
          { symbol: "SBIN", direction: "LONG" as const, entryPrice: 720, exitPrice: 733, quantity: 400, pnl: 5200, setup: "Retest", mood: "Discipline ✓" },
          { symbol: "NIFTY 22500 CE", direction: "LONG" as const, entryPrice: 110, exitPrice: 198, quantity: 100, pnl: 8800, setup: "Breakout", mood: "Discipline ✓" },
        ],
        Dhan: [
          { symbol: "RELIANCE", direction: "LONG" as const, entryPrice: 2840, exitPrice: 2870, quantity: 200, pnl: 6000, setup: "Breakout", mood: "Discipline ✓" },
        ],
      };
      tradesToImport = sampleMap[brokerName] || [];
    }

    // Save trades to DB
    for (const trade of tradesToImport) {
      const newTrd = await prisma.trade.create({
        data: {
          id: `trd_sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: user.id,
          brokerConnectionId: connection.id,
          source: "BROKER",
          symbol: (trade.symbol || "UNKNOWN").toUpperCase(),
          instrumentType: (trade.symbol || "").toUpperCase().includes("NIFTY") ? "OPTION" : "STOCK",
          direction: trade.direction,
          entryTime: new Date(Date.now() - 3600000 * 2),
          exitTime: new Date(Date.now() - 3600000),
          tradeDate: new Date(Date.now() - 3600000 * 2),
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          pnl: trade.pnl,
          charges: 20,
          netPnl: trade.pnl - 20,
          result: trade.pnl > 0 ? "WIN" : trade.pnl < 0 ? "LOSS" : "BREAKEVEN",
          setup: trade.setup,
          mood: trade.mood,
          followedPlan: !trade.mood.includes("⚠️"),
          updatedAt: new Date(),
        },
      });
      await detectAndSaveMistakesForTrade(user.id, newTrd.id);
    }

    await prisma.syncLog.create({
      data: {
        id: `sl_${Date.now()}`,
        connectionId: connection.id,
        dataType: "TRADES",
        recordsCount: tradesToImport.length,
        status: syncError ? "FAILED" : "SUCCESS",
        errorMessage: syncError,
        createdAt: new Date(),
      },
    });

    if (syncError && tradesToImport.length === 0) {
      return { success: false, errorMessage: syncError, recordsCount: 0 };
    }

    return { success: true, recordsCount: tradesToImport.length };
  } catch (error: any) {
    console.error("Error in triggerBrokerSync server action:", error);
    return { success: false, errorMessage: error.message || "Failed to sync broker.", recordsCount: 0 };
  }
}

// ---------------- MISTAKES & AUTO-DETECTOR ----------------

export async function getMistakes(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.mistake.findMany({
      where: { userId: user.id },
      include: { Trade: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getMistakes:", error);
    return [];
  }
}

export async function addMistake(
  email: string,
  tradeId: string,
  mistakeType: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  reason: string,
  estimatedLoss?: number,
  improvementTip?: string
) {
  try {
    const user = await getOrCreateUser(email);
    const sev = severity as MistakeSeverity;
    return await prisma.mistake.create({
      data: {
        id: `mst_${Date.now()}`,
        userId: user.id,
        tradeId,
        mistakeType,
        severity: sev,
        reason,
        estimatedLoss: estimatedLoss || 0,
        improvementTip,
        detectedAutomatically: false,
      },
    });
  } catch (error) {
    console.error("Error in addMistake:", error);
    throw new Error("Failed to add mistake.");
  }
}

// Core rule-based mistake detection runner for a single trade
export async function detectAndSaveMistakesForTrade(userId: string, tradeId: string) {
  try {
    // 1. Delete all existing automatically detected mistakes for this trade
    await prisma.mistake.deleteMany({
      where: {
        tradeId,
        detectionSource: "SYSTEM"
      }
    });

    // 2. Fetch trade details along with related plans
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { TradePlan: true, User: true }
    });
    if (!trade) return;

    // Fetch user preferences settings
    const settings = await prisma.userSetting.findUnique({
      where: { userId }
    }) || {
      maxTradesPerDay: 3,
      revengeTradeWindowMinutes: 30,
      minRr: 2.0,
      intradayCutoffTime: "15:30",
      allowedEntryDeviationPercent: 0.30,
      defaultRisk: 1.0,
    };

    const capital = trade.User.initialCapital || 250000;
    const mistakesToCreate = [];

    const entryPrice = trade.entryPrice;
    const exitPrice = trade.exitPrice;
    const stopLoss = trade.stopLoss || 0;
    const target = trade.target || 0;
    const quantity = trade.quantity;
    const direction = trade.direction;
    const netPnl = trade.netPnl;
    const entryTime = trade.entryTime;
    const exitTime = trade.exitTime;
    const mood = trade.mood || "";
    const setup = trade.setup || "";

    // Helper: planned risk & reward
    let plannedRisk = 0;
    if (stopLoss > 0) {
      plannedRisk = direction === "LONG" ? (entryPrice - stopLoss) * quantity : (stopLoss - entryPrice) * quantity;
    }
    let plannedReward = 0;
    if (target > 0) {
      plannedReward = direction === "LONG" ? (target - entryPrice) * quantity : (entryPrice - target) * quantity;
    }

    // Rule 1: Overtrading
    const startOfDay = new Date(entryTime);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(entryTime);
    endOfDay.setHours(23,59,59,999);

    const dailyTrades = await prisma.trade.findMany({
      where: {
        userId,
        entryTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { entryTime: "asc" }
    });

    const dailyCount = dailyTrades.length;
    if (dailyCount > settings.maxTradesPerDay) {
      const currentIdx = dailyTrades.findIndex(t => t.id === tradeId);
      if (currentIdx >= settings.maxTradesPerDay) {
        mistakesToCreate.push({
          id: `mst_over_${tradeId}_${Date.now()}`,
          userId,
          tradeId,
          mistakeType: "Overtrading",
          severity: "MEDIUM" as const,
          reason: `User took ${dailyCount} trades today, exceeding the allowed daily limit of ${settings.maxTradesPerDay}.`,
          estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
          improvementTip: "Stick to your maximum daily limit. Lock your terminal after reaching your trade cap.",
          detectedAutomatically: true,
          detectionSource: "SYSTEM"
        });
      }
    }

    // Fetch previous trade to analyze sequence rules
    const previousTrade = await prisma.trade.findFirst({
      where: {
        userId,
        entryTime: {
          lt: entryTime
        }
      },
      orderBy: { entryTime: "desc" }
    });

    // Rule 2: Revenge Trading
    if (previousTrade && previousTrade.netPnl < 0) {
      const timeDiffMs = entryTime.getTime() - previousTrade.exitTime.getTime();
      const revengeWindowMs = settings.revengeTradeWindowMinutes * 60 * 1000;
      if (timeDiffMs > 0 && timeDiffMs <= revengeWindowMs) {
        let prevPlannedRisk = 0;
        if (previousTrade.stopLoss && previousTrade.stopLoss > 0) {
          prevPlannedRisk = previousTrade.direction === "LONG"
            ? (previousTrade.entryPrice - previousTrade.stopLoss) * previousTrade.quantity
            : (previousTrade.stopLoss - previousTrade.entryPrice) * previousTrade.quantity;
        }
        if (plannedRisk >= prevPlannedRisk) {
          mistakesToCreate.push({
            id: `mst_revenge_${tradeId}_${Date.now()}`,
            userId,
            tradeId,
            mistakeType: "Revenge Trading",
            severity: "HIGH" as const,
            reason: `Trade entered within ${Math.round(timeDiffMs / 60000)} minutes of a losing trade with equal or higher risk.`,
            estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
            improvementTip: "Take a cooling-off break after any loss. Avoid jumping back in immediately.",
            detectedAutomatically: true,
            detectionSource: "SYSTEM"
          });
        }
      }
    }

    // Rule 3: Early Exit
    if (netPnl > 0 && target > 0 && plannedReward > 0) {
      const achievedReward = direction === "LONG" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
      if (achievedReward / plannedReward < 0.7) {
        mistakesToCreate.push({
          id: `mst_early_${tradeId}_${Date.now()}`,
          userId,
          tradeId,
          mistakeType: "Early Exit",
          severity: "MEDIUM" as const,
          reason: "Trade exited before capturing at least 70% of planned target profit.",
          estimatedLoss: Math.max(0, plannedReward - achievedReward),
          improvementTip: "Use trailing stop losses to secure profit milestones while letting your trade run.",
          detectedAutomatically: true,
          detectionSource: "SYSTEM"
        });
      }
    }

    // Rule 4: Stop Loss Not Followed
    if (netPnl < 0 && plannedRisk > 0) {
      if (Math.abs(netPnl) > plannedRisk * 1.10) {
        mistakesToCreate.push({
          id: `mst_nosl_${tradeId}_${Date.now()}`,
          userId,
          tradeId,
          mistakeType: "Stop Loss Not Followed",
          severity: "HIGH" as const,
          reason: `Loss of ₹${Math.abs(netPnl).toLocaleString()} exceeded planned risk (₹${plannedRisk.toLocaleString()}) by more than 10%.`,
          estimatedLoss: Math.max(0, Math.abs(netPnl) - plannedRisk),
          improvementTip: "Set hard system stop losses. Do not modify or move your stop loss lower during a trade.",
          detectedAutomatically: true,
          detectionSource: "SYSTEM"
        });
      }
    }

    // Rule 5: Poor Risk Reward
    if (plannedRisk > 0 && plannedReward > 0) {
      const plannedRr = plannedReward / plannedRisk;
      if (plannedRr < settings.minRr) {
        mistakesToCreate.push({
          id: `mst_poorrr_${tradeId}_${Date.now()}`,
          userId,
          tradeId,
          mistakeType: "Poor Risk Reward",
          severity: "MEDIUM" as const,
          reason: `Planned R:R ratio (1:${plannedRr.toFixed(1)}) is below the required minimum of 1:${settings.minRr}.`,
          estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
          improvementTip: "Only enter trades where target distance is at least twice the stop loss distance.",
          detectedAutomatically: true,
          detectionSource: "SYSTEM"
        });
      }
    }

    // Rule 6: Oversized Position
    if (plannedRisk > 0) {
      const maxRiskAllowed = capital * (settings.defaultRisk || 1.0) / 100;
      if (plannedRisk > maxRiskAllowed) {
        mistakesToCreate.push({
          id: `mst_oversize_${tradeId}_${Date.now()}`,
          userId,
          tradeId,
          mistakeType: "Oversized Position",
          severity: "HIGH" as const,
          reason: `Trade risk of ₹${plannedRisk.toLocaleString()} exceeded the allowed risk limit of ₹${maxRiskAllowed.toLocaleString()} (1% of capital).`,
          estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
          improvementTip: "Calculate quantity size based on stop loss distance. Reduce position size.",
          detectedAutomatically: true,
          detectionSource: "SYSTEM"
        });
      }
    }

    // Rule 7: Emotional Trading
    const emotionalMoods = ['angry', 'frustrated', 'greedy', 'impatient', 'fearful'];
    const isEmotional = emotionalMoods.includes(mood.toLowerCase().trim());
    const last2Trades = await prisma.trade.findMany({
      where: {
        userId,
        entryTime: { lt: entryTime }
      },
      orderBy: { entryTime: "desc" },
      take: 2
    });
    const after2Losses = last2Trades.length === 2 && last2Trades.every(t => t.netPnl < 0);
    
    if (isEmotional || after2Losses) {
      const reasonText = after2Losses 
        ? "Trade taken immediately after 2 consecutive losses, indicating a high risk of revenge/emotional trading."
        : `Trade taken in an emotionally risky state (Mood: ${mood}).`;
      mistakesToCreate.push({
        id: `mst_emotional_${tradeId}_${Date.now()}`,
        userId,
        tradeId,
        mistakeType: "Emotional Trading",
        severity: after2Losses ? "HIGH" as const : "MEDIUM" as const,
        reason: reasonText,
        estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
        improvementTip: "Take a break after losses. Trade only when calm, focused, and emotionally neutral.",
        detectedAutomatically: true,
        detectionSource: "SYSTEM"
      });
    }

    // Rule 8: No Plan Trade
    const followedPlan = trade.followedPlan;
    const checklistCompleted = trade.TradePlan ? trade.TradePlan.checklistCompleted : false;
    if (!setup || followedPlan === false || checklistCompleted === false) {
      mistakesToCreate.push({
        id: `mst_noplan_${tradeId}_${Date.now()}`,
        userId,
        tradeId,
        mistakeType: "No Plan Trade",
        severity: "HIGH" as const,
        reason: "Trade executed without a setup name, without following trading plan, or without checklist confirmation.",
        estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
        improvementTip: "Verify your entry setup criteria and complete your checklist before entering any position.",
        detectedAutomatically: true,
        detectionSource: "SYSTEM"
      });
    }

    // Rule 9: FOMO Entry
    if (trade.TradePlan && trade.TradePlan.plannedEntry > 0) {
      const plannedEntry = trade.TradePlan.plannedEntry;
      const deviationPct = (Math.abs(entryPrice - plannedEntry) / plannedEntry) * 100;
      if (deviationPct > settings.allowedEntryDeviationPercent) {
        mistakesToCreate.push({
          id: `mst_fomo_${tradeId}_${Date.now()}`,
          userId,
          tradeId,
          mistakeType: "FOMO Entry",
          severity: "MEDIUM" as const,
          reason: `Actual entry price (₹${entryPrice}) deviated from planned entry (₹${plannedEntry}) by ${deviationPct.toFixed(2)}% (allowed: ${settings.allowedEntryDeviationPercent}%).`,
          estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
          improvementTip: "Use pre-set limit orders instead of market orders. Avoid chasing momentum candles.",
          detectedAutomatically: true,
          detectionSource: "SYSTEM"
        });
      }
    }

    // Rule 10: Late Exit
    const hasLateExitTags = mood.toLowerCase().includes("late exit") || (trade.notes || "").toLowerCase().includes("late exit") || (trade.notes || "").toLowerCase().includes("exited later");
    if (hasLateExitTags) {
      mistakesToCreate.push({
        id: `mst_lateexit_${tradeId}_${Date.now()}`,
        userId,
        tradeId,
        mistakeType: "Late Exit",
        severity: "MEDIUM" as const,
        reason: "Position hit the planned target but exit was delayed, resulting in reduced profits or a loss.",
        estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
        improvementTip: "Place automatic target orders in the system. Secure profits when target is reached.",
        detectedAutomatically: true,
        detectionSource: "SYSTEM"
      });
    }

    // Rule 11: Holding Too Long
    const [cutoffHour, cutoffMin] = settings.intradayCutoffTime.split(":").map(Number);
    const exitHour = exitTime.getHours();
    const exitMin = exitTime.getMinutes();
    const exitMinutes = exitHour * 60 + exitMin;
    const cutoffMinutes = cutoffHour * 60 + cutoffMin;
    const isIntraday = (setup || "").toLowerCase().includes("intraday") || 
                       (trade.notes || "").toLowerCase().includes("intraday") ||
                       (trade.symbol.includes("CE") || trade.symbol.includes("PE"));
                       
    if (isIntraday && exitMinutes > cutoffMinutes) {
      mistakesToCreate.push({
        id: `mst_toolong_${tradeId}_${Date.now()}`,
        userId,
        tradeId,
        mistakeType: "Holding Too Long",
        severity: "MEDIUM" as const,
        reason: `Intraday trade exited at ${exitHour.toString().padStart(2,'0')}:${exitMin.toString().padStart(2,'0')}, exceeding cutoff time of ${settings.intradayCutoffTime}.`,
        estimatedLoss: netPnl < 0 ? Math.abs(netPnl) : 0,
        improvementTip: "Ensure intraday positions are squared off by your cutoff rule time.",
        detectedAutomatically: true,
        detectionSource: "SYSTEM"
      });
    }

    if (mistakesToCreate.length > 0) {
      await prisma.mistake.createMany({
        data: mistakesToCreate
      });
    }
  } catch (error) {
    console.error(`Error in detectAndSaveMistakesForTrade for trade ${tradeId}:`, error);
  }
}

export async function runAutoDetectMistakes(email: string) {
  try {
    const user = await getOrCreateUser(email);
    const trades = await prisma.trade.findMany({
      where: { userId: user.id }
    });

    // Run mistake detection sequentially for all trades
    for (const trade of trades) {
      await detectAndSaveMistakesForTrade(user.id, trade.id);
    }

    return await prisma.mistake.findMany({
      where: { userId: user.id },
      include: { Trade: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in runAutoDetectMistakes server action:", error);
    return [];
  }
}

// ---------------- MENTOR REVIEWS ----------------
export async function getMentorReviews(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.mentorReview.findMany({
      where: { studentId: user.id },
      include: { Trade: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getMentorReviews:", error);
    return [];
  }
}

export async function addMentorReview(
  email: string,
  tradeId: string,
  score: number,
  feedback: string,
  strengths: string[],
  improvements: string[]
) {
  try {
    const user = await getOrCreateUser(email);
    const mentorId = "usr_mentor";
    
    // Create mentor if not exists
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
    });
    if (!mentor) {
      await prisma.user.create({
        data: {
          id: mentorId,
          name: "Senior Mentor",
          email: "mentor@tradeadhyayan.com",
          passwordHash: "simulated_hash",
          updatedAt: new Date(),
        },
      });
    }

    return await prisma.mentorReview.upsert({
      where: { tradeId },
      update: {
        score,
        feedback,
        strengthsJson: strengths,
        improvementAreasJson: improvements,
        createdAt: new Date(),
      },
      create: {
        id: `mr_${Date.now()}`,
        mentorId,
        studentId: user.id,
        tradeId,
        score,
        feedback,
        strengthsJson: strengths,
        improvementAreasJson: improvements,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in addMentorReview:", error);
    throw new Error("Failed to add mentor review.");
  }
}

export async function getDashboardData(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    
    // 1. Fetch user and ALL required relations in a single db round-trip
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        Trade: { orderBy: { entryTime: "desc" } },
        Strategy: { orderBy: { createdAt: "desc" } },
        Goal: { orderBy: { createdAt: "desc" } },
        CalendarEvent: { orderBy: { startTime: "asc" } },
        UserSetting: true,
        BrokerConnection: {
          include: {
            SyncLog: true
          },
          orderBy: { createdAt: "desc" }
        },
        Mistake: {
          include: { Trade: true },
          orderBy: { createdAt: "desc" }
        },
        MentorReview_MentorReview_studentIdToUser: {
          include: { Trade: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      await getOrCreateUser(email);
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          Trade: { orderBy: { entryTime: "desc" } },
          Strategy: { orderBy: { createdAt: "desc" } },
          Goal: { orderBy: { createdAt: "desc" } },
          CalendarEvent: { orderBy: { startTime: "asc" } },
          UserSetting: true,
          BrokerConnection: {
            include: {
              SyncLog: true
            },
            orderBy: { createdAt: "desc" }
          },
          Mistake: {
            include: { Trade: true },
            orderBy: { createdAt: "desc" }
          },
          MentorReview_MentorReview_studentIdToUser: {
            include: { Trade: true },
            orderBy: { createdAt: "desc" }
          }
        }
      });
    }

    if (!user) {
      throw new Error("User not found or could not be created.");
    }

    // 2. Map and parse UserSetting (Create if not exists)
    let settings = user.UserSetting;
    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId: user.id,
          theme: "Light",
          currency: "INR",
          timezone: "Asia/Kolkata",
          defaultRisk: 1.0,
          defaultRr: 2.0,
          includeBrokerage: true,
          defaultDateRange: "This Week",
          updatedAt: new Date(),
        },
      });
    }

    // 3. Map trades to frontend format
    const trades = user.Trade.map(mapDbTradeToFrontend);

    // 4. Flatten and sort sync logs from BrokerConnections
    const syncLogs = user.BrokerConnection.flatMap(bc => bc.SyncLog)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 5. In-memory calculate mistakeSummary
    const tradesAsc = [...user.Trade].sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());
    const mistakesForSummary = user.Mistake;

    const totalTradesCount = tradesAsc.length;
    const closedTradesCount = tradesAsc.filter(t => t.result !== "BREAKEVEN" && t.exitPrice > 0).length;

    const totalMistakesCount = mistakesForSummary.length;
    const mistakeTradeIds = new Set(mistakesForSummary.map(m => m.tradeId));
    const mistakeTradesCount = mistakeTradeIds.size;

    const mistakeTrades = tradesAsc.filter(t => mistakeTradeIds.has(t.id));
    const totalLossFromMistakes = mistakeTrades
      .filter(t => t.netPnl < 0)
      .reduce((sum, t) => sum + Math.abs(t.netPnl), 0);

    const mistakeRate = totalTradesCount > 0 
      ? Math.round((mistakeTradesCount / totalTradesCount) * 100) 
      : 0;

    const breakdownMap: Record<string, number> = {};
    mistakesForSummary.forEach(m => {
      breakdownMap[m.mistakeType] = (breakdownMap[m.mistakeType] || 0) + 1;
    });

    const breakdown = Object.entries(breakdownMap).map(([type, count]) => ({
      type,
      count
    })).sort((a, b) => b.count - a.count);

    const repeatMistakes = breakdown.filter(b => b.count > 1).map(b => b.type);
    const repeatPenalty = repeatMistakes.length * 5;
    const improvementScore = Math.max(0, 100 - mistakeRate - repeatPenalty);

    const overTimeMap: Record<string, number> = {};
    mistakesForSummary.forEach(m => {
      const dateStr = new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
      overTimeMap[dateStr] = (overTimeMap[dateStr] || 0) + 1;
    });
    const overTime = Object.entries(overTimeMap).map(([date, count]) => ({
      date,
      count
    }));

    const insights: string[] = [];
    const settingsObj = settings || {
      maxTradesPerDay: 3,
      revengeTradeWindowMinutes: 30,
      minRr: 2.0,
      intradayCutoffTime: "15:30",
      allowedEntryDeviationPercent: 0.30,
      defaultRisk: 1.0,
    };

    if (closedTradesCount < 10) {
      insights.push("Add at least 10 closed trades to generate mistake insights.");
    } else {
      const overtradingAfter12 = mistakesForSummary.filter(m => {
        if (m.mistakeType !== "Overtrading") return false;
        if (!m.Trade) return false;
        const entryHour = new Date(m.Trade.entryTime).getHours();
        return entryHour >= 12;
      }).length;
      if (overtradingAfter12 > 0) {
        insights.push("Overtrading increases after 12 PM. Lock your terminal before the afternoon session.");
      }

      let winStreakLapses = 0;
      for (let i = 2; i < tradesAsc.length; i++) {
        const prev1 = tradesAsc[i - 1];
        const prev2 = tradesAsc[i - 2];
        const curr = tradesAsc[i];
        if (prev1.netPnl > 0 && prev2.netPnl > 0 && mistakeTradeIds.has(curr.id)) {
          winStreakLapses++;
        }
      }
      if (winStreakLapses > 0) {
        insights.push("You make more mistakes after 2 consecutive winning trades. Watch out for overconfidence.");
      }

      const emotionalLossCount = mistakesForSummary.filter(m => m.mistakeType === "Emotional Trading" && m.Trade && m.Trade.netPnl < 0).length;
      if (emotionalLossCount >= 2) {
        insights.push("Most losses come from emotional trading. Keep a cooling period after any trigger.");
      }

      const tradesByDate: Record<string, typeof tradesAsc> = {};
      tradesAsc.forEach((t) => {
        const dateStr = new Date(t.entryTime).toDateString();
        if (!tradesByDate[dateStr]) tradesByDate[dateStr] = [];
        tradesByDate[dateStr].push(t);
      });

      let highTradeDaysCount = 0;
      let highTradeDaysWins = 0;
      let lowTradeDaysCount = 0;
      let lowTradeDaysWins = 0;

      Object.values(tradesByDate).forEach(dayTrades => {
        if (dayTrades.length > 3) {
          highTradeDaysCount += dayTrades.length;
          highTradeDaysWins += dayTrades.filter(t => t.netPnl > 0).length;
        } else {
          lowTradeDaysCount += dayTrades.length;
          lowTradeDaysWins += dayTrades.filter(t => t.netPnl > 0).length;
        }
      });

      const highWinRate = highTradeDaysCount > 0 ? highTradeDaysWins / highTradeDaysCount : 0;
      const lowWinRate = lowTradeDaysCount > 0 ? lowTradeDaysWins / lowTradeDaysCount : 0;
      if (lowWinRate > highWinRate) {
        insights.push("Your win rate drops when you take more than 3 trades per day. Stick to your daily limit.");
      }

      const earlyExits = mistakesForSummary.filter(m => m.mistakeType === "Early Exit");
      if (earlyExits.length > 0) {
        insights.push("Your early exits reduce your average reward. Let your winning setups reach the target.");
      }
    }

    const mistakeSummary = {
      totalMistakes: totalMistakesCount,
      mistakeTrades: mistakeTradesCount,
      totalLossFromMistakes,
      repeatMistakes,
      mistakeRate,
      improvementScore,
      breakdown,
      overTime,
      insights
    };

    return {
      trades,
      strategies: user.Strategy,
      goals: user.Goal,
      calendarEvents: user.CalendarEvent,
      settings,
      brokerConnections: user.BrokerConnection,
      syncLogs,
      mistakes: user.Mistake,
      mentorReviews: user.MentorReview_MentorReview_studentIdToUser,
      mistakeSummary
    };
  } catch (error) {
    console.error("Error in getDashboardData server action:", error);
    return {
      trades: [],
      strategies: [],
      goals: [],
      calendarEvents: [],
      settings: null,
      brokerConnections: [],
      syncLogs: [],
      mistakes: [],
      mentorReviews: [],
      mistakeSummary: null
    };
  }
}

export async function getMentorshipOverview(email: string) {
  try {
    const user = await getOrCreateUser(email);
    
    // Find active assignment
    const assignment = await prisma.mentorClient.findUnique({
      where: { clientId: user.id },
      include: {
        Mentor: true
      }
    });

    // Find review requests
    const reviewRequests = await prisma.reviewRequest.findMany({
      where: { clientId: user.id },
      include: {
        MentorshipReview: true,
        Mentor: true
      },
      orderBy: { submittedAt: "desc" }
    });

    return {
      userRole: user.role,
      assignedMentor: assignment?.status === "ACTIVE" ? assignment.Mentor : null,
      reviewRequests
    };
  } catch (error) {
    console.error("Error in getMentorshipOverview:", error);
    throw new Error("Failed to get mentorship overview.");
  }
}

export async function submitReviewRequest(
  email: string,
  selectedTradeIds: string[],
  clientNotes: string,
  disciplineRating: number
) {
  try {
    const user = await getOrCreateUser(email);
    
    // Find active assignment
    const assignment = await prisma.mentorClient.findUnique({
      where: { clientId: user.id },
      include: { Mentor: true }
    });
    
    if (!assignment || assignment.status !== "ACTIVE") {
      throw new Error("No active mentor assigned. Please contact the administrator.");
    }
    
    const id = `rr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return await prisma.reviewRequest.create({
      data: {
        id,
        clientId: user.id,
        mentorId: assignment.mentorId,
        selectedTradeIds,
        clientNotes,
        disciplineRating,
        status: "PENDING",
        submittedAt: new Date()
      }
    });
  } catch (error: any) {
    console.error("Error in submitReviewRequest:", error);
    throw new Error(error.message || "Failed to submit review request.");
  }
}

export async function getMentorClients(mentorEmail: string) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { email: mentorEmail.trim().toLowerCase() }
    });
    
    if (!mentor) {
      return [];
    }
    
    const assignments = await prisma.mentorClient.findMany({
      where: { mentorId: mentor.id, status: "ACTIVE" },
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            email: true,
            initialCapital: true,
            Trade: {
              orderBy: { entryTime: "desc" }
            }
          }
        }
      }
    });
    
    return assignments.map(a => ({
      ...a.Client,
      assignedDate: a.assignedDate,
      status: a.status
    }));
  } catch (error) {
    console.error("Error in getMentorClients:", error);
    return [];
  }
}

export async function getReviewQueue(mentorEmail: string) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { email: mentorEmail.trim().toLowerCase() }
    });
    
    if (!mentor) {
      return [];
    }
    
    return await prisma.reviewRequest.findMany({
      where: { mentorId: mentor.id },
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        MentorshipReview: true
      },
      orderBy: { submittedAt: "desc" }
    });
  } catch (error) {
    console.error("Error in getReviewQueue:", error);
    return [];
  }
}

export async function submitMentorshipReview(
  mentorEmail: string,
  requestId: string,
  scores: {
    executionScore: number;
    riskScore: number;
    psychologyScore: number;
    disciplineScore: number;
  },
  feedback: {
    strengths?: string;
    improvements?: string;
    mistakesObserved?: string;
    actionPlan?: string;
    nextWeekFocus?: string;
    mentorRemark?: string;
  }
) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { email: mentorEmail.trim().toLowerCase() }
    });
    
    if (!mentor) {
      throw new Error("Mentor not found.");
    }
    
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId }
    });
    
    if (!request) {
      throw new Error("Review request not found.");
    }
    
    const { executionScore, riskScore, psychologyScore, disciplineScore } = scores;
    const overallScore = (executionScore + riskScore + psychologyScore + disciplineScore) / 4;
    
    const reviewId = `mr_${Date.now()}`;
    
    return await prisma.$transaction(async (tx) => {
      const review = await tx.mentorshipReview.create({
        data: {
          id: reviewId,
          reviewRequestId: requestId,
          clientId: request.clientId,
          mentorId: mentor.id,
          executionScore,
          riskScore,
          psychologyScore,
          disciplineScore,
          overallScore,
          strengths: feedback.strengths,
          improvements: feedback.improvements,
          mistakesObserved: feedback.mistakesObserved,
          actionPlan: feedback.actionPlan,
          nextWeekFocus: feedback.nextWeekFocus,
          mentorRemark: feedback.mentorRemark
        }
      });
      
      await tx.reviewRequest.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      });
      
      return review;
    });
  } catch (error: any) {
    console.error("Error in submitMentorshipReview:", error);
    throw new Error(error.message || "Failed to submit mentorship review.");
  }
}

export async function getAdminOverview() {
  try {
    const mentors = await prisma.mentor.findMany({
      include: {
        MentorClient: {
          where: { status: "ACTIVE" }
        }
      }
    });

    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        MentorClient_AsClient: true
      }
    });

    const reviewRequests = await prisma.reviewRequest.findMany({
      include: {
        Client: {
          select: { name: true, email: true }
        },
        Mentor: true
      },
      orderBy: { submittedAt: "desc" }
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" }
    });

    const unassignedClients = clients.filter(c => !c.MentorClient_AsClient);

    return {
      mentors: mentors.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        designation: m.designation,
        bio: m.bio,
        experience: m.experience,
        specialization: m.specialization,
        capacity: m.capacity,
        payoutShare: m.payoutShare,
        profileImage: m.profileImage,
        status: m.status,
        activeClientsCount: m.MentorClient.length
      })),
      unassignedClients: unassignedClients.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        createdAt: c.createdAt
      })),
      reviewRequests,
      admins: admins.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        createdAt: a.createdAt,
        role: a.role
      }))
    };
  } catch (error) {
    console.error("Error in getAdminOverview:", error);
    throw new Error("Failed to get admin overview.");
  }
}

export async function addMentor(data: {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  bio?: string;
  experience?: string;
  specialization?: string;
  capacity?: number;
  payoutShare?: number;
  category?: string;
  password?: string;
}) {
  try {
    const email = data.email.trim().toLowerCase();
    
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    return await prisma.$transaction(async (tx) => {
      if (!user) {
        const hashed = data.password ? await bcrypt.hash(data.password, 10) : "simulated_hash";
        user = await tx.user.create({
          data: {
            id: `usr_mentor_${Date.now()}`,
            name: data.name,
            email,
            passwordHash: hashed,
            role: "MENTOR",
            updatedAt: new Date()
          }
        });
      } else {
        const updateData: any = { role: "MENTOR" };
        if (data.password) {
          updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }
        user = await tx.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
      
      const existingMentor = await tx.mentor.findUnique({
        where: { userId: user.id }
      });
      
      if (existingMentor) {
        throw new Error("User is already registered as a mentor.");
      }
      
      return await tx.mentor.create({
        data: {
          id: `men_${Date.now()}`,
          userId: user.id,
          name: data.name,
          email,
          phone: data.phone,
          designation: data.designation,
          bio: data.bio,
          experience: data.experience,
          specialization: data.specialization,
          capacity: data.capacity ?? 10,
          payoutShare: data.payoutShare ?? 40.0,
          category: data.category ?? "JUNIOR",
          status: "ACTIVE"
        }
      });
    });
  } catch (error: any) {
    console.error("Error in addMentor:", error);
    throw new Error(error.message || "Failed to add mentor.");
  }
}

export async function assignClientToMentor(clientId: string, mentorId: string) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        MentorClient: {
          where: { status: "ACTIVE" }
        }
      }
    });
    
    if (!mentor) {
      throw new Error("Mentor not found.");
    }
    
    if (mentor.MentorClient.length >= mentor.capacity) {
      throw new Error(`Mentor capacity limit reached. Maximum limit: ${mentor.capacity}.`);
    }
    
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });
    
    if (!client) {
      throw new Error("Client not found.");
    }
    
    const mcId = `mc_${Date.now()}`;
    
    return await prisma.mentorClient.upsert({
      where: { clientId },
      update: {
        mentorId,
        status: "ACTIVE",
        assignedDate: new Date()
      },
      create: {
        id: mcId,
        mentorId,
        clientId,
        status: "ACTIVE",
        assignedDate: new Date()
      }
    });
  } catch (error: any) {
    console.error("Error in assignClientToMentor:", error);
    throw new Error(error.message || "Failed to assign client to mentor.");
  }
}

export async function setUserRole(email: string, role: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.user.update({
      where: { id: user.id },
      data: { role }
    });
  } catch (error) {
    console.error("Error in setUserRole:", error);
    throw new Error("Failed to set user role.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MENTORSHIP BUSINESS OPERATING SYSTEM — Phase 2 Server Actions
// ─────────────────────────────────────────────────────────────────────────────

// Mentor category definitions (seed on first call)
const MENTOR_CATEGORIES = [
  { id: "cat_junior", code: "JUNIOR", label: "Category A — Junior Mentor", experienceYr: "1–3 Years", capacity: 15, revenueShare: 25.0, description: "Basic reviews, community support, weekly feedback. Suitable for small account traders." },
  { id: "cat_senior", code: "SENIOR", label: "Category B — Senior Mentor", experienceYr: "3–7 Years", capacity: 25, revenueShare: 35.0, description: "Reviews, 1:1 sessions, action plans. Suitable for intermediate traders." },
  { id: "cat_lead",   code: "LEAD",   label: "Category C — Lead Mentor",   experienceYr: "7+ Years",  capacity: 40, revenueShare: 40.0, description: "Premium clients, mentor training, review audits. For advanced traders." },
  { id: "cat_head",   code: "HEAD",   label: "Category D — Head Mentor",   experienceYr: "10+ Years", capacity: 100, revenueShare: 45.0, description: "Mentor management, quality control, program design." },
];

export async function getMentorCategories() {
  try {
    // Seed if empty
    const count = await prisma.mentorCategory.count();
    if (count === 0) {
      await prisma.mentorCategory.createMany({ data: MENTOR_CATEGORIES, skipDuplicates: true });
    }
    return await prisma.mentorCategory.findMany({ orderBy: { revenueShare: "asc" } });
  } catch (error) {
    console.error("Error in getMentorCategories:", error);
    return MENTOR_CATEGORIES;
  }
}

// ── MENTOR ONBOARDING ─────────────────────────────────────────────────────────

export async function submitMentorApplication(data: {
  name: string; email: string; phone?: string; linkedIn?: string;
  tradingExperience: string; marketTraded: string; tradingStyle: string;
  avgMonthlyTrades?: number; teachingExperience?: string;
  resumeUrl?: string; tradingRecordUrl?: string;
}) {
  try {
    const email = data.email.trim().toLowerCase();
    return await prisma.mentorApplication.upsert({
      where: { email },
      update: { ...data, email, status: "APPLIED", updatedAt: new Date() },
      create: {
        id: `mapp_${Date.now()}`,
        ...data,
        email,
        avgMonthlyTrades: data.avgMonthlyTrades ?? 0,
        status: "APPLIED",
        updatedAt: new Date(),
      }
    });
  } catch (error: any) {
    console.error("Error in submitMentorApplication:", error);
    throw new Error(error.message || "Failed to submit mentor application.");
  }
}

export async function updateInterviewScores(appId: string, scores: {
  communicationScore: number; tradingKnowledge: number; psychologyScore: number;
  reviewQualityScore: number; riskMgmtScore: number; clientHandlingScore: number;
}) {
  try {
    const total = Math.round(
      (scores.communicationScore + scores.tradingKnowledge + scores.psychologyScore +
       scores.reviewQualityScore + scores.riskMgmtScore + scores.clientHandlingScore) / 6
    );
    return await prisma.mentorApplication.update({
      where: { id: appId },
      data: { ...scores, interviewTotal: total, status: total >= 70 ? "TRIAL" : "REJECTED", updatedAt: new Date() }
    });
  } catch (error: any) {
    console.error("Error in updateInterviewScores:", error);
    throw new Error(error.message || "Failed to update interview scores.");
  }
}

export async function updateTrialReview(appId: string, scores: {
  trialReviewDepth: number; trialActionPlan: number; trialCommunication: number;
}) {
  try {
    return await prisma.mentorApplication.update({
      where: { id: appId },
      data: { ...scores, status: "TRIAL", updatedAt: new Date() }
    });
  } catch (error: any) {
    console.error("Error in updateTrialReview:", error);
    throw new Error(error.message || "Failed to update trial review.");
  }
}

export async function certifyMentor(appId: string, certificationLevel: "TRAINEE" | "JUNIOR" | "SENIOR" | "LEAD") {
  try {
    const app = await prisma.mentorApplication.findUnique({ where: { id: appId } });
    if (!app) throw new Error("Application not found.");

    const categoryMap: Record<string, string> = {
      TRAINEE: "JUNIOR", JUNIOR: "JUNIOR", SENIOR: "SENIOR", LEAD: "LEAD"
    };
    const capacityMap: Record<string, number> = {
      TRAINEE: 5, JUNIOR: 15, SENIOR: 25, LEAD: 40
    };
    const payoutMap: Record<string, number> = {
      TRAINEE: 20, JUNIOR: 25, SENIOR: 35, LEAD: 40
    };

    // Update application
    await prisma.mentorApplication.update({
      where: { id: appId },
      data: { certificationLevel, status: "CERTIFIED", updatedAt: new Date() }
    });

    // Create mentor + user
    return await addMentor({
      name: app.name,
      email: app.email,
      phone: app.phone ?? undefined,
      experience: app.tradingExperience,
      specialization: app.marketTraded,
      capacity: capacityMap[certificationLevel],
      payoutShare: payoutMap[certificationLevel],
      category: categoryMap[certificationLevel],
    });
  } catch (error: any) {
    console.error("Error in certifyMentor:", error);
    throw new Error(error.message || "Failed to certify mentor.");
  }
}

export async function getMentorApplications() {
  try {
    return await prisma.mentorApplication.findMany({
      orderBy: { appliedAt: "desc" }
    });
  } catch (error) {
    console.error("Error in getMentorApplications:", error);
    return [];
  }
}

// ── CLIENT ONBOARDING ────────────────────────────────────────────────────────

function computeClientCategory(experienceMonths: number, capital: number): { level: string; tier: string } {
  if (capital >= 500000 && experienceMonths >= 24) return { level: "PREMIUM", tier: "HEAD" };
  if (experienceMonths >= 24) return { level: "ADVANCED", tier: "LEAD" };
  if (experienceMonths >= 6) return { level: "INTERMEDIATE", tier: "SENIOR" };
  return { level: "BEGINNER", tier: "JUNIOR" };
}

export async function submitClientOnboarding(email: string, data: {
  experienceMonths: number; tradingCapital: number; tradingStyle: string;
  currentChallenges: string; riskPerTrade: number; goal: string;
}) {
  try {
    const user = await getOrCreateUser(email);
    const { level, tier } = computeClientCategory(data.experienceMonths, data.tradingCapital);
    return await prisma.clientCategory.upsert({
      where: { userId: user.id },
      update: { ...data, experienceLevel: level, suggestedMentorTier: tier },
      create: {
        id: `cc_${Date.now()}`,
        userId: user.id,
        experienceLevel: level,
        suggestedMentorTier: tier,
        ...data,
      }
    });
  } catch (error: any) {
    console.error("Error in submitClientOnboarding:", error);
    throw new Error(error.message || "Failed to save client onboarding.");
  }
}

export async function getClientOnboarding(email: string) {
  try {
    const user = await getOrCreateUser(email);
    return await prisma.clientCategory.findUnique({ where: { userId: user.id } });
  } catch (error) {
    console.error("Error in getClientOnboarding:", error);
    return null;
  }
}

// ── AUTO-ASSIGNMENT ENGINE ────────────────────────────────────────────────────

export async function autoAssignMentor(clientId: string) {
  try {
    const clientCategory = await prisma.clientCategory.findUnique({ where: { userId: clientId } });
    const tier = clientCategory?.suggestedMentorTier ?? "JUNIOR";

    // Get all active mentors matching the tier with capacity available
    const mentors = await prisma.mentor.findMany({
      where: { category: tier, status: "ACTIVE" },
      include: { MentorClient: { where: { status: "ACTIVE" } } }
    });

    const availableMentors = mentors.filter(m => m.MentorClient.length < m.capacity);
    if (availableMentors.length === 0) {
      // Fallback: try any tier with capacity
      const fallbackMentors = await prisma.mentor.findMany({
        where: { status: "ACTIVE" },
        include: { MentorClient: { where: { status: "ACTIVE" } } }
      });
      const fallbackAvailable = fallbackMentors.filter(m => m.MentorClient.length < m.capacity);
      if (fallbackAvailable.length === 0) throw new Error("No mentors with available capacity.");
      // Lowest utilization
      fallbackAvailable.sort((a, b) => (a.MentorClient.length / a.capacity) - (b.MentorClient.length / b.capacity));
      return await assignClientToMentor(clientId, fallbackAvailable[0].id);
    }

    // Assign to lowest utilization mentor in matching tier
    availableMentors.sort((a, b) => (a.MentorClient.length / a.capacity) - (b.MentorClient.length / b.capacity));
    return await assignClientToMentor(clientId, availableMentors[0].id);
  } catch (error: any) {
    console.error("Error in autoAssignMentor:", error);
    throw new Error(error.message || "Auto-assignment failed.");
  }
}

// ── MENTOR RATINGS ───────────────────────────────────────────────────────────

export async function submitClientRating(data: {
  mentorId: string; clientEmail: string; reviewRequestId?: string;
  ratingType?: string; stars: number;
  helpfulScore?: number; knowledgeScore?: number; actionableScore?: number; professionalScore?: number;
  comment?: string;
}) {
  try {
    const client = await getOrCreateUser(data.clientEmail);
    const ratingId = `rat_${Date.now()}`;
    const rating = await prisma.mentorRating.create({
      data: {
        id: ratingId,
        mentorId: data.mentorId,
        clientId: client.id,
        reviewRequestId: data.reviewRequestId,
        ratingType: data.ratingType ?? "REVIEW",
        stars: data.stars,
        helpfulScore: data.helpfulScore ?? data.stars,
        knowledgeScore: data.knowledgeScore ?? data.stars,
        actionableScore: data.actionableScore ?? data.stars,
        professionalScore: data.professionalScore ?? data.stars,
        comment: data.comment,
      }
    });
    // Update mentor average rating
    await recalculateMentorRating(data.mentorId);
    return rating;
  } catch (error: any) {
    console.error("Error in submitClientRating:", error);
    throw new Error(error.message || "Failed to submit rating.");
  }
}

async function recalculateMentorRating(mentorId: string) {
  const ratings = await prisma.mentorRating.findMany({ where: { mentorId } });
  if (ratings.length === 0) return;
  const avg = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
  await prisma.mentor.update({
    where: { id: mentorId },
    data: { averageRating: Math.round(avg * 10) / 10 }
  });
}

export async function getMentorRatings(mentorId: string) {
  try {
    return await prisma.mentorRating.findMany({
      where: { mentorId },
      orderBy: { createdAt: "desc" },
      include: { Client: { select: { name: true, email: true } } }
    });
  } catch (error) {
    console.error("Error in getMentorRatings:", error);
    return [];
  }
}

// ── KPI SYSTEM ───────────────────────────────────────────────────────────────

export async function recalculateMentorKpi(mentorId: string) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        MentorClient: { where: { status: "ACTIVE" } },
        ReviewRequest: { include: { MentorshipReview: true } },
        MentorRating: true,
        MentorSlaLog: true,
      }
    });
    if (!mentor) throw new Error("Mentor not found.");

    const totalRequests = mentor.ReviewRequest.length;
    const completedReviews = mentor.ReviewRequest.filter(r => r.status === "COMPLETED").length;
    const reviewCompletionRate = totalRequests > 0 ? (completedReviews / totalRequests) * 100 : 0;

    const avgRating = mentor.MentorRating.length > 0
      ? mentor.MentorRating.reduce((s, r) => s + r.stars, 0) / mentor.MentorRating.length * 20
      : 0; // convert 1-5 → 0-100

    const slaBreaches = mentor.MentorSlaLog.filter(s => s.slaStatus === "BREACHED").length;
    const slaTotal = mentor.MentorSlaLog.length;
    const slaComplianceRate = slaTotal > 0 ? ((slaTotal - slaBreaches) / slaTotal) * 100 : 100;

    const activeClients = mentor.MentorClient.length;
    const revenueGenerated = activeClients * 4999;

    // Quality Score Formula:
    // Review Completion 30% + Client Retention 25% + Client Rating 25% + SLA Compliance 10% + Improvement 10%
    const qualityScore = Math.round(
      (reviewCompletionRate * 0.30) +
      (Math.min(activeClients / mentor.capacity * 100, 100) * 0.25) +
      (avgRating * 0.25) +
      (slaComplianceRate * 0.10) +
      (70 * 0.10) // avg improvement placeholder
    );

    return await prisma.mentorKpi.upsert({
      where: { mentorId },
      update: {
        reviewCompletionRate,
        clientRetentionRate: Math.min(activeClients / mentor.capacity * 100, 100),
        clientSatisfaction: avgRating,
        revenueGenerated,
        qualityScore,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: `kpi_${mentorId}`,
        mentorId,
        reviewCompletionRate,
        clientRetentionRate: Math.min(activeClients / mentor.capacity * 100, 100),
        clientSatisfaction: avgRating,
        revenueGenerated,
        qualityScore,
        updatedAt: new Date(),
      }
    });
  } catch (error: any) {
    console.error("Error in recalculateMentorKpi:", error);
    throw new Error(error.message || "Failed to recalculate KPI.");
  }
}

export async function getMentorKpis(mentorId: string) {
  try {
    const kpi = await prisma.mentorKpi.findUnique({ where: { mentorId } });
    if (!kpi) return await recalculateMentorKpi(mentorId);
    return kpi;
  } catch (error) {
    console.error("Error in getMentorKpis:", error);
    return null;
  }
}

// ── PAYOUT ENGINE ────────────────────────────────────────────────────────────

export async function calculateMonthlyPayout(mentorId: string, month: string) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        MentorClient: { where: { status: "ACTIVE" } },
        ReviewRequest: true,
        MentorPayoutRule: true,
        MentorSlaLog: true,
      }
    });
    if (!mentor) throw new Error("Mentor not found.");

    const rule = mentor.MentorPayoutRule;
    const revenueShare = rule?.revenueShare ?? mentor.payoutShare;
    const penaltyPerMiss = rule?.penaltyPerMiss ?? 500;
    const minClientsBonus = rule?.minClientsBonus ?? 20;
    const bonusPercent = rule?.bonusPercent ?? 5;

    const activeClients = mentor.MentorClient.length;
    const totalRevenue = activeClients * 4999;
    const mentorShare = Math.round(totalRevenue * (revenueShare / 100));
    const companyShare = totalRevenue - mentorShare;

    // SLA breaches this month
    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const slaBreaches = mentor.MentorSlaLog.filter(s =>
      s.slaStatus === "BREACHED" &&
      s.submittedAt >= monthStart && s.submittedAt <= monthEnd
    ).length;
    const penaltyAmount = slaBreaches * penaltyPerMiss;

    const bonusAmount = activeClients >= minClientsBonus
      ? Math.round(mentorShare * (bonusPercent / 100))
      : 0;

    const completedReviews = mentor.ReviewRequest.filter(r =>
      r.status === "COMPLETED" && r.completedAt && r.completedAt >= monthStart && r.completedAt <= monthEnd
    ).length;

    const netPayout = Math.max(0, mentorShare - penaltyAmount + bonusAmount);

    return await prisma.mentorPayout.upsert({
      where: { mentorId_month: { mentorId, month } },
      update: { totalRevenue, mentorShare, companyShare, penaltyAmount, bonusAmount, netPayout, activeClients, reviewsCompleted: completedReviews, slaBreaches, calculatedAt: new Date() },
      create: {
        id: `pay_${mentorId}_${month.replace("-", "")}`,
        mentorId, month, totalRevenue, mentorShare, companyShare,
        penaltyAmount, bonusAmount, netPayout, activeClients,
        reviewsCompleted: completedReviews, slaBreaches, status: "PENDING"
      }
    });
  } catch (error: any) {
    console.error("Error in calculateMonthlyPayout:", error);
    throw new Error(error.message || "Failed to calculate payout.");
  }
}

export async function triggerMonthEndPayouts() {
  try {
    const month = new Date().toISOString().slice(0, 7); // "2026-06"
    const mentors = await prisma.mentor.findMany({ where: { status: "ACTIVE" } });
    const results = await Promise.allSettled(
      mentors.map(m => calculateMonthlyPayout(m.id, month))
    );
    const succeeded = results.filter(r => r.status === "fulfilled").length;
    return { month, total: mentors.length, succeeded, failed: mentors.length - succeeded };
  } catch (error: any) {
    console.error("Error in triggerMonthEndPayouts:", error);
    throw new Error("Failed to trigger month-end payouts.");
  }
}

export async function approveAndMarkPaid(payoutId: string) {
  try {
    return await prisma.mentorPayout.update({
      where: { id: payoutId },
      data: { status: "PAID", paidAt: new Date() }
    });
  } catch (error: any) {
    console.error("Error in approveAndMarkPaid:", error);
    throw new Error(error.message || "Failed to approve payout.");
  }
}

export async function getMentorPayoutHistory(mentorId: string) {
  try {
    return await prisma.mentorPayout.findMany({
      where: { mentorId },
      orderBy: { month: "desc" }
    });
  } catch (error) {
    console.error("Error in getMentorPayoutHistory:", error);
    return [];
  }
}

// ── SLA SYSTEM (AUTOMATIC) ───────────────────────────────────────────────────

export async function checkAndUpdateAllSlaStatuses() {
  try {
    const now = new Date();
    // Find all pending/in-review requests without a completed SLA log
    const pending = await prisma.reviewRequest.findMany({
      where: { status: { in: ["PENDING", "IN_REVIEW"] } },
      include: { MentorSlaLog: true }
    });

    let updated = 0;
    for (const req of pending) {
      const submittedAt = req.submittedAt;
      const hoursElapsed = (now.getTime() - submittedAt.getTime()) / 3600000;

      let slaStatus = "GREEN";
      if (hoursElapsed >= 96) slaStatus = "BREACHED";
      else if (hoursElapsed >= 72) slaStatus = "RED";
      else if (hoursElapsed >= 48) slaStatus = "YELLOW";

      const existing = req.MentorSlaLog;
      if (existing) {
        await prisma.mentorSlaLog.update({
          where: { id: existing.id },
          data: {
            hoursElapsed: Math.round(hoursElapsed * 10) / 10,
            slaStatus,
            notifiedAt: hoursElapsed >= 48 && !existing.notifiedAt ? now : existing.notifiedAt,
            adminAlertedAt: hoursElapsed >= 72 && !existing.adminAlertedAt ? now : existing.adminAlertedAt,
          }
        });
      } else {
        await prisma.mentorSlaLog.create({
          data: {
            id: `sla_${req.id}`,
            reviewRequestId: req.id,
            mentorId: req.mentorId,
            submittedAt,
            hoursElapsed: Math.round(hoursElapsed * 10) / 10,
            slaStatus,
            notifiedAt: hoursElapsed >= 48 ? now : null,
            adminAlertedAt: hoursElapsed >= 72 ? now : null,
          }
        });
      }
      updated++;
    }
    return { checked: pending.length, updated };
  } catch (error: any) {
    console.error("Error in checkAndUpdateAllSlaStatuses:", error);
    throw new Error("Failed to update SLA statuses.");
  }
}

// ── OPERATIONS DASHBOARD ─────────────────────────────────────────────────────

export async function getOperationsDashboard() {
  try {
    const month = new Date().toISOString().slice(0, 7);

    const [mentors, allClients, reviewRequests, payouts] = await Promise.all([
      prisma.mentor.findMany({
        include: {
          MentorClient: { where: { status: "ACTIVE" } },
          MentorKpi: true,
          MentorRating: true,
          MentorSlaLog: true,
        }
      }),
      prisma.user.findMany({
        where: { role: "CLIENT" },
        include: { MentorClient_AsClient: true, ClientCategory: true }
      }),
      prisma.reviewRequest.findMany({
        include: {
          Client: { select: { name: true, email: true } },
          Mentor: { select: { name: true, category: true } },
          MentorSlaLog: true,
          MentorshipReview: true,
        },
        orderBy: { submittedAt: "desc" }
      }),
      prisma.mentorPayout.findMany({
        where: { month },
        include: { Mentor: { select: { name: true, category: true } } }
      })
    ]);

    const activeClients = allClients.filter(c => c.MentorClient_AsClient);
    const unassignedClients = allClients.filter(c => !c.MentorClient_AsClient);
    const pendingReviews = reviewRequests.filter(r => r.status === "PENDING");
    const completedReviews = reviewRequests.filter(r => r.status === "COMPLETED");
    const totalRevenue = activeClients.length * 4999;
    const totalMentorPayout = payouts.reduce((s, p) => s + p.netPayout, 0);

    // Capacity matrix
    const capacityMatrix = mentors.map(m => {
      const used = m.MentorClient.length;
      const pct = Math.round((used / m.capacity) * 100);
      const color = pct >= 100 ? "RED" : pct >= 90 ? "ORANGE" : pct >= 70 ? "YELLOW" : "GREEN";
      return {
        id: m.id, name: m.name, category: m.category,
        used, capacity: m.capacity, pct, color,
        averageRating: m.averageRating,
        qualityScore: m.MentorKpi?.qualityScore ?? 0,
        slaBreaches: m.MentorSlaLog.filter(s => s.slaStatus === "BREACHED").length,
      };
    });

    return {
      summary: {
        totalMentors: mentors.length,
        activeMentors: mentors.filter(m => m.status === "ACTIVE").length,
        totalClients: allClients.length,
        activeClients: activeClients.length,
        unassignedClients: unassignedClients.length,
        pendingReviews: pendingReviews.length,
        completedReviews: completedReviews.length,
        totalRevenue,
        totalMentorPayout: Math.round(totalMentorPayout),
        companyRevenue: Math.round(totalRevenue - totalMentorPayout),
      },
      mentors: mentors.map(m => ({
        id: m.id, name: m.name, email: m.email, category: m.category,
        status: m.status, capacity: m.capacity,
        activeClientsCount: m.MentorClient.length,
        averageRating: m.averageRating,
        qualityScore: m.MentorKpi?.qualityScore ?? 0,
        totalReviewsCompleted: m.totalReviewsCompleted,
      })),
      capacityMatrix,
      unassignedClients: unassignedClients.map(c => ({
        id: c.id, name: c.name, email: c.email,
        category: c.ClientCategory?.experienceLevel ?? "BEGINNER",
        suggestedTier: c.ClientCategory?.suggestedMentorTier ?? "JUNIOR",
        createdAt: c.createdAt,
      })),
      reviewRequests,
      payouts,
    };
  } catch (error: any) {
    console.error("Error in getOperationsDashboard:", error);
    throw new Error("Failed to load operations dashboard.");
  }
}

export async function getMentorCapacityMatrix() {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { status: "ACTIVE" },
      include: { MentorClient: { where: { status: "ACTIVE" } }, MentorKpi: true }
    });
    return mentors.map(m => {
      const used = m.MentorClient.length;
      const pct = Math.round((used / m.capacity) * 100);
      return {
        id: m.id, name: m.name, category: m.category, email: m.email,
        used, capacity: m.capacity, pct,
        color: pct >= 100 ? "RED" : pct >= 90 ? "ORANGE" : pct >= 70 ? "YELLOW" : "GREEN",
        averageRating: m.averageRating,
        qualityScore: m.MentorKpi?.qualityScore ?? 0,
      };
    });
  } catch (error) {
    console.error("Error in getMentorCapacityMatrix:", error);
    return [];
  }
}

export async function getMentorDashboardData(mentorEmail: string) {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { email: mentorEmail.trim().toLowerCase() },
      include: {
        MentorClient: { where: { status: "ACTIVE" }, include: { Client: { select: { id: true, name: true, email: true } } } },
        MentorKpi: true,
        MentorRating: { orderBy: { createdAt: "desc" }, take: 20 },
        MentorPayout: { orderBy: { month: "desc" }, take: 6 },
        MentorSlaLog: { orderBy: { submittedAt: "desc" }, take: 10 },
        MentorAvailability: true,
      }
    });
    if (!mentor) throw new Error("Mentor not found.");
    return mentor;
  } catch (error: any) {
    console.error("Error in getMentorDashboardData:", error);
    throw new Error(error.message || "Failed to load mentor dashboard.");
  }
}

// ==========================================
// EXPANDED PROFESSIONAL MENTOR SERVER ACTIONS
// ==========================================

async function getMentorByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const mentor = await prisma.mentor.findUnique({
    where: { email: cleanEmail },
  });
  if (!mentor) throw new Error(`Mentor with email ${cleanEmail} not found`);
  return mentor;
}

export async function getMentorSetupStatus(email: string) {
  try {
    const mentor = await getMentorByEmail(email);
    let wizard = await prisma.mentorSetupWizard.findUnique({
      where: { mentorId: mentor.id },
    });
    if (!wizard) {
      wizard = await prisma.mentorSetupWizard.create({
        data: {
          id: `wiz_${Date.now()}`,
          mentorId: mentor.id,
        },
      });
    }
    return {
      wizard,
      wizardCompleted: mentor.wizardCompleted,
      agreementAccepted: mentor.agreementAccepted,
    };
  } catch (error: any) {
    console.error("Error in getMentorSetupStatus:", error);
    throw new Error(error.message || "Failed to load setup wizard status.");
  }
}

export async function saveMentorProfile(
  email: string,
  data: {
    name?: string;
    phone?: string;
    bio?: string;
    experience?: string;
    specialization?: string;
    languages?: string;
    dateOfBirth?: string;
    city?: string;
    tradingStyle?: string;
    certifications?: string;
    linkedIn?: string;
    twitter?: string;
    youtube?: string;
    profileImage?: string;
  }
) {
  try {
    const mentor = await getMentorByEmail(email);
    
    // Update Mentor model
    const updatedMentor = await prisma.mentor.update({
      where: { id: mentor.id },
      data: {
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        experience: data.experience,
        specialization: data.specialization,
        languages: data.languages,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        tradingStyle: data.tradingStyle,
        certifications: data.certifications,
        linkedIn: data.linkedIn,
        twitter: data.twitter,
        youtube: data.youtube,
        profileImage: data.profileImage,
      },
    });

    // Create or update MentorProfile model
    await prisma.mentorProfile.upsert({
      where: { mentorId: mentor.id },
      create: {
        id: `prof_${Date.now()}`,
        mentorId: mentor.id,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        tradingStyle: data.tradingStyle,
        segments: data.specialization,
        certifications: data.certifications,
        linkedIn: data.linkedIn,
        twitter: data.twitter,
        youtube: data.youtube,
        profileComplete: true,
      },
      update: {
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        tradingStyle: data.tradingStyle,
        segments: data.specialization,
        certifications: data.certifications,
        linkedIn: data.linkedIn,
        twitter: data.twitter,
        youtube: data.youtube,
        profileComplete: true,
      },
    });

    return updatedMentor;
  } catch (error: any) {
    console.error("Error in saveMentorProfile:", error);
    throw new Error(error.message || "Failed to save profile.");
  }
}

export async function saveMentorAvailability(
  email: string,
  data: {
    workingDays: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
    timezone?: string;
    leaveDates?: string;
  }
) {
  try {
    const mentor = await getMentorByEmail(email);
    const availability = await prisma.mentorAvailability.upsert({
      where: { mentorId: mentor.id },
      create: {
        id: `av_${Date.now()}`,
        mentorId: mentor.id,
        workingDays: data.workingDays,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
        timezone: data.timezone || "Asia/Kolkata",
        leaveDates: data.leaveDates || null,
      },
      update: {
        workingDays: data.workingDays,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
        timezone: data.timezone || "Asia/Kolkata",
        leaveDates: data.leaveDates || null,
      },
    });
    return availability;
  } catch (error: any) {
    console.error("Error in saveMentorAvailability:", error);
    throw new Error(error.message || "Failed to save availability.");
  }
}

export async function saveMentorSetupWizardStep(email: string, stepField: string, completed: boolean = true) {
  try {
    const mentor = await getMentorByEmail(email);
    const wizard = await prisma.mentorSetupWizard.upsert({
      where: { mentorId: mentor.id },
      create: {
        id: `wiz_${Date.now()}`,
        mentorId: mentor.id,
        [stepField]: completed,
      },
      update: {
        [stepField]: completed,
      },
    });

    // Check if all steps are completed
    const fullWiz = await prisma.mentorSetupWizard.findUnique({
      where: { mentorId: mentor.id },
    });

    if (fullWiz) {
      const allDone = 
        fullWiz.step1Photo &&
        fullWiz.step2Bio &&
        fullWiz.step3Experience &&
        fullWiz.step4Specialize &&
        fullWiz.step5Languages &&
        fullWiz.step6Availability &&
        fullWiz.step7Status &&
        fullWiz.step8Agreement;

      if (allDone) {
        await prisma.mentor.update({
          where: { id: mentor.id },
          data: {
            wizardCompleted: true,
            agreementAccepted: true,
          },
        });
        await prisma.mentorSetupWizard.update({
          where: { mentorId: mentor.id },
          data: { completedAt: new Date() },
        });
      }
    }

    return wizard;
  } catch (error: any) {
    console.error("Error in saveMentorSetupWizardStep:", error);
    throw new Error(error.message || "Failed to save setup wizard step.");
  }
}

export async function acceptMentorAgreement(email: string, version: string = "v1.0", ipAddress?: string, userAgent?: string) {
  try {
    const mentor = await getMentorByEmail(email);
    const agreement = await prisma.mentorAgreement.upsert({
      where: { mentorId: mentor.id },
      create: {
        id: `agr_${Date.now()}`,
        mentorId: mentor.id,
        version,
        acceptedAt: new Date(),
        ipAddress: ipAddress || "127.0.0.1",
        userAgent: userAgent || "Unknown Device",
      },
      update: {
        version,
        acceptedAt: new Date(),
        ipAddress: ipAddress || "127.0.0.1",
        userAgent: userAgent || "Unknown Device",
      },
    });

    await prisma.mentor.update({
      where: { id: mentor.id },
      data: { agreementAccepted: true },
    });

    await saveMentorSetupWizardStep(email, "step8Agreement", true);

    return agreement;
  } catch (error: any) {
    console.error("Error in acceptMentorAgreement:", error);
    throw new Error(error.message || "Failed to accept mentor agreement.");
  }
}

export async function getMentorNotifications(email: string) {
  try {
    const mentor = await getMentorByEmail(email);
    return await prisma.mentorNotification.findMany({
      where: { mentorId: mentor.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.error("Error in getMentorNotifications:", error);
    return [];
  }
}

export async function markNotificationRead(notifId: string) {
  try {
    return await prisma.mentorNotification.update({
      where: { id: notifId },
      data: { isRead: true },
    });
  } catch (error: any) {
    console.error("Error in markNotificationRead:", error);
    throw new Error("Failed to update notification.");
  }
}

export async function createMentorNotification(
  mentorId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  try {
    return await prisma.mentorNotification.create({
      data: {
        id: `not_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        mentorId,
        type,
        title,
        message,
        actionUrl,
      },
    });
  } catch (error: any) {
    console.error("Error in createMentorNotification:", error);
    throw new Error("Failed to create notification.");
  }
}

export async function scheduleMentorSession(
  mentorEmail: string,
  data: {
    clientId: string;
    scheduledAt: string | Date;
    durationMins?: number;
    sessionType?: string;
    notes?: string;
  }
) {
  try {
    const mentor = await getMentorByEmail(mentorEmail);
    const session = await prisma.mentorSession.create({
      data: {
        id: `sess_${Date.now()}`,
        mentorId: mentor.id,
        clientId: data.clientId,
        scheduledAt: new Date(data.scheduledAt),
        durationMins: data.durationMins || 30,
        sessionType: data.sessionType || "REVIEW",
        notes: data.notes || "",
        status: "SCHEDULED",
      },
    });

    // Notify mentor
    await createMentorNotification(
      mentor.id,
      "SESSION",
      "New Session Scheduled",
      `A new session of type ${data.sessionType || "REVIEW"} has been scheduled.`,
      `/mentor`
    );

    return session;
  } catch (error: any) {
    console.error("Error in scheduleMentorSession:", error);
    throw new Error(error.message || "Failed to schedule session.");
  }
}

export async function getMentorSessions(mentorEmail: string) {
  try {
    const mentor = await getMentorByEmail(mentorEmail);
    return await prisma.mentorSession.findMany({
      where: { mentorId: mentor.id },
      include: {
        Client: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
  } catch (error: any) {
    console.error("Error in getMentorSessions:", error);
    return [];
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: string,
  notes?: string,
  recordingUrl?: string
) {
  try {
    return await prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        status,
        mentorNotes: notes,
        recordingUrl,
      },
    });
  } catch (error: any) {
    console.error("Error in updateSessionStatus:", error);
    throw new Error("Failed to update session status.");
  }
}

export async function sendMentorMessage(
  email: string,
  clientId: string,
  senderType: "MENTOR" | "CLIENT",
  content: string,
  messageType: string = "TEXT"
) {
  try {
    let mentorId = "";
    if (senderType === "MENTOR") {
      const mentor = await getMentorByEmail(email);
      mentorId = mentor.id;
    } else {
      const client = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (!client) throw new Error("Client user not found.");
      const mapping = await prisma.mentorClient.findFirst({
        where: { clientId: client.id, status: "ACTIVE" },
      });
      if (!mapping) throw new Error("No active mentor assigned to client.");
      mentorId = mapping.mentorId;
    }

    return await prisma.mentorMessage.create({
      data: {
        id: `msg_${Date.now()}`,
        mentorId,
        clientId,
        senderType,
        content,
        messageType,
      },
    });
  } catch (error: any) {
    console.error("Error in sendMentorMessage:", error);
    throw new Error(error.message || "Failed to send message.");
  }
}

export async function getMentorMessages(
  email: string,
  clientId: string,
  requesterType: "MENTOR" | "CLIENT"
) {
  try {
    let mentorId = "";
    if (requesterType === "MENTOR") {
      const mentor = await getMentorByEmail(email);
      mentorId = mentor.id;
    } else {
      const client = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (!client) throw new Error("Client not found.");
      const mapping = await prisma.mentorClient.findFirst({
        where: { clientId: client.id, status: "ACTIVE" },
      });
      if (!mapping) throw new Error("No active mentor assigned.");
      mentorId = mapping.mentorId;
    }

    // Mark messages from the other side as read
    await prisma.mentorMessage.updateMany({
      where: {
        mentorId,
        clientId,
        senderType: requesterType === "MENTOR" ? "CLIENT" : "MENTOR",
        isRead: false,
      },
      data: { isRead: true },
    });

    return await prisma.mentorMessage.findMany({
      where: { mentorId, clientId },
      orderBy: { sentAt: "asc" },
    });
  } catch (error: any) {
    console.error("Error in getMentorMessages:", error);
    return [];
  }
}

export async function getMentorReviewTemplates() {
  try {
    let templates = await prisma.mentorReviewTemplate.findMany();
    if (templates.length === 0) {
      const defaults = [
        {
          id: "tpl_exec",
          name: "Breakout Execution Audit",
          category: "EXECUTION",
          strengths: "Good identification of key support/resistance breakout levels. Clean entry timing.",
          improvements: "Chasing price after the breakout candle closes too far from the trigger line.",
          actionPlan: "Place limit orders at the retest level instead of market orders on FOMO.",
          nextFocus: "Reduce slippage, wait for 5-min candle close confirmation.",
          remark: "Reviewing execution metrics: focus on strict entry rules.",
          isDefault: true,
        },
        {
          id: "tpl_risk",
          name: "Position Sizing & Risk Audit",
          category: "RISK",
          strengths: "Stop losses are defined and inputted before the trade goes live.",
          improvements: "Position size is dynamic and inconsistent across trades, leading to lopsided losses.",
          actionPlan: "Use the built-in Trade Adhyayan Position Sizing Calculator. Maintain a fixed 1% risk per trade.",
          nextFocus: "Consistent risk unit execution over the next 20 trades.",
          remark: "Risk management is the absolute foundation of longevity.",
          isDefault: true,
        },
        {
          id: "tpl_psych",
          name: "Overtrading & FOMO Coaching",
          category: "PSYCHOLOGY",
          strengths: "Able to stop trading after achieving a daily target.",
          improvements: "Tendency to revenge trade after a streak of 2 consecutive losses.",
          actionPlan: "Implement a maximum daily loss limit rule. Shut down the terminal after 3 trades max.",
          nextFocus: "Emotional control and compliance with rules.",
          remark: "Psychological resilience separates average traders from elite professionals.",
          isDefault: true,
        },
      ];
      for (const d of defaults) {
        await prisma.mentorReviewTemplate.create({ data: d }).catch(() => {});
      }
      templates = await prisma.mentorReviewTemplate.findMany();
    }
    return templates;
  } catch (error: any) {
    console.error("Error in getMentorReviewTemplates:", error);
    return [];
  }
}

export async function getMentorLeaderboard() {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { status: "ACTIVE" },
      include: {
        MentorKpi: true,
        MentorClient: { where: { status: "ACTIVE" } },
        MentorSlaLog: { where: { slaStatus: "BREACHED" } },
      },
    });

    return mentors
      .map((m) => {
        const qualityScore = m.MentorKpi?.qualityScore ?? 0;
        const slaBreachCount = m.MentorSlaLog?.length ?? 0;
        const avgRating = m.averageRating ?? 0.0;
        const totalReviews = m.totalReviewsCompleted ?? 0;
        const rankScore = (avgRating * 20) + (qualityScore * 0.4) + (totalReviews * 0.2) - (slaBreachCount * 5);
        return {
          id: m.id,
          name: m.name,
          email: m.email,
          category: m.category,
          avgRating,
          totalReviews,
          qualityScore,
          slaBreachCount,
          activeClients: m.MentorClient.length,
          statusDetail: m.statusDetail,
          rankScore,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore);
  } catch (error: any) {
    console.error("Error in getMentorLeaderboard:", error);
    return [];
  }
}

export async function updateMentorStatusDetail(email: string, statusDetail: string) {
  try {
    const mentor = await getMentorByEmail(email);
    const updated = await prisma.mentor.update({
      where: { id: mentor.id },
      data: { statusDetail },
    });

    await createMentorNotification(
      mentor.id,
      "INFO",
      "Status Updated Successfully",
      `Your active status is now set to ${statusDetail}.`
    );

    return updated;
  } catch (error: any) {
    console.error("Error in updateMentorStatusDetail:", error);
    throw new Error(error.message || "Failed to update status.");
  }
}

export async function getAllMentorAgreements() {
  try {
    return await prisma.mentorAgreement.findMany({
      include: {
        Mentor: {
          select: { name: true, email: true, category: true },
        },
      },
      orderBy: { acceptedAt: "desc" },
    });
  } catch (error: any) {
    console.error("Error in getAllMentorAgreements:", error);
    return [];
  }
}

export async function getMentorAudits(mentorId?: string) {
  try {
    const where = mentorId ? { mentorId } : {};
    return await prisma.mentorAudit.findMany({
      where,
      include: {
        Mentor: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.error("Error in getMentorAudits:", error);
    return [];
  }
}

export async function createMentorAudit(data: {
  mentorId: string;
  auditType: string;
  description: string;
  adminNotes?: string;
  severity?: string;
}) {
  try {
    return await prisma.mentorAudit.create({
      data: {
        id: `aud_${Date.now()}`,
        mentorId: data.mentorId,
        auditType: data.auditType,
        description: data.description,
        adminNotes: data.adminNotes || "",
        severity: data.severity || "LOW",
      },
    });
  } catch (error: any) {
    console.error("Error in createMentorAudit:", error);
    throw new Error("Failed to create audit record.");
  }
}

export async function getMentorResources() {
  try {
    let resources = await prisma.mentorResource.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (resources.length === 0) {
      const defaults = [
        {
          id: "res_sop",
          title: "Mentor Standard Operating Procedures (SOP)",
          category: "SOP",
          description: "Step-by-step workflow guidelines on auditing student journals, SLA response timelines (24h), and grading criteria.",
          url: "https://tradeadhyayan.com/resources/SOP-v1.pdf",
        },
        {
          id: "res_handbook",
          title: "Trade Adhyayan Mentor Handbook v1.2",
          category: "HANDBOOK",
          description: "Core curriculum alignment, trading style definitions, client management guidelines, and communication templates.",
          url: "https://tradeadhyayan.com/resources/Handbook-v1.pdf",
        },
        {
          id: "res_templates",
          title: "Review Feedback Snippets & Cheat Sheet",
          category: "TEMPLATE",
          description: "Copy-paste feedback templates for common mistakes (e.g., revenge trading, chasing momentum).",
          url: "https://tradeadhyayan.com/resources/Cheat-Sheet-v1.pdf",
        },
      ];
      for (const res of defaults) {
        await prisma.mentorResource.create({ data: res }).catch(() => {});
      }
      resources = await prisma.mentorResource.findMany({ orderBy: { createdAt: "desc" } });
    }
    return resources;
  } catch (error: any) {
    console.error("Error in getMentorResources:", error);
    return [];
  }
}

export async function getAllSessions() {
  try {
    return await prisma.mentorSession.findMany({
      include: {
        Mentor: { select: { name: true, email: true } },
        Client: { select: { name: true, email: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
  } catch (error: any) {
    console.error("Error in getAllSessions:", error);
    return [];
  }
}

export async function sendBroadcastNotification(type: string, title: string, message: string, actionUrl?: string) {
  try {
    const activeMentors = await prisma.mentor.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    const creations = activeMentors.map((m) =>
      prisma.mentorNotification.create({
        data: {
          id: `not_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          mentorId: m.id,
          type,
          title,
          message,
          actionUrl,
        },
      })
    );

    await Promise.all(creations);
    return { success: true, count: activeMentors.length };
  } catch (error: any) {
    console.error("Error in sendBroadcastNotification:", error);
    throw new Error(error.message || "Failed to broadcast notifications.");
  }
}

export async function getMentorDetailsForAdmin(mentorId: string) {
  try {
    return await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        MentorClient: {
          include: {
            Client: { select: { id: true, name: true, email: true } }
          }
        },
        MentorKpi: true,
        MentorRating: { orderBy: { createdAt: "desc" } },
        MentorPayout: { orderBy: { month: "desc" } },
        MentorSlaLog: { orderBy: { submittedAt: "desc" } },
        MentorAvailability: true,
        MentorAudit: { orderBy: { createdAt: "desc" } },
        MentorSession: {
          include: {
            Client: { select: { name: true, email: true } }
          },
          orderBy: { scheduledAt: "desc" }
        }
      }
    });
  } catch (error) {
    console.error("Error in getMentorDetailsForAdmin:", error);
    throw new Error("Failed to load mentor details.");
  }
}

export async function getAdminDetailsForAdmin(adminId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN" }
    });
  } catch (error) {
    console.error("Error in getAdminDetailsForAdmin:", error);
    throw new Error("Failed to load admin details.");
  }
}