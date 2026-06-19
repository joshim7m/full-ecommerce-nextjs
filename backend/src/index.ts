// =============================================================================
// Baby Planet BD Backend — Express Application Entry Point
// -----------------------------------------------------------------------------
// Boots Express, registers middlewares, mounts route groups, and starts the
// HTTP server. Phase 2 will flesh out the controllers & services referenced here.
// =============================================================================

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { getRedisClient, cache } from "./config/redis";
import { prisma, disconnectPrisma } from "./config/prisma";
import { healthRouter } from "./routes/health.routes";
import { apiNotFound } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error-handler.middleware";

// -----------------------------------------------------------------------------
// Boot function
// -----------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
  logger.info("🚀 Booting Baby Planet BD backend...", {
    nodeEnv: env.nodeEnv,
    port: env.port,
  });

  // 1. Ping Redis to make sure the cache layer is alive (non-fatal if down).
  const redisOk = await cache.ping();
  if (redisOk) {
    logger.info("✅ Redis cache layer is reachable");
  } else {
    logger.warn("⚠️  Redis cache layer is NOT reachable — app will continue without cache");
  }

  // 2. Create Express app
  const app = express();

  // 3. Security & parsing middlewares
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction,
      crossOriginEmbedderPolicy: env.isProduction,
    }),
  );
  app.use(
    cors({
      origin: [env.clientUrl, env.adminUrl],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // 4. HTTP request logging
  app.use(
    morgan(env.isProduction ? "combined" : "dev", {
      stream: { write: (msg: string) => logger.info(msg.trim()) },
    }),
  );

  // 5. Global rate limiter (uses Redis as the store in production)
  const redisClient = getRedisClient();
  const limiter = rateLimit({
    store: redisOk ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) }) : undefined,
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests, please try again later.",
    },
  });
  app.use(env.apiPrefix, limiter);

  // 6. Mount route groups
  app.get("/", (_req, res) => {
    res.json({
      name: "Baby Planet BD API",
      version: "1.0.0",
      phase: "Phase 1 — Initialization, Models, and Realistic Seeders",
      docs: `${env.apiPrefix}/health`,
    });
  });

  app.use(env.apiPrefix, healthRouter);

  // Phase 2 routes (will be mounted here):
  //   app.use(`${env.apiPrefix}/auth`, authRouter);
  //   app.use(`${env.apiPrefix}/categories`, categoryRouter);
  //   app.use(`${env.apiPrefix}/products`, productRouter);
  //   app.use(`${env.apiPrefix}/orders`, orderRouter);
  //   app.use(`${env.apiPrefix}/admin`, adminRouter);

  // 7. 404 + error handlers (must be last)
  app.use(apiNotFound);
  app.use(errorHandler);

  // 8. Start server
  const server = app.listen(env.port, () => {
    logger.info(`🌟 Server listening on http://localhost:${env.port}${env.apiPrefix}`);
    logger.info(`   → Health check: http://localhost:${env.port}${env.apiPrefix}/health`);
  });

  // 9. Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectPrisma();
      const redis = getRedisClient();
      await redis.quit();
      logger.info("✅ All connections closed. Bye!");
      process.exit(0);
    });

    // Force-exit after 10s if graceful shutdown stalls
    setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal boot error:", err);
  process.exit(1);
});

// Suppress unused warning in Phase 1 — prisma will be used by Phase 2 controllers.
void prisma;
