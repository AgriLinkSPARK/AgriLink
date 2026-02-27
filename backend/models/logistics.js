import mongoose from "mongoose";

const logisticsSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    deliveryPartner: {
      type: String,
      required: true,
      trim: true
    },
    pickupLocation: {
      type: String,
      required: true
    },
    deliveryLocation: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      trim: true
    },
    recipientPhone: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: [
        "Scheduled",
        "Picked Up",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Scheduled"
    },
    expectedDeliveryDate: {
      type: Date
    },
    actualDeliveryDate: Date
  },
  { timestamps: true }
);

export default mongoose.model("Logistics", logisticsSchema);