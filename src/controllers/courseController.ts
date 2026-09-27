import { Request, Response } from "express";
import { z } from "zod";
import Course, {
  type CourseStatus,
  type CourseLevel,
} from "../models/Course.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
import { getRouteParam } from "../utils/getRouteParam.js";

// ============ Types ============

interface CreateCourseInput {
  title: string;
  description?: string;
  coverImage?: string;
  price: number;
  subject?: string;
  level: CourseLevel;
}

interface GetCoursesQuery {
  page: number;
  limit: number;
  subject?: string;
  level?: CourseLevel;
  sort: string;
  search?: string;
}

// ============ Zod Schema ============

const createCourseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters")
      .optional(),
    coverImage: z
      .string()
      .regex(/^https?:\/\/.+/, "Invalid image URL")
      .optional(),
    price: z.number().min(0, "Price must be a positive number"),
    subject: z
      .string()
      .trim()
      .max(100, "Subject must be at most 100 characters")
      .optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
  })
  .strict();

const suspendCourseSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(10, "Suspension reason must be at least 10 characters")
      .max(500, "Suspension reason must be at most 500 characters"),
  })
  .strict();

const updateCourseSchema = createCourseSchema.partial();

const getCoursesSchema = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  subject: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  sort: z.string().default("createdAt"),
  search: z.string().optional(),
});

// ============ Parser ============

const parseCreateCourseBody = (raw: unknown): CreateCourseInput => {
  const parsed = createCourseSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new ApiError(firstError.message, 400);
  }

  return parsed.data;
};

const parseGetCoursesQuery = (raw: unknown): GetCoursesQuery => {
  const parsed = getCoursesSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new ApiError(firstError.message, 400);
  }

  return parsed.data;
};

const parseUpdateCourseBody = (raw: unknown) => {
  const parsed = updateCourseSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new ApiError(firstError.message, 400);
  }

  return parsed.data;
};

// ============ Authorization Helper ============

const ensureCourseAccess = async (
  courseId: string,
  user: NonNullable<Request["user"]>,
  options: { requireOwnership?: boolean } = {},
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  const isOwner = course.instructor._id.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  const hasAccess = options.requireOwnership ? isOwner : isOwner || isAdmin;

  if (!hasAccess) {
    throw new ApiError("You don't have permission to perform this action", 403);
  }

  return course;
};

// ============ Controller ============

export const createCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Authentication check (defensive - protect middleware already does this)
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  // Validate input
  const input = parseCreateCourseBody(req.body);

  // Create course (status = draft دايماً، instructor من req.user)
  const course = await Course.create({
    ...input,
    instructor: req.user._id,
    status: "draft" as CourseStatus, // دايماً draft عند الإنشاء
  });

  // Populate instructor data
  const populatedCourse = await course.populate("instructor", "name email");

  res.status(201).json({
    status: "success",
    data: { course: populatedCourse },
  });
};

export const getCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = parseGetCoursesQuery(req.query);

  const filter: Record<string, unknown> = {};

  // ============  Visibility Rules ============

  const isAdmin = req.user?.role === "admin";
  const isInstructor = req.user?.role === "instructor";

  if (isAdmin) {
    //  Admin: يشوف كل حاجة — مفيش status filter
  } else if (isInstructor && req.user) {
    // Instructor: يشوف الـ published + كورساته الخاصة
    filter.$or = [
      { status: "published" },
      { instructor: req.user._id }, // كورساته بأي حالة
    ];
  } else {
    // Public أو Student: published بس
    filter.status = "published";
  }

  // ============  باقي الـ filters ============

  if (query.subject) {
    filter.subject = query.subject;
  }

  if (query.level) {
    filter.level = query.level;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // ============ Sort و Pagination ============

  const sortField = query.sort.startsWith("-")
    ? query.sort.substring(1)
    : query.sort;
  const sortOrder = query.sort.startsWith("-") ? -1 : 1;

  const skip = (query.page - 1) * query.limit;

  const courses = await Course.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(query.limit)
    .populate("instructor", "name email");

  const total = await Course.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: courses.length,
    pagination: {
      total,
      page: query.page,
      pages: Math.ceil(total / query.limit),
      limit: query.limit,
    },
    data: { courses },
  });
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const id = getRouteParam(req.params.id);

  const course = await Course.findById(id).populate("instructor", "name email");

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  if (course.status === "published") {
    res.status(200).json({
      status: "success",
      data: { course },
    });
    return;
  }

  if (!req.user) {
    throw new ApiError("Course not found", 404);
  }

  const isOwner = course.instructor._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError("Course not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: { course },
  });
};

