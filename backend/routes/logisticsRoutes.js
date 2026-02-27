import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createLogistics,
  getLogistics,
  updateLogistics,
  deleteLogistics
} from "../controllers/logisticsController.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createLogistics);
router.get("/", protect, authorize("admin"), getLogistics);
router.put("/:id", protect, authorize("admin"), updateLogistics);
router.delete("/:id", protect, authorize("admin"), deleteLogistics);

export default router;