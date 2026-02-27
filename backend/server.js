// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load env FIRST – everything below depends on it
dotenv.config();

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import logisticsRoutes from "./routes/logisticsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";

// Stripe webhook handler (needs raw body — registered before express.json())
import { stripeWebhook } from "./controllers/paymentController.js";
// Error handling middleware
import { errorMiddleware } from "./utils/errorHandler.js";

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK — must be registered BEFORE express.json()
// Stripe requires the raw request Buffer to verify the webhook signature.
// If express.json() parses this body first, signature verification will fail.
// ─────────────────────────────────────────────────────────────────────────────
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

// ─── MongoDB connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("AgriLink API is running..."));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product", productRoutes);   // alias kept for backwards compatibility
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);   // authenticated payment routes
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Error handling middleware (must be last)
app.use(errorMiddleware);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔴 Server running on port ${PORT}`));

// final commit 80% backend 