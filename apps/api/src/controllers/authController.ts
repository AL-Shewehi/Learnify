import { Request, Response } from "express";
import crypto from "crypto";
import User, { type IUser, type UserRole } from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { getRouteParam } from "../utils/getRouteParam.js";
import Course from "../models/Course.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updateMeSchema,
} from "@learnify/shared";

// ============ Types ============

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ============ Parsers ============

const parseSignupBody = (raw: unknown): SignupInput => {
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return {
    ...parsed.data,
    role: parsed.data.role ?? ("student" as UserRole),
  };
};

const parseLoginBody = (raw: unknown): LoginInput => {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

const parseForgotPasswordBody = (raw: unknown): { email: string } => {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

const parseResetPasswordBody = (
  raw: unknown,
): { password: string; confirmPassword: string } => {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

const parseChangePasswordBody = (
  raw: unknown,
): {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
} => {
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

// ============ Helpers ============

const toUserResponse = (user: IUser): UserResponse => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const sendTokenResponse = (
  user: IUser,
  statusCode: number,
  res: Response,
): void => {
  const token = generateToken(user._id.toString(), user.role);

  setAuthCookie(res, token);
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user: toUserResponse(user) },
  });
};

// ============ Auth Controllers ============

export const signup = async (req: Request, res: Response): Promise<void> => {
  const input = parseSignupBody(req.body);

  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new ApiError("Email already in use", 409);
  }

  const user = await User.create(input);
  sendTokenResponse(user, 201, res);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const input = parseLoginBody(req.body);

  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user || !user.isActive) {
    throw new ApiError("Invalid credentials or inactive account", 401);
  }

  const isPasswordCorrect = await user.comparePassword(input.password);
  if (!isPasswordCorrect) {
    throw new ApiError("Invalid credentials", 401);
  }

  sendTokenResponse(user, 200, res);
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  res.status(200).json({
    status: "success",
    data: { user: toUserResponse(req.user) },
  });
};

// ============ Password Management ============

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = parseForgotPasswordBody(req.body);

  const user = await User.findOne({ email });

  // User enumeration protection
  if (user) {
    const resetToken = user.createPasswordResetToken();

    try {
      await user.save({ validateBeforeSave: false });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const resetURL = `${clientUrl}/reset-password/${resetToken}`;

      const html = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetURL}">${resetURL}</a></p>
        <p>This link is valid for <strong>10 minutes</strong> only.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      await sendEmail({
        to: user.email,
        subject: "Your password reset token (valid for 10 min)",
        html,
      });
    } catch {
      // لو حصل أي مشكلة، امسح الـ token عشان الأمان
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ApiError(
        "There was an error sending the email. Try again later!",
        500,
      );
    }
  }

  res.status(200).json({
    status: "success",
    message: "If an account exists with this email, a reset link has been sent",
  });
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = getRouteParam(req.params.token);

  const { password } = parseResetPasswordBody(req.body);

  // Hash الـ token (نفس الـ hash اللي حفظناه في الداتابيز)
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // دور على المستخدم بالـ token + تأكد إن الـ token لسه صالح
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError("Token is invalid or has expired", 400);
  }

  // حدّث الباسورد وامسح الـ reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const { currentPassword, newPassword } = parseChangePasswordBody(req.body);

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    throw new ApiError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const updates = parsed.data;

  // check if the new email is already in use by another user
  if (updates.email) {
    const existingUser = await User.findOne({ email: updates.email });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError("Email is already in use", 409);
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: { user: toUserResponse(user) },
  });
};

export const deleteMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  // if the user is an instructor, check if they have any published courses
  if (req.user.role === "instructor") {
    const coursesCount = await Course.countDocuments({
      instructor: req.user._id,
      status: "published",
    });

    if (coursesCount > 0) {
      throw new ApiError(
        `You have ${coursesCount} published course(s). Please unpublish them before deactivating your account.`,
        400,
      );
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isActive: false },
    { new: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Your account has been deactivated",
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
