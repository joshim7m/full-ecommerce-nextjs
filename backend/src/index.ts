// =============================================================================
// Baby Planet BD Backend — Express Application Entry Point
// -----------------------------------------------------------------------------
// Boots Express, registers middlewares, mounts route groups, and starts the
// HTTP server. Phase 2: full auth (JWT + Google OAuth), CRUD endpoints for
// Categories / Products / Orders, and the Redis cache layer.
// =============================================================================

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import passport from "passport";
import { join } from "path";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { getRedisClient, cache } from "./config/redis";
import { prisma, disconnectPrisma } from "./config/prisma";
import { configurePassport } from "./config/passport";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { categoryRouter } from "./routes/category.routes";
import { productRouter } from "./routes/product.routes";
import { orderRouter } from "./routes/order.routes";
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

  // 2. Configure Passport (Google OAuth)
  configurePassport();

  // 3. Create Express app
  const app = express();

  // 4. Security & parsing middlewares
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction,
      crossOriginEmbedderPolicy: env.isProduction,
      crossOriginResourcePolicy: { policy: "cross-origin" },
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

  // 5. Serve uploaded / seeded images from the public directory
  app.use(express.static(join(__dirname, "..", "public"), {
    maxAge: env.isProduction ? "7d" : 0,
  }));

  // 6. Initialize Passport (for Google OAuth routes)
  app.use(passport.initialize());

  // 6. HTTP request logging
  app.use(
    morgan(env.isProduction ? "combined" : "dev", {
      stream: { write: (msg: string) => logger.info(msg.trim()) },
    }),
  );

  // 7. Global rate limiter (uses Redis as the store in production)
  const redisClient = getRedisClient();
  const limiter = rateLimit({
    store: redisOk
      ? new RedisStore({ sendCommand: (...args: unknown[]) => redisClient.call(...args) as unknown as Promise<unknown> })
      : undefined,
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

  // 8. Mount route groups
  app.get("/", (_req, res) => {
    res.json({
      name: "Baby Planet BD API",
      version: "2.0.0",
      phase: "Phase 2 — Express Backend Core API, Auth & Redis",
      docs: `${env.apiPrefix}/health`,
      endpoints: {
        auth: `${env.apiPrefix}/auth`,
        categories: `${env.apiPrefix}/categories`,
        products: `${env.apiPrefix}/products`,
        orders: `${env.apiPrefix}/orders`,
      },
    });
  });

  app.use(env.apiPrefix, healthRouter);
  app.use(`${env.apiPrefix}/auth`, authRouter);
  app.use(`${env.apiPrefix}/categories`, categoryRouter);
  app.use(`${env.apiPrefix}/products`, productRouter);
  app.use(`${env.apiPrefix}/orders`, orderRouter);

  // 9. 404 + error handlers (must be last)
  app.use(apiNotFound);
  app.use(errorHandler);

  // 10. Start server
  const server = app.listen(env.port, () => {
    logger.info(`🌟 Server listening on http://localhost:${env.port}${env.apiPrefix}`);
    logger.info(`   → Health check: http://localhost:${env.port}${env.apiPrefix}/health`);
    logger.info(`   → Auth:         http://localhost:${env.port}${env.apiPrefix}/auth`);
    logger.info(`   → Categories:   http://localhost:${env.port}${env.apiPrefix}/categories`);
    logger.info(`   → Products:     http://localhost:${env.port}${env.apiPrefix}/products`);
    logger.info(`   → Orders:       http://localhost:${env.port}${env.apiPrefix}/orders`);
  });

  // 11. Graceful shutdown
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

// Suppress unused warning — prisma will be used by Phase 2 controllers.
void prisma;
