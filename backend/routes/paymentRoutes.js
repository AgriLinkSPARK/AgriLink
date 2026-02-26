// backend/routes/paymentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { payOrder } from "../controllers/paymentController.js";

const router = express.Router();

// Simulated payment
router.put("/:id", protect, payOrder);

export default router;