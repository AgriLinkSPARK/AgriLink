import express from "express";
import { 
  login, 
  registerCustomer, 
  loginCustomer,
  registerFarmer 
} from "../controllers/authController.js";

const router = express.Router();

// Admin/Farmer login
router.post("/login", login);

// Customer registration & login
router.post("/register/customer", registerCustomer);
router.post("/login/customer", loginCustomer);

// Farmer self-registration
router.post("/register/farmer", registerFarmer);

export default router;