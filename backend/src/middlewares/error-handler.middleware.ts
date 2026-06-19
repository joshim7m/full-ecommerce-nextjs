// =============================================================================
// Global Error Handler Middleware
// -----------------------------------------------------------------------------
// Catches errors thrown by route handlers and converts them to a consistent
// JSON response shape. Hides stack traces in production.
// =============================================================================

import { type Request, type Response, type NextFunction } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";

interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error";

  if (status >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${status}`, {
      message,
      stack: env.isDevelopment ? err.stack : undefined,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(err.details ? { details: err.details } : {}),
    ...(env.isDevelopment && err.stack ? { stack: err.stack } : {}),
  });
}
