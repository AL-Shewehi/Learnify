import mongoose, { Document, Schema, Types, Model } from "mongoose";

export type LessonType = "video" | "article";

export interface ILesson extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  description?: string;
  type: LessonType;
  videoUrl?: string;
  articleBody?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILessonModel extends Model<ILesson> {
  nextOrder(courseId: Types.ObjectId | string): Promise<number>;
}

const lessonSchema = new Schema<ILesson>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Lesson must belong to a course"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title must be at most 150 characters"],
    },
    description: { type: String, trim: true, maxlength: 2000 },
    type: {
      type: String,
      enum: {
        values: ["video", "article"],
        message: "Type must be video or article",
      },
      default: "video",
    },
    videoUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Video URL must be a valid URL"],
    },
    articleBody: { type: String, trim: true },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [600, "Duration must be at most 600 minutes"],
    },
    order: { type: Number, required: true, min: 1 },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

lessonSchema.index({ course: 1, order: 1 });

lessonSchema.pre("validate", function () {
  if (this.type === "video" && !this.videoUrl) {
    this.invalidate("videoUrl", "Video lessons require a video URL");
  }
  if (this.type === "article" && !this.articleBody) {
    this.invalidate("articleBody", "Article lessons require content");
  }
});


lessonSchema.statics.nextOrder = async function(courseId: Types.ObjectId | string): Promise<number> {
    const last = await this.findOne({course: courseId})
    .sort({order: -1})
    .select("order")
    return (last?.order ?? 0) + 1
}


export default mongoose.model<ILesson, ILessonModel>("Lesson", lessonSchema) 