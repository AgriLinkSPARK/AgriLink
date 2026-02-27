// backend/models/order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    totalPrice: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Failed"],
      default: "Unpaid"
    },

    // ─── Stripe Payment Fields ────────────────────────────────────────────────
    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true          // fast webhook lookups
    },

    stripeClientSecret: {
      type: String,
      default: null
    },

    // Full Stripe charge/payment-intent snapshot stored after webhook confirms
    stripePaymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    // ISO timestamp of when Stripe confirmed payment
    paidAt: {
      type: Date,
      default: null
    }
    // ─────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);