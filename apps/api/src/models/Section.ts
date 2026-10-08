import mongoose, { Document, Schema, Types, Model } from "mongoose";

export interface ISection extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISectionModel extends Model<ISection> {
  nextOrder(courseId: Types.ObjectId | string): Promise<number>;
}

const sectionSchema = new Schema<ISection>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Section must belong to a course"],
    },
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    order: { type: Number, required: true, min: 1 },
  },
  { timestamps: true, versionKey: false },
);

sectionSchema.index({ course: 1, order: 1 }, { unique: true });

sectionSchema.statics.nextOrder = async function (
  courseId: Types.ObjectId | string,
): Promise<number> {
  const last = await this.findOne({ course: courseId })
    .sort({ order: -1 })
    .select("order");
  return (last?.order ?? 0) + 1;
};

export default mongoose.model<ISection, ISectionModel>(
  "Section",
  sectionSchema,
);
