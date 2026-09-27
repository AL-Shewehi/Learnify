import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config({ path: ".env" });

// معالج الأخطاء المتزامنة
process.on("uncaughtException", (err: Error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT: number = Number(process.env.PORT) || 5000;
const DB_URL: string = process.env.MONGODB_URL || "";

// الاتصال بقاعدة البيانات
mongoose
  .connect(DB_URL)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err: Error) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// تشغيل السيرفر
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// معالج الأخطاء غير المتزامنة
process.on("unhandledRejection", (err: Error) => {
  console.error("💥 UNHANDLED REJECTION! Shutting down gracefully...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown عند SIGTERM (مهم للـ Production)
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
});