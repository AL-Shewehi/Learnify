import { Request, Response } from "express";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import ApiError from "../utils/ApiError.js";
import { getRouteParam } from "../utils/getRouteParam.js";
import {
  createEnrollmentSchema,
  getMyEnrollmentsQuerySchema,
  updateProgressSchema,
} from "@learnify/shared";

// ============ Types ============

interface CreateEnrollmentInput {
  couponCode?: string;
}

// ============ Parser ============

const parseCreateEnrollmentBody = (raw: unknown): CreateEnrollmentInput => {
  const parsed = createEnrollmentSchema.safeParse(raw ?? {});

  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  return parsed.data;
};

const parsegetMyEnrollmentsSchema = (raw: unknown) => {
  const parsed = getMyEnrollmentsQuerySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

const parseUpdateProgressBody = (raw: unknown): { progress: number } => {
  const parsed = updateProgressSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

// ============ Controller ============

export const createEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Authentication
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  // Role check
  if (req.user.role !== "student") {
    throw new ApiError("Only students can enroll in courses", 403);
  }

  // Get course ID
  const courseId = getRouteParam(req.params.courseId);

  // Validate body (mostly for future coupon support)
  const input = parseCreateEnrollmentBody(req.body);

  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  // Check course is published
  if (course.status !== "published") {
    throw new ApiError("Cannot enroll in non-published course", 400);
  }

  // Check not self-enrollment
  if (course.instructor.toString() === req.user._id.toString()) {
    throw new ApiError("Instructors cannot enroll in their own courses", 400);
  }

  // Check not already enrolled
  const isEnrolled = await Enrollment.isEnrolled(req.user._id, courseId);
  if (isEnrolled) {
    throw new ApiError("You are already enrolled in this course", 409);
  }

  if (course.price > 0) {
    throw new ApiError("Paid courses require checkout", 402);
  }

  // Create enrollment with SERVER-CONTROLLED fields
  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    price: course.price,
    discount: 0,
    progress: 0,
    status: "active",
    couponCode: input.couponCode,
  });

  // Update course.totalStudents (atomic)
  await Course.findByIdAndUpdate(courseId, {
    $inc: { totalStudents: 1 },
  });

  // Populate course details for response
  const populatedEnrollment = await enrollment.populate("course");

  // Response
  res.status(201).json({
    status: "success",
    data: { enrollment: populatedEnrollment },
  });
};

export const getMyEnrollments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = req.user;
  if (!user) {
    throw new ApiError("User not authenticated", 401);
  }

  if (user.role !== "student") {
    throw new ApiError("Only students can view their enrollments", 403);
  }

  // Parse query params
  const input = parsegetMyEnrollmentsSchema(req.query);

  // Build filter
  const filter: Record<string, unknown> = { student: user._id };
  if (input.status) {
    filter.status = input.status;
  }

  // Pagination
  const skip = (input.page - 1) * input.limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("course", "title coverImage price level instructor")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(input.limit),
    Enrollment.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: enrollments.length,
    pagination: {
      total,
      page: input.page,
      totalPages: Math.ceil(total / input.limit),
      limit: input.limit,
    },
    data: { enrollments },
  });
};

export const getCourseEnrollments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = req.user;
  if (!user) {
    throw new ApiError("User not authenticated", 401);
  }

  const courseId = getRouteParam(req.params.courseId);

  if (user.role !== "instructor" && user.role !== "admin") {
    throw new ApiError("Only instructors can view course enrollments", 403);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      "You can only view enrollments for your own courses",
      403,
    );
  }

  //  Stats + Enrollments
  const [enrollments, stats] = await Promise.all([
    Enrollment.findByCourse(courseId),
    Enrollment.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgProgress: { $avg: "$progress" },
        },
      },
    ]),
  ]);

  // Create a map for easy access to stats by status
  const statsMap = Object.fromEntries(
    stats.map((s) => [
      s._id,
      { count: s.count, avgProgress: Math.round(s.avgProgress) },
    ]),
  );

  res.status(200).json({
    status: "success",
    results: enrollments.length,
    stats: {
      active: statsMap.active?.count ?? 0,
      completed: statsMap.completed?.count ?? 0,
      dropped: statsMap.dropped?.count ?? 0,
      averageProgress: statsMap.active?.avgProgress ?? 0,
    },
    data: { enrollments },
  });
};

export const updateProgress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  if (req.user.role !== "student") {
    throw new ApiError("Only students can update their progress", 403);
  }

  const courseId = getRouteParam(req.params.courseId);

  const { progress } = parseUpdateProgressBody(req.body);

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: { $in: ["active", "completed"] },
  });

  if (!enrollment) {
    throw new ApiError("You are not enrolled in this course", 403);
  }

  const updatedEnrollment = await enrollment.updateProgress(progress);

  res.status(200).json({
    status: "success",
    message: "Progress updated successfully",
    data: { enrollment: updatedEnrollment },
  });
};
