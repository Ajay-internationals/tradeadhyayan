"use server";

import { prisma } from "@/lib/db";
import { InstrumentType, TradeDirection, TradeResult } from "@/lib/generated/prisma";

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
    const result: TradeResult =
      tradeData.pnl > 0 ? "WIN" : tradeData.pnl < 0 ? "LOSS" : "BREAKEVEN";

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
        entryPrice: 100, // mock entry price
        exitPrice: 100 + (tradeData.pnl / 50), // mock exit price
        quantity: 50, // mock quantity
        result,
        pnl: tradeData.pnl,
        charges: 0,
        netPnl: tradeData.pnl,
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

