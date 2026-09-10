import { Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./auth.middleware";

// Usage: authorize("ADMIN"), authorize("ADMIN", "DONOR")
export const authorize =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };
