// utils/errorHandler.js
// Centralized error handling - Single Responsibility Principle

import { HTTP_STATUS } from "../constants/index.js";

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format error response consistently
 */
export const formatErrorResponse = (error) => {
  return {
    success: false,
    message: error.message || "An error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };
};

/**
 * Global error handling middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  const isDbUnavailable =
    err?.name === "MongooseServerSelectionError" ||
    /buffering timed out/i.test(err?.message || "");

  const statusCode = isDbUnavailable
    ? HTTP_STATUS.SERVICE_UNAVAILABLE
    : (err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);

  const normalizedError = isDbUnavailable
    ? { ...err, message: "Database temporarily unavailable. Please try again." }
    : err;
  
  console.error("Error:", {
    message: normalizedError.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json(formatErrorResponse(normalizedError));
};

/**
 * Handle async errors without try-catch in every controller
 * Usage: exports.myController = asyncHandler(async (req, res) => { ... })
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
