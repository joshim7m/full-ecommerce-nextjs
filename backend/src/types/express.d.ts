// =============================================================================
// Express Type Augmentation — adds `user` to Request after JWT authentication
// =============================================================================

import "express";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "MANAGER";
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}
