import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "farmer", "user"], // ⭐ 3 roles
    default: "user",
  },
}, { timestamps: true });


export default mongoose.model("User", userSchema);
