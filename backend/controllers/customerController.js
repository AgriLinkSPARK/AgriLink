import User from "../models/User.js";
import Store from "../models/Store.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendPasswordChangedEmail } from "../utils/mailer.js";

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

    // Send welcome email (best-effort, do not block response)
    try {
      await sendWelcomeEmail(customer.email, customer.name);
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

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

// ==========
// Customer Profile CRUD
// ==========

export const getCustomerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { name, email, password } = req.body;
    let emailChanged = false;
    let passwordChanged = false;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
      emailChanged = true;
    }

    if (name) user.name = name;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
      passwordChanged = true;
    }

    await user.save();

    // Send email notifications for changes
    if (passwordChanged) {
      try {
        console.log(`📧 Preparing to send password change email to: ${user.email}`);
        const emailResult = await sendPasswordChangedEmail(user.email, user.name);
        console.log(`✅ Password change email sent successfully to: ${user.email}`);
        console.log(`📨 Email result:`, emailResult);
      } catch (err) {
        console.error(`❌ Failed to send password changed email to ${user.email}`);
        console.error(`❌ Error details:`, err);
      }
    }

    res.json({ 
      message: passwordChanged ? "Profile updated and confirmation email sent" : "Profile updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCustomerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Customer account deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all stores (for customers)
export const getAllStoresForCustomer = async (req, res) => {
  try {
    // Ensure only customer can access
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can access stores" });
    }

    const stores = await Store.find().populate("owner", "name email");

    res.json({
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
