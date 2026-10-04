import mongoose, { Document, Schema, Types, Model } from "mongoose";
import Course from "./Course.js";

// ============ Types ============

export type EnrollmentStatus = "active" | "completed" | "dropped";

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  enrolledAt: Date;
  status: EnrollmentStatus;
  price: number;
  couponCode?: string;
  discount: number;
  progress: number;
  lastAccessedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  complete(): Promise<IEnrollment>;
  drop(): Promise<IEnrollment>;
  updateProgress(newProgress: number): Promise<IEnrollment>;
  updateLastAccessed(): Promise<IEnrollment>;
  completedLessons: Types.ObjectId[];
  markLessonComplete(lessonId: Types.ObjectId | string): Promise<IEnrollment>;
  recalculateProgress(): Promise<IEnrollment>;
}

export interface IEnrollmentModel extends Model<IEnrollment> {
  findByStudent(
    studentId: Types.ObjectId | string,
    status?: EnrollmentStatus,
  ): Promise<IEnrollment[]>;

  findByCourse(
    courseId: Types.ObjectId | string,
    status?: EnrollmentStatus,
  ): Promise<IEnrollment[]>;

  countByCourse(courseId: Types.ObjectId | string): Promise<number>;

  isEnrolled(
    studentId: Types.ObjectId | string,
    courseId: Types.ObjectId | string,
  ): Promise<boolean>;

  deleteByCourse(courseId: Types.ObjectId | string): Promise<unknown>;
}

// ============ Schema ============

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
      index: true,
    },
    completedLessons: {
      type: [Schema.Types.ObjectId],
      ref: "Lesson",
      default: [],
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
      immutable: true, // cannot be changed after creation
    },
    status: {
      type: String,
      enum: {
        values: ["active", "completed", "dropped"],
        message: "Status must be active, completed, or dropped",
      },
      default: "active",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============ Virtual Fields ============

enrollmentSchema.virtual("effectivePrice").get(function () {
  const discountAmount = (this.price * this.discount) / 100;
  return Math.max(0, this.price - discountAmount);
});

// ============ Indexes ============

// Block duplicate enrollments for the same student and course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Allows users to quickly find all enrollments for a student
enrollmentSchema.index({ student: 1, status: 1 });

// Allows instructors to quickly find all enrollments for a course
enrollmentSchema.index({ course: 1, status: 1 });

// Allows sorting enrollments by enrollment date
enrollmentSchema.index({ enrolledAt: -1 });

// ============ Pre-save Hooks ============

enrollmentSchema.pre("save", async function () {
  if (!this.isModified("course") && !this.isNew) {
    return;
  }

  const course = await Course.findById(this.course);

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error("Cannot enroll in non-published course");
  }

  if (course.instructor.equals(this.student)) {
    throw new Error("Instructor cannot enroll in their own course");
  }
});

enrollmentSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as Record<string, unknown>;

  if (!update.course) {
    return;
  }

  const query = this.getQuery();
  const enrollment = await this.model.findOne(query);

  if (!enrollment) {
    return;
  }

  const course = await Course.findById(update.course);

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error("Cannot enroll in non-published course");
  }
});

// ============ Instance Methods ============

enrollmentSchema.methods.complete = async function (): Promise<IEnrollment> {
  this.status = "completed";
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

enrollmentSchema.methods.drop = async function (): Promise<IEnrollment> {
  this.status = "dropped";
  return this.save();
};

enrollmentSchema.methods.updateProgress = async function (
  newProgress: number,
): Promise<IEnrollment> {
  this.progress = Math.min(100, Math.max(0, newProgress));

  if (this.progress === 100 && this.status !== "completed") {
    return this.complete();
  }

  return this.save();
};

enrollmentSchema.methods.updateLastAccessed =
  async function (): Promise<IEnrollment> {
    this.lastAccessedAt = new Date();
    return this.save();
  };

enrollmentSchema.methods.markLessonComplete = async function (
  lessonId: Types.ObjectId | string,
): Promise<IEnrollment> {
  const Lesson = mongoose.model("Lesson");

  const already = this.completedLessons.some(
    (id: Types.ObjectId) => id.toString() === lessonId.toString(),
  );
  if (!already) {
    this.completedLessons.push(new Types.ObjectId(lessonId.toString()));
  }

  const total = await Lesson.countDocuments({ course: this.course });
  this.progress =
    total === 0
      ? 0
      : Math.min(100, Math.round((this.completedLessons.length / total) * 100));

  if (this.progress >= 100 && this.status !== "completed") {
    return this.complete();
  }

  if (this.status === "completed") {
    this.status = "active";
    this.completedAt = undefined;
  }

  return this.save();
};

enrollmentSchema.methods.recalculateProgress =
  async function (): Promise<IEnrollment> {
    const Lesson = mongoose.model("Lesson");
    const lessonIds = await Lesson.distinct("_id", { course: this.course });
    const availableIds = new Set(
      lessonIds.map((id: Types.ObjectId) => id.toString()),
    );

    this.completedLessons = this.completedLessons.filter((id: Types.ObjectId) =>
      availableIds.has(id.toString()),
    );
    this.progress = lessonIds.length
      ? Math.min(
          100,
          Math.round((this.completedLessons.length / lessonIds.length) * 100),
        )
      : 0;

    if (this.progress === 100 && lessonIds.length > 0) {
      this.status = "completed";
      this.completedAt ??= new Date();
    } else if (this.status === "completed") {
      this.status = "active";
      this.completedAt = undefined;
    }

    return this.save();
  };
// ============ Static Methods ============

enrollmentSchema.statics.findByStudent = function (
  studentId: Types.ObjectId | string,
  status?: EnrollmentStatus,
) {
  const filter: Record<string, unknown> = { student: studentId };
  if (status) filter.status = status;
  return this.find(filter).populate("course").sort({ enrolledAt: -1 });
};

enrollmentSchema.statics.findByCourse = function (
  courseId: Types.ObjectId | string,
  status?: EnrollmentStatus,
) {
  const filter: Record<string, unknown> = { course: courseId };
  if (status) filter.status = status;
  return this.find(filter).populate("student", "name email");
};

enrollmentSchema.statics.countByCourse = function (
  courseId: Types.ObjectId | string,
): Promise<number> {
  return this.countDocuments({
    course: courseId,
    status: { $in: ["active", "completed"] },
  });
};

enrollmentSchema.statics.isEnrolled = async function (
  studentId: Types.ObjectId | string,
  courseId: Types.ObjectId | string,
): Promise<boolean> {
  const count = await this.countDocuments({
    student: studentId,
    course: courseId,
    status: { $in: ["active", "completed"] },
  });
  return count > 0;
};

// ============ Cascade Delete ============

enrollmentSchema.statics.deleteByCourse = function (
  courseId: Types.ObjectId | string,
): Promise<unknown> {
  return this.deleteMany({ course: courseId });
};

// ============ Export ============

export default mongoose.model<IEnrollment, IEnrollmentModel>(
  "Enrollment",
  enrollmentSchema,
);
