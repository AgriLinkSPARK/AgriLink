// backend/routes/paymentRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { payOrder } from "../controllers/paymentController.js";

const router = express.Router();

// Simulated payment
router.put("/:id", protect, authorize("customer"), payOrder);

export default router;