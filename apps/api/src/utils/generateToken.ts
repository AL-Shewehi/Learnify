// src/utils/generateToken.ts

import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

/**
 * Generates a JWT token for the given user ID.
 * @param userId - The ID of the user for whom the token is generated.
 * @param role - The role of the user (e.g., "student", "admin").
 * @returns The generated JWT token.
 * @throws Error if JWT_SECRET is not defined in environment variables.
 */
const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const expiresIn: StringValue = (process.env.JWT_EXPIRES_IN || "7d") as StringValue;

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn,
    algorithm: "HS256",
  });
};

export default generateToken;