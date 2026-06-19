// =============================================================================
// Prisma Client — Singleton
// -----------------------------------------------------------------------------
// Reused across the whole backend. Logs queries in development for visibility.
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient {
  if (!globalThis.__prismaClient) {
    globalThis.__prismaClient = new PrismaClient({
      log: env.isDevelopment
        ? ["query", "warn", "error"]
        : ["warn", "error"],
    });

    globalThis.__prismaClient.$connect().then(() => {
      console.log("✅ Prisma client connected to PostgreSQL");
    }).catch((err) => {
      console.error("❌ Prisma connection failed:", err.message);
      process.exit(1);
    });
  }
  return globalThis.__prismaClient;
}

export const prisma = getPrismaClient();

/**
 * Graceful shutdown — disconnect Prisma on SIGINT/SIGTERM.
 */
export async function disconnectPrisma(): Promise<void> {
  if (globalThis.__prismaClient) {
    await globalThis.__prismaClient.$disconnect();
    console.log("🔌 Prisma client disconnected");
  }
}
