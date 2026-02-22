import express from "express";
import { registerCustomer, loginCustomer, customerDashboard } from "../controllers/customerController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Customer Dashboard (protected)
router.get("/dashboard", protect, customerDashboard);

export default router;