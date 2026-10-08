import { Request, Response } from "express";
import { Types } from "mongoose";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import ApiError from "../utils/ApiError.js";
import { getRouteParam } from "../utils/getRouteParam.js";
import { ensureCourseOwner } from "../utils/ensureCourseAccess.js";
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from "@learnify/shared";

const toObjectId = (id: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${label}`, 400);
  }
  return new Types.ObjectId(id);
};

// ============ Instructor: CRUD ============

export const createSection = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const courseId = getRouteParam(req.params.courseId);
  await ensureCourseOwner(courseId, req.user);

  const parsed = createSectionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const order = await Section.nextOrder(courseId);
  const section = await Section.create({
    ...parsed.data,
    course: courseId,
    order,
  });

  res.status(201).json({ status: "success", data: { section } });
};

export const updateSection = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const id = getRouteParam(req.params.id);
  toObjectId(id, "section id");

  const section = await Section.findById(id);
  if (!section) throw new ApiError("Section not found", 404);

  await ensureCourseOwner(section.course.toString(), req.user);

  const parsed = updateSectionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  section.set(parsed.data);
  await section.save();

  res.status(200).json({ status: "success", data: { section } });
};

export const deleteSection = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const id = getRouteParam(req.params.id);
  toObjectId(id, "section id");

  const section = await Section.findById(id);
  if (!section) throw new ApiError("Section not found", 404);

  await ensureCourseOwner(section.course.toString(), req.user);

  const title = section.title;

  // Lessons survive: they fall back to unsectioned, never deleted.
  await Lesson.updateMany(
    { course: section.course, section: section._id },
    { $set: { section: null } },
  );
  await section.deleteOne();

  res.status(200).json({
    status: "success",
    message: `Section "${title}" deleted successfully`,
  });
};

export const reorderSections = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const courseId = getRouteParam(req.params.courseId);
  await ensureCourseOwner(courseId, req.user);

  const parsed = reorderSectionsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const ids = parsed.data.sectionIds;

  const total = await Section.countDocuments({ course: courseId });

  if (total !== ids.length) {
    throw new ApiError(
      "Reorder must include every section exactly once",
      400,
    );
  }

  const belong = await Section.countDocuments({
    course: courseId,
    _id: { $in: ids },
  });

  if (belong !== ids.length) {
    throw new ApiError(
      "One or more sections do not belong to this course",
      400,
    );
  }

  await Section.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: -(index + 1) } },
      },
    })),
  );
  await Section.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    })),
  );

  const sections = await Section.find({ course: courseId }).sort({ order: 1 });
  res.status(200).json({ status: "success", data: { sections } });
};

// ============ Reading (grouped curriculum) ============

export const getCourseSections = async (req: Request, res: Response) => {
  const courseId = getRouteParam(req.params.courseId);
  toObjectId(courseId, "course id");

  // Same visibility rules as lessons: unpublished courses 404 for guests.
  const course = await Course.findById(courseId).select("status instructor");
  if (!course) throw new ApiError("Course not found", 404);

  const isOwner =
    !!req.user && course.instructor.toString() === req.user._id.toString();
  const isAdmin = !!req.user && req.user.role === "admin";

  if (course.status !== "published" && !isOwner && !isAdmin) {
    throw new ApiError("Course not found", 404);
  }

  const sections = await Section.find({ course: courseId })
    .sort({ order: 1 })
    .lean();

  res.status(200).json({
    status: "success",
    results: sections.length,
    data: { sections },
  });
};
