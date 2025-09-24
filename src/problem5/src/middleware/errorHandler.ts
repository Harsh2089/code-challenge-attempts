import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";

// Custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle custom errors
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // Handle known error types
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (error.name === "SyntaxError" && "body" in error) {
    statusCode = 400;
    message = "Invalid JSON format";
  }

  // Log error details
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Database error handler
export const handleDatabaseError = (error: any): CustomError => {
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return new CustomError("Resource already exists", 409);
  }
  if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    return new CustomError("Referenced resource not found", 400);
  }
  if (error.code === "SQLITE_CONSTRAINT_NOTNULL") {
    return new CustomError("Required field is missing", 400);
  }

  console.error("Database error:", error);
  return new CustomError("Database operation failed", 500);
};
