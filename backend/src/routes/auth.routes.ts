// =============================================================================
// Auth Routes — /api/v1/auth/*
// =============================================================================

import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
  changePasswordHandler,
  googleAuth,
  googleCallback,
  googleDevLogin,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

export const authRouter = Router();

// -----------------------------------------------------------------------------
// Public routes
// -----------------------------------------------------------------------------

authRouter.post("/register", validate(registerSchema, "body"), register);
authRouter.post("/login", validate(loginSchema, "body"), login);
authRouter.post("/refresh", validate(refreshSchema, "body"), refresh);
authRouter.post("/logout", logout);

// Google OAuth
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", ...googleCallback);

// Dev-only simulator (disabled in production via controller check)
authRouter.post("/google/dev", googleDevLogin);

// -----------------------------------------------------------------------------
// Authenticated routes — require valid access token
// -----------------------------------------------------------------------------

authRouter.get("/me", authenticate, me);
authRouter.patch("/me", authenticate, validate(updateProfileSchema, "body"), updateMe);
authRouter.post("/change-password", authenticate, validate(changePasswordSchema, "body"), changePasswordHandler);
