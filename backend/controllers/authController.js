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
  
  // Business logic handled by service
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

  // Business logic handled by service
  const loginData = await authService.loginUser(
    email,
    password,
    [USER_ROLES.CUSTOMER]
  );

  sendSuccess(res, loginData, "Login successful");
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
  sendCreated(
    res,
    {
      token,
      role: farmer.role,
      last_log_at: farmer.last_log_at,
      requiresStoreSetup: true,
    },
    "Farmer registration successful"
  );
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
      last_log_at: user.last_log_at,
    },
    data: {
      crops: [],
      orders: [],
      stats: "Your farm stats here",
    },
  };

  sendSuccess(res, dashboardData, "Welcome to Farmer Dashboard");
});