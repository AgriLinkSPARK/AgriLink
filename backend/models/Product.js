// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    mainImage: { type: String, required: true },
    extraImages: [String],
    availability: { type: String, enum: ["in-Stock", "out-of-stock"], default: "in-Stock" },
    harvestDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);