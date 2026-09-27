import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config({ path: ".env" });

async function createAdmin() {
  try {
    // Connect to database
    const DB_URL = process.env.MONGODB_URL;
    
    if (!DB_URL) {
      console.error("❌ MONGODB_URL is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(DB_URL);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@lms.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin already exists:", existingAdmin.email);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@lms.com",
      password: "Admin@12345",
      role: "admin",
    });

    console.log("✅ Admin created successfully:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin@12345`);
    console.log(`   ID: ${admin._id}`);

    // Disconnect and exit
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();