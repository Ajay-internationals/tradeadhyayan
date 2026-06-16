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

// Fallback seed goals matching the mockup exactly
const MOCK_GOALS: Omit<GoalData, "id">[] = [
  {
    title: "Achieve ₹50,000 Profit",
    category: "Performance",
    targetValue: 50000,
    currentValue: 34200,
    progress: 68,
    status: "ON_TRACK",
    targetDate: "2024-05-31"
  },
  {
    title: "Win Rate of 60%+",
    category: "Performance",
    targetValue: 60,
    currentValue: 62.5,
    progress: 104,
    status: "ACHIEVED",
    targetDate: "2024-05-18"
  },
  {
    title: "Max Drawdown < 10%",
    category: "Risk",
    targetValue: 10,
    currentValue: 12.3,
    progress: 62,
    status: "AT_RISK",
    targetDate: "2024-05-31"
  },
  {
    title: "Trade 20 Setups",
    category: "Activity",
    targetValue: 20,
    currentValue: 15,
    progress: 75,
    status: "ON_TRACK",
    targetDate: "2024-05-25"
  },
  {
    title: "Daily Journal Streak",
    category: "Habit",
    targetValue: 15,
    currentValue: 12,
    progress: 80,
    status: "ON_TRACK",
    targetDate: "2024-05-20"
  },
  {
    title: "Complete 5 Courses",
    category: "Learning",
    targetValue: 5,
    currentValue: 2,
    progress: 40,
    status: "ON_TRACK",
    targetDate: "2024-06-10"
  }
];

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
      return MOCK_GOALS.map((g, idx) => ({
        id: `mock_goal_${idx + 1}`,
        ...g
      }));
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
