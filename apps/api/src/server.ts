import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import app from "./app";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// معالج الأخطاء المتزامنة
process.on("uncaughtException", (err: Error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT: number = Number(process.env.PORT) || 5000;
const DB_URL: string = process.env.MONGODB_URL || "";

if (!DB_URL) {
  console.error("❌ MONGODB_URL is not defined. Set it in .env");
  process.exit(1);
}

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URL);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", (err as Error).message);
    process.exit(1);
  }

  // تشغيل السيرفر فقط بعد نجاح اتصال DB
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

  const gracefulShutdown = (signal: string): void => {
    console.log(`👋 ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      void mongoose.connection.close().finally(() => process.exit(0));
    });
  };

  // Graceful shutdown
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

void startServer();