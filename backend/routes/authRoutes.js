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

const router = express.Router();

// Admin/Farmer login
router.post("/login", login);

// Customer registration & login
router.post("/register/customer", registerCustomer);
router.post("/login/customer", loginCustomer);

// Farmer self-registration
router.post("/register/farmer", registerFarmer);

// Farmer Dashboard (protected)
router.get("/dashboard", protect, farmerDashboard);

export default router;