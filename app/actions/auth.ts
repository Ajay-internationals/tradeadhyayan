"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function loginUser(email: string, password: string) {
  try {
    const userEmail = email.trim().toLowerCase();

    // Look up the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Invalid email or password." };
    }

    return { 
      success: true, 
      user: { 
        email: user.email, 
        name: user.name 
      } 
    };
  } catch (err: any) {
    console.error("Login server action error:", err);
    return { success: false, error: "An unexpected server error occurred." };
  }
}

export async function registerUser(name: string, email: string, password: string) {
  try {
    const userEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Create user and default settings inside a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          name: name.trim(),
          email: userEmail,
          passwordHash,
          updatedAt: new Date(),
        },
      });

      await tx.userSetting.create({
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

      return user;
    });

    return { 
      success: true, 
      user: { 
        email: newUser.email, 
        name: newUser.name 
      } 
    };
  } catch (err: any) {
    console.error("Signup server action error:", err);
    return { success: false, error: "An unexpected server error occurred." };
  }
}
