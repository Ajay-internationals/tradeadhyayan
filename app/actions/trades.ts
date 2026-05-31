"use server";

import { prisma } from "@/lib/db";
import { InstrumentType, TradeDirection, TradeResult, MistakeSeverity, GoalStatus, BrokerStatus } from "@/lib/generated/prisma";

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
async function getOrCreateUser(email: string) {
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

export async function disconnectBroker(connectionId: string) {
  try {
    return await prisma.brokerConnection.update({
      where: { id: connectionId },
      data: {
        status: "DISCONNECTED",
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

export async function triggerBrokerSync(
  email: string,
  brokerName: string,
  credentials: { apiKey?: string; apiSecret?: string; clientId?: string }
) {
  try {
    const user = await getOrCreateUser(email);
    const connectionId = `bc_${user.id}_${brokerName}`;
    const encryptedToken = credentials.apiKey ? `enc_${credentials.apiKey}` : "enc_simulated_token";

    const connection = await prisma.brokerConnection.upsert({
      where: { id: connectionId },
      update: {
        status: "CONNECTED",
        accessTokenEncrypted: encryptedToken,
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: connectionId,
        userId: user.id,
        brokerName,
        status: "CONNECTED",
        accessTokenEncrypted: encryptedToken,
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Mock realistic trades based on the selected broker
    let tradesToImport: any[] = [];
    if (brokerName === "Zerodha") {
      tradesToImport = [
        { symbol: "TCS", direction: "LONG" as const, entryPrice: 3850, exitPrice: 3920, quantity: 100, pnl: 7000, setup: "Breakout", mood: "Discipline ✓" },
        { symbol: "INFY", direction: "SHORT" as const, entryPrice: 1435, exitPrice: 1420, quantity: 100, pnl: 1500, setup: "Retest", mood: "Early Exit ⚠️" }
      ];
    } else if (brokerName === "Upstox") {
      tradesToImport = [
        { symbol: "NIFTY 22400 CE", direction: "LONG" as const, entryPrice: 120, exitPrice: 210, quantity: 150, pnl: 13500, setup: "Support/Resistance", mood: "Discipline ✓" },
        { symbol: "BANKNIFTY 48200 PE", direction: "LONG" as const, entryPrice: 240, exitPrice: 210, quantity: 150, pnl: -4500, setup: "Scalping", mood: "FOMO Entry ⚠️" }
      ];
    } else {
      tradesToImport = [
        { symbol: "SBIN", direction: "LONG" as const, entryPrice: 720, exitPrice: 733, quantity: 400, pnl: 5200, setup: "Retest", mood: "Discipline ✓" },
        { symbol: "NIFTY 22500 CE", direction: "LONG" as const, entryPrice: 110, exitPrice: 198, quantity: 100, pnl: 8800, setup: "Breakout", mood: "Discipline ✓" }
      ];
    }

    for (const trade of tradesToImport) {
      const newTrd = await prisma.trade.create({
        data: {
          id: `trd_sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: user.id,
          brokerConnectionId: connection.id,
          source: "BROKER",
          symbol: trade.symbol,
          instrumentType: trade.symbol.includes("NIFTY") ? "OPTION" : "STOCK",
          direction: trade.direction,
          entryTime: new Date(Date.now() - 3600000 * 2),
          exitTime: new Date(Date.now() - 3600000),
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          pnl: trade.pnl,
          charges: 20,
          netPnl: trade.pnl - 20,
          result: trade.pnl > 0 ? "WIN" : "LOSS",
          setup: trade.setup,
          mood: trade.mood,
          followedPlan: !trade.mood.includes("⚠️"),
          updatedAt: new Date(),
        },
      });
      // Run mistake detection engine for synced trade
      await detectAndSaveMistakesForTrade(user.id, newTrd.id);
    }

    await prisma.syncLog.create({
      data: {
        id: `sl_${Date.now()}`,
        connectionId: connection.id,
        dataType: "TRADES",
        recordsCount: tradesToImport.length,
        status: "SUCCESS",
        errorMessage: null,
        createdAt: new Date(),
      },
    });

    return { success: true, recordsCount: tradesToImport.length };
  } catch (error: any) {
    console.error("Error in triggerBrokerSync server action:", error);
    return { success: false, errorMessage: error.message || "Failed to sync broker." };
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