import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const customer = await User.create({ name, email, password: hashed, role: "customer" });

    res.status(201).json({ token: generateToken(customer), role: "customer" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Role check to prevent 403 errors later
    if (user.role !== "customer") {
      return res.status(403).json({ message: "Use admin/farmer login endpoint" });
    }

    res.json({ token: generateToken(user), role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

// ... other registration/login exports remain the same
export const login = async (req, res) => { /* logic */ };
export const registerFarmer = async (req, res) => { /* logic */ };