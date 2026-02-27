// backend/routes/orderRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkout, getMyOrders, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

// POST /api/orders/checkout  → create order from cart, returns orderId for payment
router.post("/checkout", protect, checkout);

// GET  /api/orders/my-orders → fetch authenticated buyer's orders
router.get("/my-orders", protect, getMyOrders);

// PUT  /api/orders/cancel/:id → cancel a pending order
router.put("/cancel/:id", protect, cancelOrder);

// NOTE: /api/orders/pay/:id (simulated) has been removed.
// Payment is now handled exclusively via Stripe:
//   1. POST /api/payment/create-payment-intent/:orderId  → get clientSecret
//   2. Complete payment on the frontend using Stripe.js / confirmPayment()
//   3. Stripe sends webhook → POST /api/payment/webhook  → order auto-marked Paid

export default router;