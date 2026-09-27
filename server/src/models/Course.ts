import mongoose, { Document, Schema, Types } from "mongoose";
import type { IUser } from "./User.js";

export type CourseStatus = "published" | "draft" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

// ============ Interfaces ============

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  coverImage?: string;
  price: number;
  subject?: string;
  status: CourseStatus;
  level: CourseLevel;
  language: string;
  duration: number;
  whatYouWillLearn: string[];
  prerequisites: string[];
  totalStudents: number;
  rating: number;
  instructor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  suspendedAt?: Date | null;
  suspensionReason?: string | null;
  suspendedBy?: Types.ObjectId | null;
}

// للنسخة الـ populated
export interface ICoursePopulated extends Omit<ICourse, "instructor"> {
  instructor: IUser;
}

// ============ Schema ============

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    coverImage: {
      type: String,
      match: [/^https?:\/\/.+/, "Invalid image URL"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    subject: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["published", "draft", "archived"],
        message: "Status must be published, draft, or archived",
      },
      default: "draft",
    },
    level: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Level must be beginner, intermediate, or advanced",
      },
      default: "beginner",
    },
    language: {
      type: String,
      default: "arabic",
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration must be a positive number"],
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    totalStudents: {
      type: Number,
      default: 0,
      min: [0, "Total students cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating must be at most 5"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
      trim: true,
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============ Indexes ============

courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ subject: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index(
  { title: "text", description: "text" },
  {
    default_language: "none", // بدون stemming - يشتغل مع أي لغة
    language_override: "textSearchLanguage", // field تاني مش موجود عندنا
  },
);
// ============ Export ============

const Course = mongoose.model<ICourse>("Course", courseSchema);
export default Course;
