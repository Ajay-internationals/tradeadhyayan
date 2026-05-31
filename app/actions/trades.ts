"use server";

import { prisma } from "@/lib/db";
import { InstrumentType, TradeDirection, TradeResult, MistakeSeverity } from "@/lib/generated/prisma";

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
    stopLoss: dbTrade.stopLoss,
    target: dbTrade.target,
    charges: dbTrade.charges,
    netPnl: dbTrade.netPnl,
    rr: dbTrade.rr,
    followedPlan: dbTrade.followedPlan,
  };
}

// Get user trades by email
export async function getTrades(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.warn(`User ${userEmail} not found. Returning empty trades.`);
      return [];
    }

    const dbTrades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { entryTime: "desc" },
    });

    return dbTrades.map(mapDbTradeToFrontend);
  } catch (error) {
    console.error("Error in getTrades action:", error);
    throw new Error("Failed to fetch trades from database.");
  }
}

// Add a trade to the database
export async function addDbTrade(
  email: string,
  tradeData: {
    asset: string;
    type: "BUY" | "SELL";
    pnl: number;
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
  }
) {
  try {
    const userEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // Create user if they don't exist yet to make it seamless
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr_${Date.now()}`,
          name: userEmail.split("@")[0],
          email: userEmail,
          passwordHash: "simulated_hash", // placeholder
          updatedAt: new Date(),
        },
      });
    }

    const direction: TradeDirection = tradeData.type === "BUY" ? "LONG" : "SHORT";
    
    const finalNetPnl = tradeData.netPnl !== undefined ? tradeData.netPnl : tradeData.pnl;
    const result: TradeResult =
      finalNetPnl > 0 ? "WIN" : finalNetPnl < 0 ? "LOSS" : "BREAKEVEN";

    // Determine instrument type
    const assetUpper = tradeData.asset.toUpperCase();
    let instrumentType: InstrumentType = "STOCK";
    if (assetUpper.includes("NIFTY")) {
      instrumentType = assetUpper.includes("BANK") ? "BANKNIFTY" : "NIFTY";
    } else if (assetUpper.endsWith("CE") || assetUpper.endsWith("PE")) {
      instrumentType = "OPTION";
    }

    // Determine option type
    const optionType = assetUpper.endsWith("CE")
      ? "CE" as const
      : assetUpper.endsWith("PE")
      ? "PE" as const
      : null;

    const newDbTrade = await prisma.trade.create({
      data: {
        id: `trd_${Date.now()}`,
        userId: user.id,
        symbol: assetUpper,
        instrumentType,
        optionType,
        direction,
        entryTime: new Date(),
        exitTime: new Date(),
        entryPrice: tradeData.entryPrice !== undefined ? tradeData.entryPrice : 100,
        exitPrice: tradeData.exitPrice !== undefined ? tradeData.exitPrice : 100,
        quantity: tradeData.quantity !== undefined ? tradeData.quantity : 1,
        stopLoss: tradeData.stopLoss !== undefined ? tradeData.stopLoss : null,
        target: tradeData.target !== undefined ? tradeData.target : null,
        result,
        pnl: tradeData.pnl,
        charges: tradeData.charges !== undefined ? tradeData.charges : 0,
        netPnl: finalNetPnl,
        rr: tradeData.rr !== undefined ? tradeData.rr : null,
        setup: tradeData.strategy,
        mood: tradeData.emotion,
        followedPlan: !tradeData.emotion.includes("⚠️"),
        updatedAt: new Date(),
      },
    });

    return mapDbTradeToFrontend(newDbTrade);
  } catch (error) {
    console.error("Error in addDbTrade action:", error);
    throw new Error("Failed to add trade record to database.");
  }
}

// Delete a trade from the database
export async function deleteDbTrade(tradeId: string) {
  try {
    await prisma.trade.delete({
      where: { id: tradeId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error in deleteDbTrade action:", error);
    throw new Error("Failed to delete trade record from database.");
  }
}

// ---------------- STRATEGIES ACTIONS ----------------

export async function getStrategies(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

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
    const userEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr_${Date.now()}`,
          name: userEmail.split("@")[0],
          email: userEmail,
          passwordHash: "simulated_hash",
          updatedAt: new Date(),
        },
      });
    }

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

// ---------------- GOALS ACTIONS ----------------

export async function getGoals(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

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
    const userEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr_${Date.now()}`,
          name: userEmail.split("@")[0],
          email: userEmail,
          passwordHash: "simulated_hash",
          updatedAt: new Date(),
        },
      });
    }

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
    const status = progress >= 100 ? "ACHIEVED" as const : progress > 50 ? "ON_TRACK" as const : "NOT_STARTED" as const;

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

// ---------------- USER SETTINGS ACTIONS ----------------

export async function getUserSettings(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return null;

    let settings = await prisma.userSetting.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if not exists
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
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) throw new Error("User not found");

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

// ---------------- CALENDAR EVENTS ACTIONS ----------------

export async function getCalendarEvents(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

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
    const userEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr_${Date.now()}`,
          name: userEmail.split("@")[0],
          email: userEmail,
          passwordHash: "simulated_hash",
          updatedAt: new Date(),
        },
      });
    }

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

