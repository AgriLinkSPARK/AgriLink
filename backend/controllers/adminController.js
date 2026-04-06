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

    if (!["admin", "farmer", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'admin', 'farmer', or 'customer'" });
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
    const { name, email, role, password } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate role if provided
    if (role !== undefined && role !== null && !["admin", "farmer", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'admin', 'farmer', or 'customer'" });
    }

    // Check if email is taken (if updating email and it's different)
    if (email !== undefined && email !== null && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Build update object
    const updateData = {};
    
    if (name !== undefined && name !== null) updateData.name = name;
    if (email !== undefined && email !== null) updateData.email = email;
    if (role !== undefined && role !== null) updateData.role = role;

    // Handle password update
    if (password !== undefined && password !== null) {
      const trimmedPassword = password.trim();
      if (trimmedPassword.length > 0) {
        if (trimmedPassword.length < 6) {
          return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
        console.log(`[PASSWORD UPDATE] User ${userId}: hashing password, hash length: ${hashedPassword.length}`);
        updateData.password = hashedPassword;
      }
    }

    // Use findByIdAndUpdate to properly update the document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`[PASSWORD UPDATE] User ${userId}: updated fields: ${Object.keys(updateData).join(", ")}`);
    console.log(`[PASSWORD UPDATE] User ${userId}: stored password hash length: ${updatedUser.password.length}`);

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Update user password only
// ==========================
export const updateUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (typeof password !== "string") {
      return res.status(400).json({ message: "Password is required" });
    }

    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(trimmedPassword, 10);
    await user.save();

    return res.json({
      message: "Password updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Update user password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Delete user (with restriction)
// ==========================
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting own account
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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