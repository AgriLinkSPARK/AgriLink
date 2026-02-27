// utils/responseHandler.js
// Consistent response formatting - Single Responsibility Principle

import { HTTP_STATUS } from "../constants/index.js";

/**
 * Send success response
 */
export const sendSuccess = (res, data, message = "Success", statusCode = HTTP_STATUS.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send created response (for POST requests)
 */
export const sendCreated = (res, data, message = "Resource created successfully") => {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Send error response
 */
export const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};
