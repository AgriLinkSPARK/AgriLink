import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
<<<<<<< Updated upstream
import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import customerRoutes from "./routes/customerRoutes.js";
=======
import mongoose from "mongoose";

import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
>>>>>>> Stashed changes

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< Updated upstream
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

=======
mongoose.connect("mongodb://127.0.0.1:27017/agriDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
>>>>>>> Stashed changes

app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/customer", customerRoutes);

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
