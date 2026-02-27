import express from "express";
import {
  createLogistics,
  getLogistics,
  updateLogistics,
  deleteLogistics
} from "../controllers/logisticsController.js";

const router = express.Router();

router.post("/", createLogistics);
router.get("/", getLogistics);
router.put("/:id", updateLogistics);
router.delete("/:id", deleteLogistics);

export default router;