import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  student: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Review must belong to a course"],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a student"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer",
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment must be at most 1000 characters"],
    },
  },
  { timestamps: true, versionKey: false },
);

reviewSchema.index({ course: 1, student: 1 }, { unique: true });
reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ course: 1, rating: -1 });

export default mongoose.model<IReview>("Review", reviewSchema);
