// =============================================================================
// Health Check Routes — used by Docker, load balancers, and uptime monitors
// =============================================================================

import { Router, type Request, type Response } from "express";
import { env } from "../config/env";
import { cache } from "../config/redis";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * Liveness + readiness probe. Checks Redis + PostgreSQL connectivity.
 */
healthRouter.get("/health", async (_req: Request, res: Response) => {
  const start = Date.now();

  // Check Redis
  const redisOk = await cache.ping();

  // Check PostgreSQL
  let dbOk = false;
  let dbError: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  const latencyMs = Date.now() - start;
  const allOk = redisOk && dbOk;

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    latencyMs,
    phase: "Phase 1 — Initialization, Models, and Realistic Seeders",
    services: {
      redis: {
        ok: redisOk,
        host: env.redis.host,
        port: env.redis.port,
      },
      postgres: {
        ok: dbOk,
        error: dbError,
      },
    },
  });
});

/**
 * GET /api/v1/health/ping
 * Lightweight liveness check — no DB or Redis calls.
 */
healthRouter.get("/health/ping", (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});
