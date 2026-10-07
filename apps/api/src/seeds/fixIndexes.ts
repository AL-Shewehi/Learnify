import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/Course.js";
import Review from "../models/Review.js";

dotenv.config({ path: ".env" });

async function fixIndexes() {
  try {
    const DB_URL = process.env.MONGODB_URL;

    if (!DB_URL) {
      console.error("❌ MONGODB_URL is not defined");
      process.exit(1);
    }

    await mongoose.connect(DB_URL);
    console.log("✅ Connected to MongoDB");

    // 1. امسح كل الـ indexes القديمة
    await Course.collection.dropIndexes();
    console.log("✅ Dropped all old Course indexes");

    // 2. أنشئ الـ indexes من الـ schema الجديد
    await Course.syncIndexes();
    console.log("✅ Recreated Course indexes from schema");

    await Review.syncIndexes();
    console.log("✅ Synced Review indexes from schema");

    // 3. Backfill ratingsCount for courses created before the field existed
    const backfill = await Course.updateMany(
      { ratingsCount: { $exists: false } },
      { $set: { ratingsCount: 0 } },
    );
    console.log(`✅ Backfilled ratingsCount on ${backfill.modifiedCount} course(s)`);

    // 4. اعرض الـ indexes الحالية للتأكيد
    const indexes = await Course.collection.indexes();
    console.log("📋 Current Course indexes:");
    indexes.forEach((index) => {
      console.log(`   - ${index.name}`);
    });
    const reviewIndexes = await Review.collection.indexes();
    console.log("📋 Current Review indexes:");
    reviewIndexes.forEach((index) => {
      console.log(`   - ${index.name}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

void fixIndexes();
