import { Request, Response } from "express";
import crypto from "crypto";
import { checkoutSchema } from "@learnify/shared";
import ApiError from "../utils/ApiError";
import { getRouteParam } from "../utils/getRouteParam";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";

export const checkout = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("User not authenticated", 401);
  }
  if (req.user.role !== "student") {
    throw new ApiError("Only students can checkout courses", 403);
  }

  const courseId = getRouteParam(req.params.courseId);

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const [mm, yy] = parsed.data.expirationDate.split("/").map((s) => parseInt(s.trim(), 10));
  if (Number.isNaN(mm) || Number.isNaN(yy) || mm < 1 || mm > 12) {
    throw new ApiError("Invalid expiration date format (MM/YY)", 400);
  }
  const cardExpirationDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
  if (cardExpirationDate < new Date()) {
    throw new ApiError("Card has expired", 400);
  }

  const course = await Course.findById(courseId);
  if (!course || course.status !== "published") {
    throw new ApiError("Course not found", 404);
  }
  if (course.price === 0) {
    throw new ApiError("This course is free — enroll directly", 400);
  }
  if (await Enrollment.isEnrolled(req.user._id, courseId)) {
    throw new ApiError("You are already enrolled in this course", 409);
  }

  const receipt = {
    id: `mock-receipt-${crypto.randomBytes(8).toString("hex")}`,
    amount: course.price,
    status: "succeeded" as const,
    paidAt: new Date().toISOString(),
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    price: course.price,
    discount: 0,
    status: "active"
  });

  await Course.updateOne({ _id: course._id }, { $inc: { totalStudents: 1 } });

  res.status(201).json({
    status: "success",
    data: {
      enrollment,
      receipt,
    },
  });
};
