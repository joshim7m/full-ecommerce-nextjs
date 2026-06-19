// =============================================================================
// Order Number Generator
// -----------------------------------------------------------------------------
// Generates human-friendly order numbers in the format: BP-YYYY-NNNNNN
//   e.g. BP-2025-000001, BP-2025-000002, ...
//
// Uses an atomic Redis INCR on a per-year counter key for high throughput
// without DB contention. Falls back to a DB count if Redis is unavailable.
// =============================================================================

import { cache } from "../config/redis";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

const ORDER_SEQ_KEY_PREFIX = "order:seq:year:";

/**
 * Generates the next order number for the given year.
 * Format: BP-YYYY-NNNNNN  (6-digit zero-padded sequence per year)
 */
export async function generateOrderNumber(year: number = new Date().getFullYear()): Promise<string> {
  const redisKey = `${ORDER_SEQ_KEY_PREFIX}${year}`;

  try {
    // Atomic increment — survives concurrent requests safely.
    const client = (await import("../config/redis")).getRedisClient();
    const next = await client.incr(redisKey);

    // Set a TTL so the counter key expires at end of next year (safety margin).
    if (next === 1) {
      // 400 days covers a full year + buffer
      await client.expire(redisKey, 60 * 60 * 24 * 400);
    }

    return formatOrderNumber(year, next);
  } catch (err) {
    logger.warn("Redis INCR failed for order number — falling back to DB count", {
      error: err instanceof Error ? err.message : String(err),
    });
    return generateOrderNumberFromDb(year);
  }
}

/**
 * DB fallback — counts existing orders for the year and adds 1.
 * Less safe under high concurrency but guarantees functionality.
 */
async function generateOrderNumberFromDb(year: number): Promise<string> {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: yearStart,
        lt: yearEnd,
      },
    },
  });

  return formatOrderNumber(year, count + 1);
}

function formatOrderNumber(year: number, sequence: number): string {
  return `BP-${year}-${String(sequence).padStart(6, "0")}`;
}
