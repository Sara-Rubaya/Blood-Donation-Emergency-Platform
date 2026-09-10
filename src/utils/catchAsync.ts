import { Request, Response, NextFunction, RequestHandler } from "express";

// Wraps async controllers so thrown errors reach the error middleware
export const catchAsync =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
