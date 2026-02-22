import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(cors());
app.use(express.json()); 

// 2. ROUTES
// IMPORTANT: Do NOT put 'protect' here. 
// It will lock the login/register routes.
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection error:", err));