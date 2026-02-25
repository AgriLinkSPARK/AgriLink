import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkout, getMyOrders, markAsPaid, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/my-orders", protect, getMyOrders);
router.put("/pay/:id", protect, markAsPaid);
router.put("/cancel/:id", protect, cancelOrder);

export default router;