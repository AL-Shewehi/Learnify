import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import adminRoutes from "./routes/adminRoutes";
import { notFound, globalErrorHandler } from "./middlewares/errorMiddleware.js";
import enrollmentRoutes from "./routes/enrollmentRoutes";


const app = express();

// ============ Middlewares ============

// 1. حماية الـ Headers
app.use(helmet());

// 2. CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// 3. Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 15 minutes!",
});
app.use("/api", limiter);

// 5. Logging في التطوير
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ============ Routes ============
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "LMS API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1", enrollmentRoutes);
app.use("/api/v1/admin", adminRoutes);


// ============ 404 + Error Handling ============
app.use(notFound);
app.use(globalErrorHandler);

export default app;