export const updateCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  await ensureCourseAccess(id, req.user);

  const input = parseUpdateCourseBody(req.body);

  const updatedCourse = await Course.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).populate("instructor", "name email");

  res.status(200).json({
    status: "success",
    data: { course: updatedCourse },
  });
};

export const publishCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const course = await ensureCourseAccess(id, req.user, {
    requireOwnership: true,
  });

  if (course.status === "archived") {
    throw new ApiError(
      "This course has been suspended by an administrator. " +
        "Please contact support for more information.",
      403,
    );
  }

  if (course.status === "published") {
    throw new ApiError("Course is already published", 400);
  }

  if (!course.title || !course.price) {
    throw new ApiError(
      "Course must have title and price before publishing",
      400,
    );
  }

  const publishedCourse = await Course.findByIdAndUpdate(
    id,
    { status: "published" },
    { new: true, runValidators: true },
  ).populate("instructor", "name email");

  res.status(200).json({
    status: "success",
    data: { course: publishedCourse },
  });
};

export const unpublishCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const course = await ensureCourseAccess(id, req.user, {
    requireOwnership: true,
  });

  if (course.status !== "published") {
    throw new ApiError("Course is not published", 400);
  }

  const unpublishedCourse = await Course.findByIdAndUpdate(
    id,
    { status: "draft" },
    { new: true, runValidators: true },
  ).populate("instructor", "name email");

  res.status(200).json({
    status: "success",
    data: { course: unpublishedCourse },
  });
};

export const deleteCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const course = await ensureCourseAccess(id, req.user);
  const courseTitle = course.title;

  const Enrollment = mongoose.model("Enrollment");
  const enrollmentsCount = await Enrollment.countDocuments({ course: id });

  if (enrollmentsCount > 0) {
    throw new ApiError(
      `Cannot delete course with ${enrollmentsCount} enrolled student(s). ` +
        `Please unpublish it instead, or contact support.`,
      400,
    );
  }

  await Course.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: `Course "${courseTitle}" deleted successfully`,
  });
};

export const suspendCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  if (req.user.role !== "admin") {
    throw new ApiError("Only admins can suspend courses", 403);
  }

  const parsed = suspendCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  if (course.status === "archived") {
    throw new ApiError("Course is already suspended", 400);
  }

  const suspendedCourse = await Course.findByIdAndUpdate(
    id,
    {
      status: "archived",
      suspendedAt: new Date(),
      suspensionReason: parsed.data.reason,
      suspendedBy: req.user._id,
    },
    { new: true, runValidators: true },
  ).populate("instructor", "name email");

  res.status(200).json({
    status: "success",
    data: { course: suspendedCourse },
  });
};

export const activateCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  if (req.user.role !== "admin") {
    throw new ApiError("Only admins can reactivate suspended courses", 403);
  }

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  if (course.status !== "archived") {
    throw new ApiError("Course is not suspended", 400);
  }

  const activatedCourse = await Course.findByIdAndUpdate(
    id,
    {
      status: "draft",
      suspendedAt: null,
      suspensionReason: null,
      suspendedBy: null,
    },
    { new: true, runValidators: true },
  ).populate("instructor", "name email");

  res.status(200).json({
    status: "success",
    message: "Course has been reactivated and set to draft status",
    data: { course: activatedCourse },
  });
};
