"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function loginUser(email: string, passwordHash: string) {
  try {
    const userEmail = email.toLowerCase().trim();
    
    // We expect the frontend to pass the password, we will hash check it here
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return { success: false, error: "No user found with this email" };
    }

    if (!user.passwordHash) {
      return { success: false, error: "Invalid account type" };
    }

    const isValid = await bcrypt.compare(passwordHash, user.passwordHash);
    
    if (!isValid) {
      return { success: false, error: "Incorrect password" };
    }

    return { success: true, email: user.email };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Server error: " + String(error) + " " + ((error as any).message || "") };
  }
}

export async function registerUser(name: string, email: string, passwordHash: string) {
  try {
    const userEmail = email.toLowerCase().trim();
    
    const existing = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (existing) {
      return { success: false, error: "User already exists with this email" };
    }

    const hashed = await bcrypt.hash(passwordHash, 10);

    const user = await prisma.user.create({
      data: {
        id: `usr_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        name,
        email: userEmail,
        passwordHash: hashed,
        updatedAt: new Date(),
      }
    });

    return { success: true, email: user.email };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Server error: " + String(error) + " " + ((error as any).message || "") };
  }
}
