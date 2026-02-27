// models/Product.js
import mongoose from "mongoose";
import { PRODUCT_AVAILABILITY, PRODUCT_UNITS } from "../constants/index.js";

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
    unit: { type: String, default: PRODUCT_UNITS.KG },
    mainImage: { type: String, required: true },
    extraImages: [String],
    availability: { 
      type: String, 
      enum: Object.values(PRODUCT_AVAILABILITY), 
      default: PRODUCT_AVAILABILITY.IN_STOCK 
    },
    harvestDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);