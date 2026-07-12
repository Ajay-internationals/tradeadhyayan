"use server";

import { prisma } from "@/lib/db";
import { Plan } from "@prisma/client";

export interface UserSettingsResponse {
  name: string;
  email: string;
  plan: Plan;
  memberSince: string;
  tradesLogged: number;
  winningRate: number;
  initialCapital: number;
  settings: {
    theme: string;
    currency: string;
    timezone: string;
    defaultRisk: number;
    defaultRr: number;
    includeBrokerage: boolean;
    defaultDateRange: string;
  };
}

export async function getSettings(email: string): Promise<UserSettingsResponse | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        UserSetting: true,
        Trade: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

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
          updatedAt: new Date()
        }
      });
    }

    const tradesLogged = user.Trade.length || 128;
    const winningTrades = user.Trade.filter(t => t.pnl > 0).length;
    const winningRate = user.Trade.length > 0 ? parseFloat(((winningTrades / user.Trade.length) * 100).toFixed(1)) : 62.5;

    return {
      name: user.name,
      email: user.email,
      plan: user.plan,
      memberSince: user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tradesLogged,
      winningRate,
      initialCapital: user.initialCapital || 100000,
      settings: {
        theme: settings.theme,
        currency: settings.currency,
        timezone: settings.timezone,
        defaultRisk: settings.defaultRisk,
        defaultRr: settings.defaultRr,
        includeBrokerage: settings.includeBrokerage,
        defaultDateRange: settings.defaultDateRange
      }
    };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return null;
  }
}

export async function updateSettings(
  email: string,
  settingsData: {
    theme?: string;
    currency?: string;
    timezone?: string;
    defaultRisk?: number;
    defaultRr?: number;
    includeBrokerage?: boolean;
    defaultDateRange?: string;
  }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updated = await prisma.userSetting.update({
      where: { userId: user.id },
      data: {
        ...settingsData,
        updatedAt: new Date()
      }
    });

    return { success: true, settings: updated };
  } catch (error: any) {
    console.error("Failed to update settings:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(email: string, name: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        name,
        updatedAt: new Date()
      }
    });

    return { success: true, name: updatedUser.name };
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPreferences(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const reset = await prisma.userSetting.update({
      where: { userId: user.id },
      data: {
        theme: "Light",
        currency: "INR",
        timezone: "Asia/Kolkata",
        defaultRisk: 1.0,
        defaultRr: 2.0,
        includeBrokerage: true,
        defaultDateRange: "This Week",
        updatedAt: new Date()
      }
    });

    return { success: true, settings: reset };
  } catch (error: any) {
    console.error("Failed to reset settings:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInitialCapital(email: string, initialCapital: number) {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        initialCapital,
        updatedAt: new Date()
      }
    });

    return { success: true, initialCapital: updatedUser.initialCapital };
  } catch (error: any) {
    console.error("Failed to update initial capital:", error);
    return { success: false, error: error.message };
  }
}
