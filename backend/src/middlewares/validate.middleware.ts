// =============================================================================
// Generic validate middleware — runs a Zod schema against the request and
// attaches parsed values back to req. Throws 422 on validation failure.
// =============================================================================

import { type Request, type Response, type NextFunction } from "express";
import { z, type ZodSchema } from "zod";
import { AppError } from "../utils/api-response";

type Target = "body" | "query" | "params";

export function validate<T extends ZodSchema>(schema: T, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ [target]: req[target] });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      next(new AppError("Validation failed", 422, "VALIDATION_ERROR", { errors }));
      return;
    }

    // Replace the request target with the parsed (and coerced) values
    const parsed = result.data as Record<string, unknown>;
    req[target] = parsed[target] as never;
    next();
  };
}
