import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { checkout, getMyOrders, markAsPaid, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", protect, authorize("customer"), checkout);
router.get("/my-orders", protect, authorize("customer"), getMyOrders);
router.put("/pay/:id", protect, authorize("customer"), markAsPaid);
router.put("/cancel/:id", protect, authorize("customer"), cancelOrder);

export default router;