// backend/controllers/authController.js
// Controller layer - handles HTTP requests/responses only
// Business logic moved to service layer (SOLID: SRP, DIP)

import authService from "../services/authService.js";
import emailService from "../services/emailService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";
import { USER_ROLES } from "../constants/index.js";

// ==========================
// Admin/Farmer login
// ==========================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const authData = await authService.authenticateUserForLogin(
    email,
    password,
    [USER_ROLES.ADMIN, USER_ROLES.FARMER]
  );

  if (authService.isTwoStepEnabled(authData.user)) {
    const twoStepData = authService.prepareTwoStepForUser(authData.user, authData.hasStore);

    const emailResult = await emailService.sendLoginOTP(
      twoStepData.user.email,
      twoStepData.user.name,
      twoStepData.otp
    );

    if (!emailResult.success) {
      const allowConsoleFallback = String(process.env.ALLOW_CONSOLE_OTP_FALLBACK).toLowerCase() === "true";
      if (allowConsoleFallback) {
        console.log(`[OTP FALLBACK] ${twoStepData.user.email}: ${twoStepData.otp}`);
        return sendSuccess(res, {
          otpSessionId: twoStepData.otpSessionId,
          expiresIn: twoStepData.expiresIn,
          requiresTwoStep: true,
          fallbackUsed: true,
        }, "OTP generated using console fallback");
      }

      const allowBypass = String(process.env.ALLOW_LOGIN_WHEN_OTP_EMAIL_FAIL).toLowerCase() === "true";
      if (allowBypass) {
        const loginData = await authService.loginUser(email, password, [USER_ROLES.ADMIN, USER_ROLES.FARMER]);
        return sendSuccess(res, {
          ...loginData,
          twoStepBypassed: true,
        }, "Login successful (OTP email unavailable)");
      }

      return res.status(503).json({
        success: false,
        message: "Unable to send OTP email right now. Please try again.",
      });
    }

    return sendSuccess(res, {
      otpSessionId: twoStepData.otpSessionId,
      expiresIn: twoStepData.expiresIn,
      requiresTwoStep: true,
    }, "OTP sent to your email");
  }

  const loginData = await authService.loginUser(
    email,
    password,
    [USER_ROLES.ADMIN, USER_ROLES.FARMER]
  );

  sendSuccess(res, loginData, "Login successful");
});

// ==========================
// Customer registration
// ==========================
export const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Business logic handled by service
  const customer = await authService.registerUser({
    name,
    email,
    password,
    role: USER_ROLES.CUSTOMER,
  });

  // Send welcome email (best-effort, non-blocking)
  emailService.sendCustomerWelcome(customer.email, customer.name);

  const token = authService.generateToken(customer);
  sendCreated(res, { token, role: customer.role }, "Registration successful");
});

// ==========================
// Customer login
// ==========================
export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const authData = await authService.authenticateUserForLogin(
    email,
    password,
    [USER_ROLES.CUSTOMER]
  );

  if (authService.isTwoStepEnabled(authData.user)) {
    const twoStepData = authService.prepareTwoStepForUser(authData.user, authData.hasStore);

    const emailResult = await emailService.sendLoginOTP(
      twoStepData.user.email,
      twoStepData.user.name,
      twoStepData.otp
    );

    if (!emailResult.success) {
      const allowConsoleFallback = String(process.env.ALLOW_CONSOLE_OTP_FALLBACK).toLowerCase() === "true";
      if (allowConsoleFallback) {
        console.log(`[OTP FALLBACK] ${twoStepData.user.email}: ${twoStepData.otp}`);
        return sendSuccess(res, {
          otpSessionId: twoStepData.otpSessionId,
          expiresIn: twoStepData.expiresIn,
          requiresTwoStep: true,
          fallbackUsed: true,
        }, "OTP generated using console fallback");
      }

      const allowBypass = String(process.env.ALLOW_LOGIN_WHEN_OTP_EMAIL_FAIL).toLowerCase() === "true";
      if (allowBypass) {
        const loginData = await authService.loginUser(email, password, [USER_ROLES.CUSTOMER]);
        return sendSuccess(res, {
          ...loginData,
          twoStepBypassed: true,
        }, "Login successful (OTP email unavailable)");
      }

      return res.status(503).json({
        success: false,
        message: "Unable to send OTP email right now. Please try again.",
      });
    }

    return sendSuccess(res, {
      otpSessionId: twoStepData.otpSessionId,
      expiresIn: twoStepData.expiresIn,
      requiresTwoStep: true,
    }, "OTP sent to your email");
  }

  // Business logic handled by service
  const loginData = await authService.loginUser(
    email,
    password,
    [USER_ROLES.CUSTOMER]
  );

  sendSuccess(res, loginData, "Login successful");
});

