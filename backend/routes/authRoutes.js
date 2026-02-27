// backend/routes/authRoutes.js
import express from "express";
import { 
  login, 
  registerCustomer, 
  loginCustomer,
  registerFarmer,
  farmerDashboard
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRegisterData, validateLoginData } from "../validators/authValidator.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { USER_ROLES } from "../constants/index.js";

const router = express.Router();

// Admin/Farmer login
router.post("/login", asyncHandler(validateLoginData), login);

// Customer registration & login
router.post("/register/customer", asyncHandler(validateRegisterData), registerCustomer);
router.post("/login/customer", asyncHandler(validateLoginData), loginCustomer);

// Farmer self-registration
router.post("/register/farmer", asyncHandler(validateRegisterData), registerFarmer);

// Farmer Dashboard (protected)
router.get("/dashboard", protect, authorize(USER_ROLES.FARMER), farmerDashboard);

export default router;