// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "farmer", "customer"], // ⭐ 3 roles
    default: "customer",
  },
}, { timestamps: true });


export default mongoose.model("User", userSchema);
