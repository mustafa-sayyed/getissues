import type { Request, Response, NextFunction } from "express";
import { ApiLogger as logger } from "@packages/logging";
import type { ApiError } from "../types.ts";

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
    err,
    `Error occurred while processing request: ${req.method} ${req.originalUrl}`,
  );

  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export default globalErrorHandler;
