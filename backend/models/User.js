// backend/models/User.js
import mongoose from "mongoose";
import { USER_ROLES } from "../constants/index.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  twoStepEnabled: { type: Boolean, default: false },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CUSTOMER,
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
