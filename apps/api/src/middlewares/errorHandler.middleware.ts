import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../types.js";

const globalErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err.message, {
    statusCode: err.statusCode,
    stack: err.stack,
  });
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const error = process.env.NODE_ENV === "development" ? err : undefined;

  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export default globalErrorHandler;
