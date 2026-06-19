// =============================================================================
// 404 Not Found Middleware
// =============================================================================

import { type Request, type Response, type NextFunction } from "express";

export function apiNotFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
