import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "farmer", "customer"],
    default: "customer",
  },
  phone: String,
  addresses: [{
    street: String,
    city: String,
    zipCode: String,
    isDefault: { type: Boolean, default: false }
  }],
  orderHistory: [{
    orderId: String,
    date: { type: Date, default: Date.now },
    amount: Number,
    status: { type: String, default: "Pending" }
  }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);