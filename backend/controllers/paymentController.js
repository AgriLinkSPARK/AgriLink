// backend/controllers/paymentController.js
import Stripe from "stripe";
import Order from "../models/order.js";

// ─── Stripe client (lazy init so env is loaded first) ────────────────────────
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20"
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-payment-intent/:orderId
//
// Creates (or returns an existing) Stripe PaymentIntent tied to an order.
// Idempotent: if the order already has a PaymentIntent that is still open
// (not yet succeeded/cancelled), the existing clientSecret is returned so the
// frontend can retry without creating a duplicate charge.
// ─────────────────────────────────────────────────────────────────────────────
export const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    const { orderId } = req.params;

    // 1. Fetch the order and verify ownership
    const order = await Order.findOne({ _id: orderId, buyerId: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // 2. Guard: already paid → nothing to do
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Order has already been paid." });
    }

    // 3. Guard: cancelled order cannot be paid
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot pay for a cancelled order." });
    }

    // 4. Idempotency: reuse existing open PaymentIntent
    if (order.stripePaymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId
        );

        // If the intent is still usable, return the existing clientSecret
        if (
          existingIntent.status !== "succeeded" &&
          existingIntent.status !== "canceled"
        ) {
          return res.json({
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
            amount: existingIntent.amount,
            currency: existingIntent.currency
          });
        }
      } catch {
        // Intent may have been archived/deleted – fall through to create a new one
      }
    }

    // 5. Create a new PaymentIntent
    //    Stripe amounts are in the smallest currency unit (cents for USD, paise for INR, etc.)
    //    totalPrice is assumed to be in the base currency unit (e.g. LKR, USD).
    const amountInSmallestUnit = Math.round(order.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: process.env.STRIPE_CURRENCY || "usd",
      metadata: {
        orderId: order._id.toString(),
        buyerId: order.buyerId.toString()
      },
      // idempotency at Stripe level: same order → same idempotency key
      // Stripe de-dupes by idempotency key within 24 h automatically when passed
      // via the Stripe-Idempotency-Key header. Here we encode it in metadata.
      description: `AgriLink order ${order._id}`
    });

    // 6. Persist Stripe data on the order document
    order.stripePaymentIntentId = paymentIntent.id;
    order.stripeClientSecret = paymentIntent.client_secret;
    await order.save();

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (err) {
    console.error("[createPaymentIntent]", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/status/:orderId
//
// Returns current payment status for an order (safe for polling / UI refresh).
// ─────────────────────────────────────────────────────────────────────────────
export const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      buyerId: req.user.id
    }).select("paymentStatus status stripePaymentIntentId paidAt totalPrice");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      stripePaymentIntentId: order.stripePaymentIntentId,
      paidAt: order.paidAt,
      totalPrice: order.totalPrice
    });
  } catch (err) {
    console.error("[getPaymentStatus]", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/webhook
//
// Stripe webhook handler.
// IMPORTANT: This route MUST receive the raw request body (Buffer) so that
// stripe.webhooks.constructEvent() can verify the signature correctly.
// In server.js we register this route BEFORE express.json() using express.raw().
// ─────────────────────────────────────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripeWebhook] STRIPE_WEBHOOK_SECRET is not set.");
    // Return 500 so Stripe retries; do NOT return 200 without processing
    return res.status(500).json({ message: "Webhook secret not configured." });
  }

  // 1. Verify Stripe signature
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body is a raw Buffer here due to express.raw() in server.js
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripeWebhook] Signature verification failed:", err.message);
    return res.status(400).json({ message: `Webhook signature error: ${err.message}` });
  }

  // 2. Handle event types
  try {
    switch (event.type) {
      // ── Payment confirmed ──────────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      // ── Payment cancelled ─────────────────────────────────────────────────
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        await handlePaymentCancelled(paymentIntent);
        break;
      }

      // Unhandled event types — acknowledge receipt but do nothing
      default:
        console.log(`[stripeWebhook] Unhandled event type: ${event.type}`);
    }

    // 3. Acknowledge receipt to Stripe (must respond within 30 s)
    return res.json({ received: true });
  } catch (err) {
    console.error("[stripeWebhook] Handler error:", err);
    // Return 500 so Stripe retries the webhook
    return res.status(500).json({ message: "Webhook processing failed." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark order as Paid + Confirmed after Stripe confirms a successful payment.
 * Idempotent: if already Paid, skip silently.
 */
async function handlePaymentSuccess(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    console.warn("[handlePaymentSuccess] No orderId in PaymentIntent metadata:", paymentIntent.id);
    return;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    console.warn("[handlePaymentSuccess] Order not found:", orderId);
    return;
  }

  // Idempotency: already processed → skip
  if (order.paymentStatus === "Paid") {
    console.log("[handlePaymentSuccess] Already paid, skipping:", orderId);
    return;
  }

  // Verify the PaymentIntent belongs to this order (extra safety check)
  if (order.stripePaymentIntentId !== paymentIntent.id) {
    console.error(
      "[handlePaymentSuccess] PaymentIntent mismatch for order",
      orderId,
      "expected:",
      order.stripePaymentIntentId,
      "got:",
      paymentIntent.id
    );
    return;
  }

  // Update order → Paid + Confirmed
  order.paymentStatus = "Paid";
  order.status = "Confirmed";
  order.paidAt = new Date();

  // Store a compact snapshot of the Stripe payment details
  order.stripePaymentDetails = {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    paymentMethod: paymentIntent.payment_method,
    created: paymentIntent.created,
    receiptEmail: paymentIntent.receipt_email || null
  };

  await order.save();
  console.log(`[handlePaymentSuccess] Order ${orderId} marked as Paid and Confirmed.`);
}

/**
 * Mark order payment as Failed when Stripe reports a payment failure.
 */
async function handlePaymentFailed(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === "Paid") return; // never downgrade a paid order

  order.paymentStatus = "Failed";
  order.stripePaymentDetails = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    lastPaymentError: paymentIntent.last_payment_error?.message || null
  };

  await order.save();
  console.log(`[handlePaymentFailed] Order ${orderId} payment marked as Failed.`);
}

/**
 * Handle PaymentIntent cancellation (e.g. user abandoned checkout).
 */
async function handlePaymentCancelled(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === "Paid") return;

  // Reset the stripePaymentIntentId so a fresh one can be created if the user retries
  order.stripePaymentIntentId = null;
  order.stripeClientSecret = null;
  order.paymentStatus = "Unpaid"; // stays Unpaid — not Failed; user can retry
  await order.save();

  console.log(`[handlePaymentCancelled] PaymentIntent cancelled for order ${orderId}. Intent cleared for retry.`);
}