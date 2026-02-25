// backend/controllers/authController.js
import User from "../models/User.js";
import Store from "../models/Store.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/mailer.js";

// Generate JWT
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// ==========================
// Admin/Farmer login
// ==========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Only admin/farmer
    if (user.role === "customer") {
      return res.status(403).json({ message: "Use customer login endpoint" });
    }

    let hasStore = null;

    // 🔥 Only check for farmers
    if (user.role === "farmer") {
      const store = await Store.findOne({ farmer: user._id });
      hasStore = !!store; // true or false
    }

    res.json({
      token: generateToken(user),
      role: user.role,
      hasStore, // will be true/false for farmer, null for admin
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Customer registration
// ==========================
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const customer = await User.create({ name, email, password: hashed, role: "customer" });
    // Send welcome email (best-effort)
    try {
      await sendWelcomeEmail(customer.email, customer.name);
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

    res.status(201).json({ token: generateToken(customer), role: "customer" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Customer login
// ==========================
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "customer") {
      return res.status(403).json({ message: "Use admin/farmer login endpoint" });
    }

    res.json({ token: generateToken(user), role: "customer" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Farmer self-registration
// ==========================
export const registerFarmer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const farmer = await User.create({ name, email, password: hashed, role: "farmer" });

    res.status(201).json({ token: generateToken(farmer), role: "farmer" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Farmer Dashboard
// ==========================
export const farmerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can access" });
    }

    res.json({
      message: "Welcome to Farmer Dashboard",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      data: {
        crops: [],
        orders: [],
        stats: "Your farm stats here"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};