// ==========================
// Customer 2-step OTP send
// ==========================
export const sendCustomerLoginOTP = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const twoStepData = await authService.prepareTwoStepLogin(
    email,
    password,
    [USER_ROLES.CUSTOMER]
  );

  const emailResult = await emailService.sendLoginOTP(
    twoStepData.user.email,
    twoStepData.user.name,
    twoStepData.otp
  );

  if (!emailResult.success) {
    const allowConsoleFallback = String(process.env.ALLOW_CONSOLE_OTP_FALLBACK).toLowerCase() === "true";
    if (allowConsoleFallback) {
      console.log(`[OTP FALLBACK] ${twoStepData.user.email}: ${twoStepData.otp}`);
      return sendSuccess(res, {
        otpSessionId: twoStepData.otpSessionId,
        expiresIn: twoStepData.expiresIn,
        requiresTwoStep: true,
        fallbackUsed: true,
      }, "OTP generated using console fallback");
    }

    const allowBypass = String(process.env.ALLOW_LOGIN_WHEN_OTP_EMAIL_FAIL).toLowerCase() === "true";
    if (allowBypass) {
      const loginData = await authService.loginUser(email, password, [USER_ROLES.CUSTOMER]);
      return sendSuccess(res, {
        ...loginData,
        twoStepBypassed: true,
      }, "Login successful (OTP email unavailable)");
    }

    return res.status(503).json({
      success: false,
      message: "Unable to send OTP email right now. Please try again.",
    });
  }

  return sendSuccess(res, {
    otpSessionId: twoStepData.otpSessionId,
    expiresIn: twoStepData.expiresIn,
    requiresTwoStep: true,
  }, "OTP sent to your email");
});

// ==========================
// Customer 2-step OTP verify
// ==========================
export const verifyCustomerLoginOTP = asyncHandler(async (req, res) => {
  const { otpSessionId, otp } = req.body;
  const loginData = authService.verifyTwoStepOtp(otpSessionId, otp);
  sendSuccess(res, loginData, "Login successful");
});

// ==========================
// User 2-step preference
// ==========================
export const getTwoStepPreference = asyncHandler(async (req, res) => {
  const preference = await authService.getTwoStepPreference(req.user.id);
  sendSuccess(res, preference, "2-step preference fetched");
});

export const updateTwoStepPreference = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const preference = await authService.updateTwoStepPreference(req.user.id, enabled);
  sendSuccess(res, preference, "2-step preference updated");
});

// ==========================
// Farmer self-registration
// ==========================
export const registerFarmer = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Business logic handled by service
  const farmer = await authService.registerUser({
    name,
    email,
    password,
    role: USER_ROLES.FARMER,
  });

  // Send farmer welcome email (best-effort, non-blocking)
  emailService.sendFarmerWelcome(farmer.email, farmer.name);

  const token = authService.generateToken(farmer);
  sendCreated(res, { token, role: farmer.role }, "Farmer registration successful");
});

// ==========================
// Farmer Dashboard
// ==========================
export const farmerDashboard = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const user = await authService.getUserById(req.user.id);

  const dashboardData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    data: {
      crops: [],
      orders: [],
      stats: "Your farm stats here",
    },
  };

  sendSuccess(res, dashboardData, "Welcome to Farmer Dashboard");
});