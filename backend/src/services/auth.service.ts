// =============================================================================
// Auth Service — registration, login, JWT issuance, Google OAuth user upsert
// -----------------------------------------------------------------------------
// Passwords: hashed with bcryptjs (cost factor 12).
// JWTs:
//   • Access token — short-lived (15m), returned in JSON + set as HttpOnly cookie
//   • Refresh token — long-lived (7d), stored hashed in DB (refreshTokenHash),
//                     set as HttpOnly cookie scoped to /api/v1/auth
// =============================================================================

import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { AppError } from "../utils/api-response";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashJti,
} from "../utils/jwt";
import type { UserRole } from "@prisma/client";
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from "../validators/auth.validator";

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: string;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Register
// -----------------------------------------------------------------------------

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { name, email, password, phone } = input;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict("An account with this email already exists", { field: "email" });
  }

  // Check phone uniqueness if provided
  if (phone) {
    const phoneTaken = await prisma.user.findUnique({ where: { phone } });
    if (phoneTaken) {
      throw AppError.conflict("This phone number is already in use", { field: "phone" });
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      phone: phone ?? null,
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
      lastLoginAt: new Date(),
    },
  });

  const tokens = await issueTokens(user.id, user.email, user.role);

  logger.info(`User registered: ${user.email} (${user.id})`);

  return {
    user: toPublicUser(user),
    ...tokens,
  };
}

// -----------------------------------------------------------------------------
// Login
// -----------------------------------------------------------------------------

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    // Use same message for both cases to prevent email enumeration
    throw AppError.unauthorized("Invalid email or password");
  }

  if (user.status === "SUSPENDED") {
    throw AppError.forbidden("Your account has been suspended. Please contact support.");
  }

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    throw AppError.unauthorized("Invalid email or password");
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = await issueTokens(user.id, user.email, user.role);

  logger.info(`User logged in: ${user.email} (${user.id})`);

  return {
    user: toPublicUser(user),
    ...tokens,
  };
}

// -----------------------------------------------------------------------------
// Refresh access token
// -----------------------------------------------------------------------------

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw AppError.unauthorized("User not found");
  }

  if (user.status === "SUSPENDED") {
    throw AppError.forbidden("Account suspended");
  }

  // Verify the JTI matches the one stored in DB
  if (!user.refreshTokenHash || user.refreshTokenHash !== payload.jti.split("-").slice(0, 2).join("-") + "-" + hashJti(payload.jti).slice(0, 16)) {
    // Simpler check: re-hash the JTI and compare full hash
    const expectedHash = hashJti(payload.jti);
    if (user.refreshTokenHash !== expectedHash) {
      throw AppError.unauthorized("Refresh token has been revoked");
    }
  }

  // Rotate: issue a new refresh token and invalidate the old one
  const tokens = await issueTokens(user.id, user.email, user.role);

  logger.info(`Token refreshed for user: ${user.email} (${user.id})`);

  return {
    user: toPublicUser(user),
    ...tokens,
  };
}

// -----------------------------------------------------------------------------
// Logout — invalidate the refresh token in DB and clear cookies
// -----------------------------------------------------------------------------

export async function logoutUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null },
  });
  logger.info(`User logged out: ${userId}`);
}

// -----------------------------------------------------------------------------
// Get current user profile
// -----------------------------------------------------------------------------

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound("User not found");
  }
  return toPublicUser(user);
}

// -----------------------------------------------------------------------------
// Update profile
// -----------------------------------------------------------------------------

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound("User not found");
  }

  // Check phone uniqueness if being updated
  if (input.phone && input.phone !== user.phone) {
    const phoneTaken = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (phoneTaken) {
      throw AppError.conflict("This phone number is already in use", { field: "phone" });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    },
  });

  return toPublicUser(updated);
}

// -----------------------------------------------------------------------------
// Change password
// -----------------------------------------------------------------------------

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    throw AppError.notFound("User not found or account uses social login");
  }

  const passwordOk = await bcrypt.compare(input.currentPassword, user.password);
  if (!passwordOk) {
    throw AppError.unauthorized("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(input.newPassword, 12);

  // Invalidate all existing refresh tokens by clearing the hash
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: newHash,
      refreshTokenHash: null,
    },
  });

  logger.info(`Password changed for user: ${user.email} (${user.id})`);
}

// -----------------------------------------------------------------------------
// Google OAuth — find or create user from Google profile
// -----------------------------------------------------------------------------

export interface GoogleProfile {
  googleId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export async function upsertGoogleUser(profile: GoogleProfile): Promise<AuthResult> {
  // 1. Look up by googleId first
  let user = await prisma.user.findUnique({ where: { googleId: profile.googleId } });

  if (user) {
    if (user.status === "SUSPENDED") {
      throw AppError.forbidden("Account suspended");
    }
    // Update last login + avatar
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        avatarUrl: profile.avatarUrl ?? user.avatarUrl,
      },
    });
  } else {
    // 2. Look up by email — could be a previously-registered local account
    user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (user) {
      if (user.status === "SUSPENDED") {
        throw AppError.forbidden("Account suspended");
      }
      // Link Google ID to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl ?? user.avatarUrl,
          emailVerified: user.emailVerified ?? new Date(),
          lastLoginAt: new Date(),
        },
      });
    } else {
      // 3. Create new account from Google profile
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name ?? null,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl ?? null,
          role: "USER",
          status: "ACTIVE",
          emailVerified: new Date(),
          lastLoginAt: new Date(),
        },
      });
      logger.info(`New Google OAuth user: ${user.email} (${user.id})`);
    }
  }

  const tokens = await issueTokens(user.id, user.email, user.role);

  return {
    user: toPublicUser(user),
    ...tokens,
  };
}

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

async function issueTokens(
  userId: string,
  email: string,
  role: UserRole,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refresh = signRefreshToken({ sub: userId, tokenVersion: 1 });

  // Persist hashed JTI so we can validate refresh tokens on rotation
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: refresh.hashedJti },
  });

  return {
    accessToken,
    refreshToken: refresh.token,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}
