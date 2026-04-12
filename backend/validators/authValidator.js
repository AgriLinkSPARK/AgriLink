// validators/authValidator.js
// Input validation layer - Single Responsibility Principle

import { ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Validation utility functions
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate registration data
 */
export const validateRegisterData = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError(ERROR_MESSAGES.ALL_FIELDS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", HTTP_STATUS.BAD_REQUEST);
  }

  if (!isValidPassword(password)) {
    throw new AppError("Password must be at least 6 characters", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};

/**
 * Validate login data
 */
export const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(ERROR_MESSAGES.ALL_FIELDS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};

/**
 * Validate 2-step OTP send data
 */
export const validateSendOtpData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(ERROR_MESSAGES.ALL_FIELDS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};

/**
 * Validate 2-step OTP verify data
 */
export const validateVerifyOtpData = (req, res, next) => {
  const { otpSessionId, otp } = req.body;

  if (!otpSessionId || !otp) {
    throw new AppError(ERROR_MESSAGES.ALL_FIELDS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  if (!/^\d{6}$/.test(String(otp))) {
    throw new AppError("OTP must be a 6-digit code", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};

/**
 * Validate 2-step preference update payload
 */
export const validateTwoStepPreferenceData = (req, res, next) => {
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    throw new AppError("enabled must be a boolean", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};
