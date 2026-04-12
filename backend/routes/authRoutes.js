// backend/routes/authRoutes.js
import express from "express";
import { 
  login, 
  registerCustomer, 
  loginCustomer,
  sendCustomerLoginOTP,
  verifyCustomerLoginOTP,
  getTwoStepPreference,
  updateTwoStepPreference,
  registerFarmer,
  farmerDashboard
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  validateRegisterData,
  validateLoginData,
  validateSendOtpData,
  validateVerifyOtpData,
  validateTwoStepPreferenceData,
} from "../validators/authValidator.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { USER_ROLES } from "../constants/index.js";

const router = express.Router();

// Admin/Farmer login
router.post("/login", asyncHandler(validateLoginData), login);

// Customer registration & login
router.post("/register/customer", asyncHandler(validateRegisterData), registerCustomer);
router.post("/login/customer", asyncHandler(validateLoginData), loginCustomer);
router.post("/login/customer/2step/send-otp", asyncHandler(validateSendOtpData), sendCustomerLoginOTP);
router.post("/login/customer/2step/verify-otp", asyncHandler(validateVerifyOtpData), verifyCustomerLoginOTP);
router.post("/login/2step/verify-otp", asyncHandler(validateVerifyOtpData), verifyCustomerLoginOTP);

// 2-step preference (all authenticated users)
router.get("/2step/preference", protect, getTwoStepPreference);
router.patch("/2step/preference", protect, asyncHandler(validateTwoStepPreferenceData), updateTwoStepPreference);

// Farmer self-registration
router.post("/register/farmer", asyncHandler(validateRegisterData), registerFarmer);

// Farmer Dashboard (protected)
router.get("/dashboard", protect, authorize(USER_ROLES.FARMER), farmerDashboard);

export default router;