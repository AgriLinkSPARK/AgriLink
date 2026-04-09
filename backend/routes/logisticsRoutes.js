import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createLogistics,
  getLogistics,
  getLogisticsByOrder,
  updateLogistics,
  deleteLogistics
} from "../controllers/logisticsController.js";

const router = express.Router();

// Public/customer route - any authenticated user can track their order
router.get("/order/:orderId", protect, getLogisticsByOrder);

// Admin-only routes
router.post("/", protect, authorize("admin"), createLogistics);
router.get("/", protect, authorize("admin"), getLogistics);
router.put("/:id", protect, authorize("admin"), updateLogistics);
router.delete("/:id", protect, authorize("admin"), deleteLogistics);

export default router;