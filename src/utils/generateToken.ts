// src/utils/generateToken.ts

import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

/**
 * بيولد JWT token من الـ user ID
 * @param userId - الـ ID بتاع المستخدم
 * @returns الـ JWT token
 * @throws Error لو JWT_SECRET مش معرّف
 */
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const expiresIn: StringValue = (process.env.JWT_EXPIRES_IN || "7d") as StringValue;

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
    algorithm: "HS256",
  });
};

export default generateToken;