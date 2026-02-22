import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role, // always "customer" here
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Customer registration
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const customer = await User.create({
      name,
      email,
      password: hashed,
      role: "customer", // force role
    });

    res.status(201).json({ token: generateToken(customer), role: "customer" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Customer login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Only allow customers
    if (user.role !== "customer") {
      return res.status(403).json({ message: "Use admin/farmer login endpoint" });
    }

    res.json({ token: generateToken(user), role: "customer" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Customer Dashboard
export const customerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can access" });
    }

    res.json({
      message: "Welcome to Customer Dashboard",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      data: {
        orders: [],
        wishlist: [],
        recommendations: "Recommended products here"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};