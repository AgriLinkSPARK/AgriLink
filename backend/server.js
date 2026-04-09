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
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean).map((origin) => origin.replace(/\/$/, ""));

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (Postman/cURL/server-to-server).
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// ─── MongoDB lifecycle logging ───────────────────────────────────────────────
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  console.warn("🟡 MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const requireDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again in a moment.",
    });
  }

  next();
};

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "AgriLink API is running...",
    dbReadyState: mongoose.connection.readyState,
  });
});

// Protect API routes from buffering timeouts when DB is not ready.
app.use("/api", requireDatabaseConnection);

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

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    app.listen(PORT, () => console.log(`🔴 Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB. Server not started.", err);
    process.exit(1);
  }
};

startServer();

// final commit 80% backend 