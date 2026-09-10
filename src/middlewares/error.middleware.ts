import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

// Central error handler — every thrown error ends up in this shape
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message, err.errors));
  }

  console.error(err);
  return res.status(500).json(ApiResponse.error("Internal server error"));
};
