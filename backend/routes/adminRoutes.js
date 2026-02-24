import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { createFarmer } from "../controllers/adminController.js";

const router = express.Router();

// Admin-only route to create farmers
router.post("/create-farmer", protect, authorize("admin"), createFarmer);

export default router;