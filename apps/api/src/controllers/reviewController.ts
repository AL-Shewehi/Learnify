import { Request, Response } from "express";
import { Types } from "mongoose";
import Review from "../models/Review.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import ApiError from "../utils/ApiError.js";
import { getRouteParam } from "../utils/getRouteParam.js";
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
} from "@learnify/shared";

const REVIEW_SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  highest: { rating: -1 },
  lowest: { rating: 1 },
} as const;

const toObjectId = (id: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${label}`, 400);
  }
  return new Types.ObjectId(id);
};

const recalculateCourseRating = async (courseId: string): Promise<void> => {
  const courseObjectId = toObjectId(courseId, "course id");

  const stats = await Review.aggregate([
    { $match: { course: courseObjectId } },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0 && stats[0]) {
    const average = Math.round(stats[0].averageRating * 10) / 10;
    await Course.updateOne(
      { _id: courseObjectId },
      { $set: { rating: average, ratingsCount: stats[0].totalReviews } },
    );
  } else {
    await Course.updateOne(
      { _id: courseObjectId },
      { $set: { rating: 0, ratingsCount: 0 } },
    );
  }
};

export const createReview = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  if (req.user.role !== "student") {
    throw new ApiError("Only students can create reviews", 403);
  }

  const courseId = getRouteParam(req.params.courseId);
  toObjectId(courseId, "course id");

  const course = await Course.findById(courseId).select("_id status");
  if (!course || course.status !== "published") {
    throw new ApiError("Course not found or not published", 404);
  }

  const enrollment = await Enrollment.findOne({
    course: course._id,
    student: req.user._id,
    status: { $in: ["active", "completed"] },
  }).select("_id");

  if (!enrollment) {
    throw new ApiError(
      "You must be enrolled in this course to create a review",
      403,
    );
  }

  const existingReview = await Review.findOne({
    course: course._id,
    student: req.user._id,
  }).select("_id");

  if (existingReview) {
    throw new ApiError("You have already reviewed this course", 409);
  }

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  let review;
  try {
    review = await Review.create({
      course: course._id,
      student: req.user._id,
      rating: parsed.data.rating,
      ...(parsed.data.comment !== undefined
        ? { comment: parsed.data.comment }
        : {}),
    });
  } catch (err) {
    // Race: two concurrent POSTs pass the findOne check above
    if (
      typeof err === "object" &&
      err !== null &&
      (err as { code?: unknown }).code === 11000
    ) {
      throw new ApiError("You have already reviewed this course", 409);
    }
    throw err;
  }

  await recalculateCourseRating(courseId);

  res.status(201).json({ status: "success", data: { review } });
};

export const updateReview = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const reviewId = getRouteParam(req.params.reviewId);
  toObjectId(reviewId, "review id");

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError("Review not found", 404);
  }

  if (review.student.toString() !== req.user._id.toString()) {
    throw new ApiError("You can only update your own reviews", 403);
  }

  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  review.set(parsed.data);
  await review.save();
  await recalculateCourseRating(review.course.toString());

  res.status(200).json({ status: "success", data: { review } });
};

export const getReviewsByCourse = async (req: Request, res: Response) => {
  const courseId = getRouteParam(req.params.courseId);
  toObjectId(courseId, "course id");

  const parsedQuery = getReviewsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new ApiError(
      parsedQuery.error.issues[0]?.message ?? "Invalid query",
      400,
    );
  }
  const { page, limit, sort } = parsedQuery.data;
  const sortKey = sort as keyof typeof REVIEW_SORT_MAP;

  const skip = (page - 1) * limit;

  const [reviews, total, course] = await Promise.all([
    Review.find({ course: courseId })
      .populate("student", "name email")
      .sort(REVIEW_SORT_MAP[sortKey])
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ course: courseId }),
    Course.findById(courseId).select("rating ratingsCount").lean(),
  ]);

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  res.status(200).json({
    status: "success",
    results: reviews.length,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
    data: {
      reviews,
      averageRating: course.rating,
      ratingsCount: course.ratingsCount,
    },
  });
};

export const getMyReview = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const courseId = getRouteParam(req.params.courseId);
  toObjectId(courseId, "course id");

  const review = await Review.findOne({
    course: courseId,
    student: req.user._id,
  })
    .populate("student", "name email")
    .lean();

  if (!review) {
    throw new ApiError("Review not found", 404);
  }

  res.status(200).json({ status: "success", data: { review } });
};

export const deleteReview = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }

  const reviewId = getRouteParam(req.params.reviewId);
  toObjectId(reviewId, "review id");

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError("Review not found", 404);
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = review.student.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    throw new ApiError("You can only delete your own reviews", 403);
  }

  const courseId = review.course.toString();
  await Review.deleteOne({ _id: review._id });
  await recalculateCourseRating(courseId);

  res
    .status(200)
    .json({ status: "success", message: "Review deleted successfully" });
};
