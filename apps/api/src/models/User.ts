import mongoose, { Schema, Document } from "mongoose";
import { hash, compare, genSalt } from "bcryptjs";
import crypto from "crypto";

export type UserRole = "student" | "instructor" | "admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // مش هنرجع الباسورد في أي query عادي (أمان!)
    },
    role: {
      type: String,
      enum: {
        values: ["student", "instructor", "admin"],
        message: "Role must be either student, instructor, or admin",
      },
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  // لو الباسورد متغيرش، مفيش داعي نعمل أي حاجة
  if (!this.isModified("password")) return;

  const salt = await genSalt(12);
  this.password = await hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
