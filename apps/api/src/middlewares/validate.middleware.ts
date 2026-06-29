import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = z.safeParse(schema, req.body);

    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({
          msg: "Validation errors",
          errors,
          statusCode: "validation_error",
        });
    }

    req.body = result.data;

    next();
  };
};
