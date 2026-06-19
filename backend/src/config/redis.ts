// =============================================================================
// Redis Client — Singleton
// -----------------------------------------------------------------------------
// Used for:
//   • Product list & category hierarchy caching
//   • Rate limiting (via rate-limit-redis store)
//   • Session cache for anonymous carts
//   • Cache invalidation on admin CRUD operations
// =============================================================================

import Redis from "ioredis";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

/**
 * Returns a process-wide singleton Redis client.
 * Reuses the same connection across hot-reloads in dev (tsx watch).
 */
export function getRedisClient(): Redis {
  if (!globalThis.__redisClient) {
    globalThis.__redisClient = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password,
      db: env.redis.db,
      retryStrategy: (times) => {
        if (times > 10) {
          console.error("❌ Redis connection retries exhausted. Exiting.");
          process.exit(1);
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      lazyConnect: false,
    });

    globalThis.__redisClient.on("connect", () => {
      console.log("✅ Redis client connected");
    });

    globalThis.__redisClient.on("error", (err) => {
      console.error("❌ Redis client error:", err.message);
    });

    globalThis.__redisClient.on("reconnecting", () => {
      console.warn("⚠️  Redis client reconnecting...");
    });
  }

  return globalThis.__redisClient;
}

/**
 * Cache helper with JSON serialization built-in.
 * Use across services: services/product.service.ts etc.
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    const raw = await client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, "EX", ttlSeconds);
  },

  async del(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(key);
  },

  async delByPattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    let cursor = "0";
    let deleted = 0;
    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        deleted += await client.del(...keys);
      }
    } while (cursor !== "0");
    return deleted;
  },

  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  async ping(): Promise<boolean> {
    try {
      const client = getRedisClient();
      const response = await client.ping();
      return response === "PONG";
    } catch {
      return false;
    }
  },
};

/**
 * Cache key builders — keep keys consistent across services.
 */
export const cacheKeys = {
  // Product list & detail
  productList: (params: Record<string, unknown>) =>
    `products:list:${Buffer.from(JSON.stringify(params)).toString("base64")}`,
  productDetail: (slug: string) => `products:detail:${slug}`,
  featuredProducts: () => "products:featured",
  bestSellers: () => "products:bestsellers",
  relatedProducts: (slug: string) => `products:related:${slug}`,

  // Category hierarchy
  categoryTree: () => "categories:tree",
  categoryDetail: (slug: string) => `categories:detail:${slug}`,
  categoryProducts: (slug: string, page: number) => `categories:${slug}:products:p${page}`,

  // Search
  searchResults: (query: string, page: number) =>
    `search:${Buffer.from(query).toLowerCase()}:p${page}`,
} as const;
