import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createStore, getMyStore, updateStore} from "../controllers/storeController.js";

const router = express.Router();

// Create farmer store
router.post("/store", protect, authorize("farmer"), createStore);
router.get("/store", protect , authorize("farmer") , getMyStore);
router.put("/store", protect, authorize("farmer"), updateStore);

// Get logged-in farmer store
// router.get("/store", protect, authorize("farmer"), getMyStore);

export default router;