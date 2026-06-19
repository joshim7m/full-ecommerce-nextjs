// =============================================================================
// Auth Middleware — JWT verification + role-based access control
// -----------------------------------------------------------------------------
// Exports:
//   • authenticate    — verifies access token from HttpOnly cookie OR
//                       Authorization: Bearer <token> header. Attaches
//                       req.user on success. Throws 401 on missing/invalid.
//   • requireRole     — role gate. Use AFTER authenticate.
//                       e.g. router.delete("/:id", authenticate, requireRole("ADMIN"), handler)
//   • optionalAuth    — like authenticate but does NOT throw if no token present.
//                       Useful for product detail pages that show different
//                       content for logged-in vs anonymous users.
// =============================================================================

import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/api-response";
import type { AuthenticatedUser, UserRole } from "../types/express";
import { env } from "../config/env";

// -----------------------------------------------------------------------------
// Extract token from cookie OR Authorization header
// -----------------------------------------------------------------------------

function extractToken(req: Request): string | null {
  // 1. Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  // 2. Try HttpOnly cookie
  const cookieToken = req.cookies?.[env.jwt.cookieName];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  return null;
}

// -----------------------------------------------------------------------------
// authenticate — required for all protected routes
// -----------------------------------------------------------------------------

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(new AppError("Authentication required — no token provided", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    } satisfies AuthenticatedUser;

    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401, "INVALID_TOKEN"));
  }
}

// -----------------------------------------------------------------------------
// optionalAuth — attaches req.user if token present, but never throws
// -----------------------------------------------------------------------------

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    } satisfies AuthenticatedUser;
  } catch {
    // Silently ignore — anonymous request
  }
  next();
}

// -----------------------------------------------------------------------------
// requireRole — role gate (must be used AFTER authenticate)
// -----------------------------------------------------------------------------

export function requireRole(...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          `Forbidden — requires role: ${allowedRoles.join(" or ")}. You are: ${req.user.role}`,
          403,
          "FORBIDDEN",
        ),
      );
      return;
    }

    next();
  };
}

// Convenience presets
export const requireAdmin = requireRole("ADMIN");
export const requireManagerOrAdmin = requireRole("ADMIN", "MANAGER");
