import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// --- AUTH ---
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email exists" });
    const hashed = await bcrypt.hash(password, 10);
    const customer = await User.create({ name, email, password: hashed, role: "customer" });
    res.status(201).json({ token: generateToken(customer), role: "customer" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
    if (user.role !== "customer") return res.status(403).json({ message: "Use correct login endpoint" });
    res.json({ token: generateToken(user), role: "customer" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
};

// --- PROFILE CRUD (New) ---

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = await User.findByIdAndUpdate(req.user.id, { $set: { name, phone } }, { new: true }).select("-password");
    res.json(updated);
  } catch (error) { res.status(500).json({ message: "Update failed" }); }
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $push: { addresses: req.body } }, { new: true });
    res.json(user.addresses);
  } catch (error) { res.status(500).json({ message: "Address failed" }); }
};

export const getOrderHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("orderHistory");
    res.json(user.orderHistory);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted" });
  } catch (error) { res.status(500).json({ message: "Delete failed" }); }
};