// backend/routes/orderRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js"; // ← import both
import { checkout, getMyOrders, markAsPaid, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

// Customer routes
router.post("/checkout", protect, authorize("customer"), checkout);
router.get("/my-orders", protect, authorize("customer"), getMyOrders);
router.put("/pay/:id", protect, authorize("customer"), markAsPaid);
router.put("/cancel/:id", protect, authorize("customer"), cancelOrder);

// NOTE: /api/orders/pay/:id (simulated) removed.
// Payment now handled via Stripe:
//   1. POST /api/payment/create-payment-intent/:orderId → get clientSecret
//   2. Complete payment on frontend using Stripe.js / confirmPayment()
//   3. Stripe webhook → POST /api/payment/webhook → order auto-marked Paid

export default router;