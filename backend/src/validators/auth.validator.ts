// =============================================================================
// Auth Validators — Zod schemas for register / login / refresh
// =============================================================================

import { z } from "zod";

// -----------------------------------------------------------------------------
// Register — email + password + name + optional phone
// -----------------------------------------------------------------------------

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").max(255).toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Phone must be 10–15 digits, optional leading +")
      .optional(),
  }),
});

// -----------------------------------------------------------------------------
// Login — email + password
// -----------------------------------------------------------------------------

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password is required").max(128),
  }),
});

// -----------------------------------------------------------------------------
// Refresh — refresh token comes from HttpOnly cookie but support body fallback
// -----------------------------------------------------------------------------

export const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

// -----------------------------------------------------------------------------
// Update profile — for the /auth/me PATCH endpoint
// -----------------------------------------------------------------------------

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/)
      .optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

// -----------------------------------------------------------------------------
// Change password
// -----------------------------------------------------------------------------

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/),
  }),
});

// -----------------------------------------------------------------------------
// Type exports for controllers
// -----------------------------------------------------------------------------

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
