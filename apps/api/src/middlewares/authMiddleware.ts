import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User, { type UserRole } from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { AUTH_COOKIE_NAME } from "../utils/authCookie.js";

interface TokenPayload {
  id: string;
  iat?: number;  // وقت إصدار الـ token (بالثواني)
}

// Helpers
const getTokenFromRequest = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1] ?? null;
  }

  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  return typeof cookieToken === "string" ? cookieToken : null;
};

const extractTokenPayload = (decoded: JwtPayload | string): TokenPayload | null => {
  if (typeof decoded === "string") return null;

  const payload = decoded as Record<string, unknown>;
  
  if (typeof payload.id !== "string") return null;

  return {
    id: payload.id,
    iat: typeof payload.iat === "number" ? payload.iat : undefined,
  };
}

const extractUserId = (decoded: JwtPayload | string): string | null => {
  if (typeof decoded === "string") return null;

  const payload = decoded as Record<string, unknown>;

  return typeof payload.id === "string" ? payload.id : null;
};

// Protect
export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError("Not authorized to access this route", 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError("Server configuration error", 500);
  }

  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    throw new ApiError("Invalid or expired token, please log in again", 401);
  }

  const tokenPayload = extractTokenPayload(decoded);
  if (!tokenPayload) {
    throw new ApiError("Invalid token payload", 401);
  }

  const user = await User.findById(tokenPayload.id);
  if (!user || !user.isActive) {
    throw new ApiError(
      "The user belonging to this token no longer exists",
      401,
    );
  }

  // Check if the user changed their password after the token was issued
  if (tokenPayload.iat && user.changedPasswordAfter(tokenPayload.iat)) {
    throw new ApiError(
      "You recently changed your password. Please log in again.",
      401,
    );
  }

  req.user = user;
  next();
};

// restrictTo
export const restrictTo =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(new ApiError("Not authenticated", 401));
      return;
    }

    if (!roles.includes(user.role)) {
      next(
        new ApiError("You do not have permission to perform this action", 403),
      );
      return;
    }

    next();
  };

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    const userId = extractUserId(decoded);

    if (!userId) {
      return next()
    }

    const user = await User.findById(userId);

    if (user && user.isActive) {
      req.user = user
    }
  } catch{
    //
  }
  next()
}