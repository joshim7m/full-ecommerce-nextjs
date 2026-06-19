// =============================================================================
// Auth Controller — HTTP handlers for /api/v1/auth/*
// =============================================================================

import { type Request, type Response } from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  upsertGoogleUser,
  type AuthResult,
} from "../services/auth.service";
import { AppError, sendSuccess, sendCreated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/jwt";
import { env } from "../config/env";
import type { UpdateProfileInput, ChangePasswordInput } from "../validators/auth.validator";

// -----------------------------------------------------------------------------
// Helper — set both cookies and return JSON
// -----------------------------------------------------------------------------

function setAuthCookies(res: Response, auth: AuthResult): void {
  res.cookie(env.jwt.cookieName, auth.accessToken, accessTokenCookieOptions());
  res.cookie(env.jwt.refreshCookieName, auth.refreshToken, refreshTokenCookieOptions());
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(env.jwt.cookieName, { path: "/" });
  res.clearCookie(env.jwt.refreshCookieName, { path: `${env.apiPrefix}/auth` });
}

// -----------------------------------------------------------------------------
// POST /auth/register
// -----------------------------------------------------------------------------

export const register = asyncHandler(async (req: Request, res: Response) => {
  const auth = await registerUser(req.body);
  setAuthCookies(res, auth);
  return sendCreated(res, {
    user: auth.user,
    accessToken: auth.accessToken,
    expiresIn: auth.expiresIn,
  });
});

// -----------------------------------------------------------------------------
// POST /auth/login
// -----------------------------------------------------------------------------

export const login = asyncHandler(async (req: Request, res: Response) => {
  const auth = await loginUser(req.body);
  setAuthCookies(res, auth);
  return sendSuccess(res, {
    user: auth.user,
    accessToken: auth.accessToken,
    expiresIn: auth.expiresIn,
  });
});

// -----------------------------------------------------------------------------
// POST /auth/refresh
// -----------------------------------------------------------------------------

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Token comes from HttpOnly cookie, with body fallback for non-browser clients
  const refreshToken =
    req.cookies?.[env.jwt.refreshCookieName] ?? req.body?.refreshToken;

  if (!refreshToken) {
    throw AppError.unauthorized("Refresh token required");
  }

  const auth = await refreshTokens(refreshToken);
  setAuthCookies(res, auth);
  return sendSuccess(res, {
    user: auth.user,
    accessToken: auth.accessToken,
    expiresIn: auth.expiresIn,
  });
});

// -----------------------------------------------------------------------------
// POST /auth/logout
// -----------------------------------------------------------------------------

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await logoutUser(req.user.id);
  }
  clearAuthCookies(res);
  return sendSuccess(res, { message: "Logged out successfully" });
});

// -----------------------------------------------------------------------------
// GET /auth/me
// -----------------------------------------------------------------------------

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await getCurrentUser(req.user.id);
  return sendSuccess(res, user);
});

// -----------------------------------------------------------------------------
// PATCH /auth/me
// -----------------------------------------------------------------------------

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const updated = await updateProfile(req.user.id, req.body as UpdateProfileInput);
  return sendSuccess(res, updated);
});

// -----------------------------------------------------------------------------
// POST /auth/change-password
// -----------------------------------------------------------------------------

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  await changePassword(req.user.id, req.body as ChangePasswordInput);
  return sendSuccess(res, { message: "Password changed. Please log in again." });
});

// -----------------------------------------------------------------------------
// GET /auth/google — redirects to Google consent screen
// -----------------------------------------------------------------------------

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

// -----------------------------------------------------------------------------
// GET /auth/google/callback — handles Google's redirect
// -----------------------------------------------------------------------------

export const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.clientUrl}/login?error=google_auth_failed`,
  }),
  (req: Request, res: Response) => {
    const authResult = req.user as unknown as AuthResult;
    if (!authResult || !authResult.accessToken) {
      return res.redirect(`${env.clientUrl}/login?error=google_auth_failed`);
    }

    setAuthCookies(res, authResult);

    // Redirect to frontend with success indicator
    const redirectUrl = `${env.clientUrl}/auth/success?token=${encodeURIComponent(authResult.accessToken)}`;
    return res.redirect(redirectUrl);
  },
];

// -----------------------------------------------------------------------------
// Dev-only endpoint: simulate Google OAuth login (for testing without Google creds)
// -----------------------------------------------------------------------------

export const googleDevLogin = asyncHandler(async (req: Request, res: Response) => {
  if (env.isProduction) {
    throw AppError.notFound();
  }
  const { email, name } = req.body;
  if (!email) {
    throw AppError.badRequest("email is required for dev login");
  }
  const auth = await upsertGoogleUser({
    googleId: `dev-${email}`,
    email,
    name: name ?? "Dev User",
  });
  setAuthCookies(res, auth);
  return sendSuccess(res, {
    user: auth.user,
    accessToken: auth.accessToken,
    expiresIn: auth.expiresIn,
  });
});
