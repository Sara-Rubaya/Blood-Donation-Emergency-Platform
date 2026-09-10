import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiResponse } from "../utils/ApiResponse";

// Validates req.body/params/query against a Zod schema before hitting the controller
export const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json(ApiResponse.error("Validation failed", err.errors));
      }
      next(err);
    }
  };
