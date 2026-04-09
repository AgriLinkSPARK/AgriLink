// backend/models/order.js
import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants/index.js";

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
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
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
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
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

    stripePaymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    // ISO timestamp of when Stripe confirmed payment
    paidAt: {
      type: Date,
      default: null       // ← removed enum & string default
    }
    // ─────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);