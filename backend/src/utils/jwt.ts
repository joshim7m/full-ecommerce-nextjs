// =============================================================================
// JWT Helpers — sign & verify access and refresh tokens
// -----------------------------------------------------------------------------
// Access tokens: short-lived (15 min), used to authenticate API requests.
// Refresh tokens: long-lived (7 days), stored hashed in DB, used to obtain
// new access tokens without re-login.
// =============================================================================

import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";
import { env } from "../config/env";

// -----------------------------------------------------------------------------
// Token payloads
// -----------------------------------------------------------------------------

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: "USER" | "ADMIN" | "MANAGER";
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string; // user id
  tokenVersion: number; // increments on logout/password change to invalidate
  type: "refresh";
  jti: string; // unique token id — stored hashed in DB
}

// -----------------------------------------------------------------------------
// Sign helpers
// -----------------------------------------------------------------------------

export function signAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
  const options: SignOptions = {
    expiresIn: env.jwt.accessExpiresIn,
  };
  return jwt.sign({ ...payload, type: "access" }, env.jwt.accessSecret, options);
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "type" | "jti">,
): { token: string; jti: string; hashedJti: string } {
  const jti = `${payload.sub}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn,
  };
  const token = jwt.sign({ ...payload, type: "refresh", jti }, env.jwt.refreshSecret, options);
  const hashedJti = hashJti(jti);
  return { token, jti, hashedJti };
}

// -----------------------------------------------------------------------------
// Verify helpers
// -----------------------------------------------------------------------------

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwt.accessSecret, {
    algorithms: ["HS256"],
  } as VerifyOptions) as AccessTokenPayload;

  if (decoded.type !== "access") {
    throw new Error("Invalid token type — expected access token");
  }
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.jwt.refreshSecret, {
    algorithms: ["HS256"],
  } as VerifyOptions) as RefreshTokenPayload;

  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type — expected refresh token");
  }
  return decoded;
}

// -----------------------------------------------------------------------------
// JTI hashing — store only the hash in DB so a DB leak doesn't expose tokens
// -----------------------------------------------------------------------------

import { createHash } from "node:crypto";

export function hashJti(jti: string): string {
  return createHash("sha256").update(jti).digest("hex");
}

// -----------------------------------------------------------------------------
// Cookie options
// -----------------------------------------------------------------------------

export function accessTokenCookieOptions() {
  const maxAgeMs = parseExpiryToMs(env.jwt.accessExpiresIn);
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function refreshTokenCookieOptions() {
  const maxAgeMs = parseExpiryToMs(env.jwt.refreshExpiresIn);
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: `${env.apiPrefix}/auth`,
    maxAge: maxAgeMs,
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseExpiryToMs(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}. Expected like "15m" or "7d".`);
  }
  const value = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}
