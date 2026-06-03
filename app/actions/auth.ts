"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function loginUser(email: string, passwordHash: string) {
  try {
    const userEmail = email.toLowerCase().trim();
    
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

    return { success: true, email: user.email, role: user.role };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Server error: " + String(error) + " " + ((error as any).message || "") };
  }
}

export async function registerUser(name: string, email: string, passwordHash: string, role: "CLIENT" | "MENTOR" = "CLIENT") {
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
        role: role,
        updatedAt: new Date(),
      }
    });

    if (role === "MENTOR") {
      await prisma.mentor.create({
        data: {
          id: `men_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          userId: user.id,
          name: user.name,
          email: userEmail,
          designation: "Trading Coach",
          bio: "New mentor profile.",
          experience: "3 Years",
          specialization: "General Technical Analysis",
          capacity: 10,
          payoutShare: 40.0,
          status: "ACTIVE"
        }
      });
    }

    return { success: true, email: user.email };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Server error: " + String(error) + " " + ((error as any).message || "") };
  }
}
