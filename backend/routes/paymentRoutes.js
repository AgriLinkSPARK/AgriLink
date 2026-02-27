// backend/routes/paymentRoutes.js
import express from "express";

import { protect, authorize } from "../middleware/authMiddleware.js";


import {
    createPaymentIntent,
    getPaymentStatus,
    stripeWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: The webhook route must use express.raw() to receive the raw body
// buffer required by stripe.webhooks.constructEvent() for signature verification.
// This is registered in server.js BEFORE express.json() to avoid body parsing.
// Here we just export the handler so server.js can wire it up at the app level.
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/payment/create-payment-intent/:orderId
// Authenticated buyer creates (or retrieves) a PaymentIntent for their order
router.post("/create-payment-intent/:orderId", protect, createPaymentIntent);

// GET /api/payment/status/:orderId
// Authenticated buyer checks the current payment + order status
router.get("/status/:orderId", protect, getPaymentStatus);


export default router;
