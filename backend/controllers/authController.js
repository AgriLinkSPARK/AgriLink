// backend/controllers/authController.js
// Controller layer - handles HTTP requests/responses only
// Business logic moved to service layer (SOLID: SRP, DIP)

import authService from "../services/authService.js";
import emailService from "../services/emailService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";
import { USER_ROLES } from "../constants/index.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Order from "../models/order.js";

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
  const user = await authService.getUserById(req.user.id);

  const store = await Store.findOne({ farmer: user._id }).select("_id name");
  let orders = [];
  let totalRevenue = 0;

  if (store) {
    const storeProducts = await Product.find({ store: store._id }).select("_id");
    const storeProductIdSet = new Set(storeProducts.map((product) => String(product._id)));

    if (storeProductIdSet.size > 0) {
      const matchingOrders = await Order.find({
        "items.productId": { $in: Array.from(storeProductIdSet) },
      })
        .populate("buyerId", "name email")
        .populate("items.productId", "name store")
        .sort({ createdAt: -1 });

      orders = matchingOrders
        .map((order) => {
          const storeItems = (order.items || []).filter((item) => {
            const productId = item.productId?._id ? String(item.productId._id) : String(item.productId);
            return storeProductIdSet.has(productId);
          });

          if (storeItems.length === 0) {
            return null;
          }

          const quantity = storeItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
          const total = storeItems.reduce(
            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          );

          return {
            _id: order._id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            buyer: order.buyerId || null,
            quantity,
            total,
            items: storeItems,
          };
        })
        .filter(Boolean);

      totalRevenue = orders.reduce((sum, order) => {
        if (order.paymentStatus !== "Paid" || order.status === "Cancelled") {
          return sum;
        }
        return sum + Number(order.total || 0);
      }, 0);
    }
  }

  const dashboardData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      last_log_at: user.last_log_at,
    },
    store: store || null,
    orders,
    totalRevenue,
  };

  sendSuccess(res, dashboardData, "Welcome to Farmer Dashboard");
});