// ---------------- BROKER SYNC ACTIONS ----------------

export async function getBrokerConnections(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

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
    const userEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr_${Date.now()}`,
          name: userEmail.split("@")[0],
          email: userEmail,
          passwordHash: "simulated_hash",
          updatedAt: new Date(),
        },
      });
    }

    return await prisma.brokerConnection.upsert({
      where: { id: `bc_${user.id}_${brokerName}` }, // unique connection ID pattern
      update: {
        status,
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: `bc_${user.id}_${brokerName}`,
        userId: user.id,
        brokerName,
        status,
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
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

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
    const userEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr_${Date.now()}`,
          name: userEmail.split("@")[0],
          email: userEmail,
          passwordHash: "simulated_hash",
          updatedAt: new Date(),
        },
      });
    }

    const connectionId = `bc_${user.id}_${brokerName}`;
    const encryptedToken = credentials.apiKey ? `enc_${credentials.apiKey}` : "enc_simulated_token";

    // Upsert broker connection
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
        {
          symbol: "TCS",
          instrumentType: "STOCK" as const,
          direction: "LONG" as const,
          entryPrice: 3850,
          exitPrice: 3920,
          quantity: 100,
          pnl: 7000,
          setup: "Breakout",
          mood: "Discipline ✓",
        },
        {
          symbol: "INFY",
          instrumentType: "STOCK" as const,
          direction: "SHORT" as const,
          entryPrice: 1435,
          exitPrice: 1420,
          quantity: 100,
          pnl: 1500,
          setup: "Retest",
          mood: "Early Exit ⚠️",
        }
      ];
    } else if (brokerName === "Upstox") {
      tradesToImport = [
        {
          symbol: "NIFTY 22400 CE",
          instrumentType: "OPTION" as const,
          optionType: "CE" as const,
          direction: "LONG" as const,
          entryPrice: 120,
          exitPrice: 210,
          quantity: 150,
          pnl: 13500,
          setup: "Support/Resistance",
          mood: "Discipline ✓",
        },
        {
          symbol: "BANKNIFTY 48200 PE",
          instrumentType: "OPTION" as const,
          optionType: "PE" as const,
          direction: "LONG" as const,
          entryPrice: 240,
          exitPrice: 210,
          quantity: 150,
          pnl: -4500,
          setup: "Scalping",
          mood: "FOMO Entry ⚠️",
        }
      ];
    } else { // Dhan
      tradesToImport = [
        {
          symbol: "SBIN",
          instrumentType: "STOCK" as const,
          direction: "LONG" as const,
          entryPrice: 720,
          exitPrice: 733,
          quantity: 400,
          pnl: 5200,
          setup: "Retest",
          mood: "Discipline ✓",
        },
        {
          symbol: "NIFTY 22500 CE",
          instrumentType: "OPTION" as const,
          optionType: "CE" as const,
          direction: "LONG" as const,
          entryPrice: 110,
          exitPrice: 198,
          quantity: 100,
          pnl: 8800,
          setup: "Breakout",
          mood: "Discipline ✓",
        }
      ];
    }

    // Insert trades into the DB
    for (const trade of tradesToImport) {
      await prisma.trade.create({
        data: {
          id: `trd_sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: user.id,
          brokerConnectionId: connection.id,
          source: "BROKER",
          symbol: trade.symbol,
          instrumentType: trade.instrumentType,
          optionType: trade.optionType || null,
          direction: trade.direction,
          entryTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
          exitTime: new Date(Date.now() - 3600000), // 1 hour ago
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          pnl: trade.pnl,
          charges: 20, // flat charges
          netPnl: trade.pnl - 20,
          result: trade.pnl > 0 ? "WIN" as const : trade.pnl < 0 ? "LOSS" as const : "BREAKEVEN" as const,
          setup: trade.setup,
          mood: trade.mood,
          followedPlan: !trade.mood.includes("⚠️"),
          updatedAt: new Date(),
        },
      });
    }

    // Write Sync Log
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

    return {
      success: true,
      recordsCount: tradesToImport.length,
    };
  } catch (error: any) {
    console.error("Error in triggerBrokerSync server action:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to synchronize broker account.",
    };
  }
}

// ---------------- MISTAKES ACTIONS ----------------

export async function getMistakes(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

    return await prisma.mistake.findMany({
      where: { userId: user.id },
      include: {
        Trade: true,
      },
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
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) throw new Error("User not found");

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
        confidenceScore: 100,
      },
    });
  } catch (error) {
    console.error("Error in addMistake:", error);
    throw new Error("Failed to add mistake.");
  }
}

export async function runAutoDetectMistakes(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { entryTime: "asc" },
    });

    const existingMistakes = await prisma.mistake.findMany({
      where: { userId: user.id },
    });

    const existingTradeIdTypes = new Set(
      existingMistakes.map((m) => `${m.tradeId}_${m.mistakeType}`)
    );

    const newMistakesData = [];

    // Let's analyze trades
    for (let i = 0; i < trades.length; i++) {
      const currentTrade = trades[i];

      // 1. FOMO Entry
      if (currentTrade.mood && (currentTrade.mood.toLowerCase().includes("fomo") || currentTrade.mood.toLowerCase().includes("fomo entry"))) {
        const key = `${currentTrade.id}_FOMO Entry`;
        if (!existingTradeIdTypes.has(key)) {
          newMistakesData.push({
            id: `mst_auto_${Date.now()}_fomo_${i}`,
            userId: user.id,
            tradeId: currentTrade.id,
            mistakeType: "FOMO Entry",
            severity: "MEDIUM" as MistakeSeverity,
            reason: "Entered trade without waiting for confirmation setup, triggered by fear of missing out.",
            estimatedLoss: currentTrade.pnl < 0 ? Math.abs(currentTrade.pnl) : 0,
            improvementTip: "Wait for the candle to close and confirm setup entry parameters before execution.",
            detectedAutomatically: true,
            confidenceScore: 90,
          });
        }
      }

      // 2. Early Exit
      if (currentTrade.mood && (currentTrade.mood.toLowerCase().includes("early exit") || currentTrade.mood.toLowerCase().includes("early"))) {
        const key = `${currentTrade.id}_Early Exit`;
        if (!existingTradeIdTypes.has(key)) {
          newMistakesData.push({
            id: `mst_auto_${Date.now()}_early_${i}`,
            userId: user.id,
            tradeId: currentTrade.id,
            mistakeType: "Early Exit",
            severity: "LOW" as MistakeSeverity,
            reason: "Exited trade before it reached the technical target, leaving profits on the table.",
            estimatedLoss: 0,
            improvementTip: "Use trailing stop losses to secure profits while letting the position run to the target.",
            detectedAutomatically: true,
            confidenceScore: 85,
          });
        }
      }

      // 3. Revenge Trading (Trade entered within 1 hour of a loss)
      if (i > 0) {
        const prevTrade = trades[i - 1];
        if (prevTrade.pnl < 0) {
          const timeDiff = currentTrade.entryTime.getTime() - prevTrade.exitTime.getTime();
          if (timeDiff > 0 && timeDiff < 60 * 60 * 1000) {
            const key = `${currentTrade.id}_Revenge Trading`;
            if (!existingTradeIdTypes.has(key)) {
              newMistakesData.push({
                id: `mst_auto_${Date.now()}_revenge_${i}`,
                userId: user.id,
                tradeId: currentTrade.id,
                mistakeType: "Revenge Trading",
                severity: "HIGH" as MistakeSeverity,
                reason: `Entered trade within ${Math.round(timeDiff / 60000)} minutes of a previous loss, indicating emotional trading.`,
                estimatedLoss: currentTrade.pnl < 0 ? Math.abs(currentTrade.pnl) : 0,
                improvementTip: "Implement a cooling-off period of at least 1 hour or stop trading for the day after a loss.",
                detectedAutomatically: true,
                confidenceScore: 95,
              });
            }
          }
        }
      }
    }

    // 4. Overtrading (More than 3 trades in a single day)
    const tradesByDate: Record<string, typeof trades> = {};
    trades.forEach((t) => {
      const dateStr = t.entryTime.toDateString();
      if (!tradesByDate[dateStr]) tradesByDate[dateStr] = [];
      tradesByDate[dateStr].push(t);
    });

    Object.keys(tradesByDate).forEach((dateStr) => {
      const dayTrades = tradesByDate[dateStr];
      if (dayTrades.length > 3) {
        for (let idx = 3; idx < dayTrades.length; idx++) {
          const currentTrade = dayTrades[idx];
          const key = `${currentTrade.id}_Overtrading`;
          if (!existingTradeIdTypes.has(key)) {
            newMistakesData.push({
              id: `mst_auto_${Date.now()}_over_${idx}`,
              userId: user.id,
              tradeId: currentTrade.id,
              mistakeType: "Overtrading",
              severity: "MEDIUM" as MistakeSeverity,
              reason: `Exceeded the daily recommended trade count of 3 trades (This was trade #${idx + 1} of the day).`,
              estimatedLoss: currentTrade.pnl < 0 ? Math.abs(currentTrade.pnl) : 0,
              improvementTip: "Stick to your maximum daily limit. Lock your terminal after 3 trades.",
              detectedAutomatically: true,
              confidenceScore: 100,
            });
          }
        }
      }
    });

    if (newMistakesData.length > 0) {
      await prisma.mistake.createMany({
        data: newMistakesData,
      });
    }

    return await prisma.mistake.findMany({
      where: { userId: user.id },
      include: {
        Trade: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in runAutoDetectMistakes:", error);
    return [];
  }
}

// ---------------- MENTOR REVIEW ACTIONS ----------------

export async function getMentorReviews(email: string) {
  try {
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

    return await prisma.mentorReview.findMany({
      where: { studentId: user.id },
      include: {
        Trade: true,
      },
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
    const userEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) throw new Error("Student not found");

    const mentorId = "usr_mentor";
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

