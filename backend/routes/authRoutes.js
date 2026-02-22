import express from "express";
import { 
  login, 
  registerCustomer, 
  loginCustomer, 
  registerFarmer, 
  getProfile 
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
// These are the ones you confirmed are working (or their counterparts)
router.post("/register", registerCustomer);      // URL: /api/auth/register
router.post("/login", login);                    // URL: /api/auth/login

// --- ADD THESE TO FIX THE OTHERS ---
router.post("/register-farmer", registerFarmer); // URL: /api/auth/register-farmer
router.post("/customer-login", loginCustomer);   // URL: /api/auth/customer-login

// --- PROTECTED ROUTES ---
router.get("/profile", protect, getProfile);     // URL: /api/auth/profile

export default router;