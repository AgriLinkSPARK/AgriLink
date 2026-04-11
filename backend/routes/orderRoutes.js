// backend/routes/orderRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { checkout, getMyOrders, markAsPaid, cancelOrder, getAllOrders } from "../controllers/orderController.js";

const router = express.Router();


router.post("/checkout", protect, authorize("customer"), checkout);
router.get("/my-orders", protect, authorize("customer"), getMyOrders);
router.put("/pay/:id", protect, authorize("customer"), markAsPaid);
router.put("/cancel/:id", protect, authorize("customer"), cancelOrder);

// Admin route - get all orders
router.get("/all", protect, authorize("admin"), getAllOrders);

// NOTE: /api/orders/pay/:id (simulated) has been removed.
// Payment is now handled exclusively via Stripe:
//   1. POST /api/payment/create-payment-intent/:orderId  → get clientSecret
//   2. Complete payment on the frontend using Stripe.js / confirmPayment()
//   3. Stripe sends webhook → POST /api/payment/webhook  → order auto-marked Paid

export default router;
