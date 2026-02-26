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