import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // for generating random passwords
import { sendFarmerWelcomeEmail, sendWelcomeEmail } from "../utils/mailer.js";

// ==========================
// Create any user (farmer/customer)
// ==========================
export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Name, email, and role are required" });
    }

    if (!["farmer", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'farmer' or 'customer'" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate a random password
    const password = crypto.randomBytes(4).toString("hex");
    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    // Send welcome email with temporary password (best-effort)
    try {
      if (role === "farmer") {
        await sendFarmerWelcomeEmail(newUser.email, newUser.name, password);
      } else {
        await sendWelcomeEmail(newUser.email, newUser.name);
      }
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password, // plaintext password for admin to share
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Create Farmer (legacy - uses createUser)
// ==========================
export const createFarmer = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ generate a random password
    const password = crypto.randomBytes(4).toString("hex"); // 8 chars

    const hashed = await bcrypt.hash(password, 10);

    const farmer = await User.create({
      name,
      email,
      password: hashed,
      role: "farmer", // force role to farmer
    });

    // Send farmer welcome email with temporary password (best-effort)
    try {
      await sendFarmerWelcomeEmail(farmer.email, farmer.name, password);
    } catch (err) {
      console.error("Failed to send farmer welcome email:", err);
    }

    // return the generated password in the response
    res.status(201).json({ 
      message: "Farmer created successfully and welcome email sent", 
      farmer: {
        name: farmer.name,
        email: farmer.email,
        role: farmer.role,
        password, // plaintext password for admin to share
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get all users with optional role filter
// ==========================
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let filter = {};
    if (role) {
      if (!["admin", "farmer", "customer"].includes(role)) {
        return res.status(400).json({ message: "Invalid role filter" });
      }
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 });

    res.json({
      message: "Users retrieved successfully",
      total: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get user by ID
// ==========================
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("_id name email role createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Update user (edit)
// ==========================
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent updating to admin role
    if (role && role === "admin") {
      return res.status(400).json({ message: "Cannot update user to admin role" });
    }

    // Validate role if provided
    if (role && !["farmer", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'farmer' or 'customer'" });
    }

    // Check if email is taken (if updating email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Delete user (with restriction)
// ==========================
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting own account or admin accounts
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin accounts" });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get users by category/role
// ==========================
export const getUsersByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!["farmer", "customer", "admin"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const users = await User.find({ role: category })
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 });

    res.json({
      message: `${category.charAt(0).toUpperCase() + category.slice(1)}s retrieved successfully`,
      category,
      total: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};