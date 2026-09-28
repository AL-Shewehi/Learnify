// src/middlewares/errorMiddleware.ts

import type { ErrorRequestHandler, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

// 404 Handler

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
};

// Global Error Handler

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  _next
) => {
  let statusCode = 500;
  let message = "Something went wrong!";

  if (err instanceof ApiError) {
    // الأخطاء المتوقعة اللي رميناها بإيدينا
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token expired, please log in again";
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (err instanceof mongoose.Error.CastError) {
    // ObjectId غلط مثلًا
    statusCode = 404;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    // فشل الـ validation بتاع الـ schema
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  } else if (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === 11000
  ) {
    // Duplicate key من MongoDB
    statusCode = 409;
    message = "Duplicate field value entered";
  } else if (err instanceof Error) {
    message = err.message;
  }

  const payload: Record<string, unknown> = {
    status: statusCode >= 500 ? "error" : "fail",
    message,
  };

  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};