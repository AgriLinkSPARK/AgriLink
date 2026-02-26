// backend/models/Order.js
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
    }
  },
  { timestamps: true }
);

// Use ESM export
export default mongoose.model("Order", orderSchema);