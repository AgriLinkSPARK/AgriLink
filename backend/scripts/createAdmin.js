import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@agrilink.com" });
    
    if (adminExists) {
      console.log("⚠️  Admin user already exists");
      console.log(`Email: ${adminExists.email}`);
      console.log(`Password: admin123 (use for login)`);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash("admin123", 10);

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@agrilink.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin user created successfully!");
    console.log(`\n📋 Admin Credentials:`);
    console.log(`   Email: admin@agrilink.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);

    // Also create a test farmer for reference
    const farmerExists = await User.findOne({ email: "farmer@agrilink.com" });
    if (!farmerExists) {
      const farmerPassword = await bcryptjs.hash("farmer123", 10);
      await User.create({
        name: "Farmer User",
        email: "farmer@agrilink.com",
        password: farmerPassword,
        role: "farmer",
      });
      console.log(`\n🌾 Farmer Credentials (created for reference):`);
      console.log(`   Email: farmer@agrilink.com`);
      console.log(`   Password: farmer123`);
      console.log(`   Role: farmer`);
    }

    // Show buyer credentials
    console.log(`\n🛒 Buyer Credentials (if available):`);
    console.log(`   Email: testbuyer@example.com`);
    console.log(`   Password: password123`);
    console.log(`   Role: customer`);

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdmin();
