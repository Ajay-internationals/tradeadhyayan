import { PrismaClient } from "@prisma/client";
import net from "net";

const globalForPrisma = global as unknown as { prisma: PrismaClient; proxyStarted?: boolean };

// Invalidate the cache to force the new schema to load
delete (globalForPrisma as any).prisma;

let databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

// Database connection config loads directly from env.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl ? {
      db: {
        url: databaseUrl,
      },
    } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

