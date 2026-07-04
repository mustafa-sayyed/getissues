class ApiError extends Error {
  statusCode: number;
  message: string;
  success: boolean;

  constructor(statusCode = 500, message = "Internal Server Error") {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
