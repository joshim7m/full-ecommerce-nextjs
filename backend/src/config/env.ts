// =============================================================================
// Environment configuration loader
// -----------------------------------------------------------------------------
// Single source of truth for all env vars. Fails fast on missing required vars.
// =============================================================================

import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

function parseInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) {
    throw new Error(`❌ Environment variable ${key} must be a number, got: ${raw}`);
  }
  return n;
}

export const env = {
  nodeEnv: optionalEnv("NODE_ENV", "development") as string,
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",

  port: parseInt("PORT", 4000),
  apiPrefix: optionalEnv("API_PREFIX", "/api/v1") as string,
  clientUrl: optionalEnv("CLIENT_URL", "http://localhost:3000") as string,
  adminUrl: optionalEnv("ADMIN_URL", "http://localhost:3000/admin") as string,

  // Database
  databaseUrl: requireEnv("DATABASE_URL"),

  // Redis
  redis: {
    host: optionalEnv("REDIS_HOST", "localhost") as string,
    port: parseInt("REDIS_PORT", 6379),
    password: optionalEnv("REDIS_PASSWORD"),
    db: parseInt("REDIS_DB", 0),
  },

  // JWT
  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    accessExpiresIn: optionalEnv("JWT_ACCESS_EXPIRES_IN", "15m") as string,
    refreshExpiresIn: optionalEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,
    cookieName: optionalEnv("JWT_COOKIE_NAME", "bp_token") as string,
    refreshCookieName: optionalEnv("JWT_REFRESH_COOKIE_NAME", "bp_refresh_token") as string,
  },

  // Google OAuth
  google: {
    clientId: optionalEnv("GOOGLE_CLIENT_ID"),
    clientSecret: optionalEnv("GOOGLE_CLIENT_SECRET"),
    callbackUrl: optionalEnv(
      "GOOGLE_CALLBACK_URL",
      "http://localhost:4000/api/v1/auth/google/callback",
    ) as string,
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    max: parseInt("RATE_LIMIT_MAX", 300),
  },

  // Cache TTLs (seconds)
  cache: {
    products: parseInt("CACHE_TTL_PRODUCTS", 300),
    categories: parseInt("CACHE_TTL_CATEGORIES", 600),
    productDetail: parseInt("CACHE_TTL_PRODUCT_DETAIL", 120),
  },

  logLevel: optionalEnv("LOG_LEVEL", "info") as string,
} as const;

export type Env = typeof env;
