import type { Request, Response, NextFunction } from "express";
import { ApiLogger as logger } from "@packages/logging";
import { ApiError } from "../types.js";

const globalErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const error = process.env.NODE_ENV === "development" ? err : undefined;

  logger.error(
    {
      statusCode: err.statusCode,
      stack: err.stack,
      error: err,
    },
    err.message,
  );

  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export default globalErrorHandler;
