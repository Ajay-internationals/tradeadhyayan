"use server";

import { prisma } from "@/lib/db";
import { GoalStatus } from "@prisma/client";

export interface GoalData {
  id: string;
  title: string;
  category: string; // Performance, Risk, Activity, Habit, Learning
  targetValue: number;
  currentValue: number;
  progress: number; // percentage
  status: GoalStatus;
  targetDate: string | null;
}

// Removed mock goals

export async function getGoals(email: string): Promise<GoalData[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        Goal: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.Goal.length === 0) {
      return [];
    }

    return user.Goal.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      targetValue: g.targetValue,
      currentValue: g.currentValue,
      progress: g.progress,
      status: g.status,
      targetDate: g.targetDate ? g.targetDate.toISOString().split("T")[0] : null
    }));
  } catch (error) {
    console.error("Failed to load goals:", error);
    return [];
  }
}

export async function addGoal(
  email: string,
  goalData: { title: string; category: string; targetValue: number; targetDate: string }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newGoal = await prisma.goal.create({
      data: {
        id: `goal_${Date.now()}`,
        userId: user.id,
        title: goalData.title,
        category: goalData.category,
        targetValue: goalData.targetValue,
        currentValue: 0,
        progress: 0,
        status: "NOT_STARTED",
        targetDate: goalData.targetDate ? new Date(goalData.targetDate) : null,
        updatedAt: new Date()
      }
    });

    return { success: true, goal: newGoal };
  } catch (error: any) {
    console.error("Failed to add goal:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGoalProgress(
  email: string,
  goalId: string,
  currentValue: number
) {
  try {
    if (goalId.startsWith("mock_goal_")) {
      return { success: true, isMock: true };
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    let progress = 0;
    if (goal.targetValue > 0) {
      progress = Math.round((currentValue / goal.targetValue) * 100);
    }

    let status: GoalStatus = "ON_TRACK";
    if (currentValue === 0) {
      status = "NOT_STARTED";
    } else if (currentValue >= goal.targetValue) {
      status = "ACHIEVED";
    } else if (goal.category.toLowerCase() === "risk" && currentValue > goal.targetValue) {
      status = "AT_RISK";
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue,
        progress,
        status,
        updatedAt: new Date()
      }
    });

    return { success: true, goal: updated };
  } catch (error: any) {
    console.error("Failed to update goal progress:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGoal(email: string, goalId: string) {
  try {
    if (goalId.startsWith("mock_goal_")) {
      return { success: true, isMock: true };
    }

    await prisma.goal.delete({
      where: { id: goalId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete goal:", error);
    return { success: false, error: error.message };
  }
}
