import type { Request, Response, NextFunction } from "express";
import { z, type ZodType } from "zod";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";

export const validateBody = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = z.safeParse(schema, req.body);

    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        msg: "Validation errors",
        errors,
        statusCode: "validation_error",
      });
    }

    req.body = result.data;

    next();
  };
};

export const validateParams = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = z.safeParse(schema, req.params);

    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        msg: "Validation errors",
        errors,
        statusCode: "validation_error",
      });
    }

    req.params = result.data as typeof req.params;

    next();
  };
};

export const validateQuery = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = z.safeParse(schema, req.query);

    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        msg: "Validation errors",
        errors,
        statusCode: "validation_error",
      });
    }

    Object.assign(req.query, result.data as Record<string, unknown>);

    next();
  };
};
