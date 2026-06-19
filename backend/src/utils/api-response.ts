// =============================================================================
// API Response Helpers — consistent JSON shape across all controllers
// -----------------------------------------------------------------------------
// Every API response uses the shape:
//   { success: true,  data: T, meta?: {...} }
//   { success: false, error: "...", details?: {...} }
// =============================================================================

import { type Response } from "express";

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginatedMeta;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function sendSuccess<T>(res: Response, data: T, status = 200, meta?: Record<string, unknown>): Response {
  const body: SuccessResponse<T> = meta ? { success: true, data, meta } : { success: true, data };
  return res.status(status).json(body);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  opts: { page: number; pageSize: number; total: number },
): Response {
  const totalPages = Math.max(1, Math.ceil(opts.total / opts.pageSize));
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    meta: {
      page: opts.page,
      pageSize: opts.pageSize,
      total: opts.total,
      totalPages,
      hasNext: opts.page < totalPages,
      hasPrev: opts.page > 1,
    },
  };
  return res.status(200).json(body);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

// -----------------------------------------------------------------------------
// AppError — throw this from anywhere; the global error handler picks it up.
// -----------------------------------------------------------------------------

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status = 400, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string, details?: unknown): AppError {
    return new AppError(message, 409, "CONFLICT", details);
  }

  static unprocessableEntity(message: string, details?: unknown): AppError {
    return new AppError(message, 422, "UNPROCESSABLE_ENTITY", details);
  }
}
