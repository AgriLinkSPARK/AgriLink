import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // for generating random passwords
import { sendFarmerWelcomeEmail } from "../utils/mailer.js";

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