// =============================================================================
// Async Handler — wraps async Express controllers so rejected promises are
// forwarded to the global error handler instead of crashing the process.
// =============================================================================

import { type Request, type Response, type NextFunction, type RequestHandler } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
