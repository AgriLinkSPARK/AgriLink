import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // for generating random passwords

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

    // return success without plaintext password
    // Password should be sent via secure email instead
    res.status(201).json({ 
      message: "Farmer created successfully and password sent to email", 
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        role: farmer.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};