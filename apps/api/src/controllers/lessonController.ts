import { Request, Response } from "express";
import Lesson from "../models/Lesson";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import ApiError from "../utils/ApiError";
import { getRouteParam } from "../utils/getRouteParam";
import { ensureCourseOwner } from "../utils/ensureCourseAccess";
import {
  createLessonSchema,
  reorderLessonsSchema,
  updateLessonSchema,
} from "@learnify/shared";

// ============ Instructor: CRUD ============
export const createLesson = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const courseId = getRouteParam(req.params.courseId);
  await ensureCourseOwner(courseId, req.user);

  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const order = await Lesson.nextOrder(courseId);
  const lesson = await Lesson.create({
    ...parsed.data,
    course: courseId,
    order,
  });
  res.status(201).json({ status: "success", data: { lesson } });
};

export const updateLesson = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const id = getRouteParam(req.params.id);
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new ApiError("Lesson not found", 404);

  await ensureCourseOwner(lesson.course.toString(), req.user);

  const parsed = updateLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const update = {
    ...parsed.data,
    ...(parsed.data.type === "video" ? { articleBody: undefined } : {}),
    ...(parsed.data.type === "article" ? { videoUrl: undefined } : {}),
  };
  lesson.set(update);
  await lesson.save();
  res.status(200).json({ status: "success", data: { lesson } });
};

export const deleteLesson = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const id = getRouteParam(req.params.id);
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new ApiError("Lesson not found", 404);

  await ensureCourseOwner(lesson.course.toString(), req.user);

  const title = lesson.title;
  const courseId = lesson.course;
  await lesson.deleteOne();

  await Enrollment.updateMany(
    { course: courseId },
    { $pull: { completedLessons: lesson._id } },
  );

  // Update progress for all enrollments in this course
  const totalLessons = await Lesson.countDocuments({ course: courseId });
  if (totalLessons > 0) {
    const enrollments = await Enrollment.find({
      course: courseId,
      status: { $in: ["active", "completed"] },
    })
      .select("completedLessons status progress")
      .lean();

    if (enrollments.length > 0) {
      const ops = enrollments.map((e) => {
        const done = Array.isArray(e.completedLessons)
          ? e.completedLessons.length
          : 0;
        const progress =
          totalLessons === 0
            ? 0
            : Math.min(100, Math.round((done / totalLessons) * 100));
        const status: "active" | "completed" =
          progress === 100
            ? "completed"
            : e.status === "completed"
              ? "active"
              : (e.status as "active" | "completed");
        return {
          updateOne: {
            filter: { _id: e._id },
            update: {
              $set: { progress, status },
              ...(progress === 100 ? {} : { $unset: { completedAt: 1 } }),
            },
          },
        };
      });
      if (ops.length > 0) await Enrollment.bulkWrite(ops as never);
    }
  } else {
    // If there are no lessons left in the course, reset progress and status for all enrollments
    await Enrollment.updateMany(
      { course: courseId },
      { $set: { progress: 0, status: "active" } },
    );
  }

  res.status(200).json({
    status: "success",
    message: `Lesson "${title}" deleted successfully`,
  });
};

export const reorderLessons = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const courseId = getRouteParam(req.params.courseId);
  await ensureCourseOwner(courseId, req.user);

  const parsed = reorderLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const ids = parsed.data.lessonIds;

  const total = await Lesson.countDocuments({ course: courseId });

  if (total !== ids.length) {
    throw new ApiError("Reorder must include every lesson exactly once", 400);
  }

  const belong = await Lesson.countDocuments({
    course: courseId,
    _id: { $in: ids },
  });

  if (belong !== ids.length) {
    throw new ApiError("One or more lessons do not belong to this course", 400);
  }

  await Lesson.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    })),
  );

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
  res.status(200).json({ status: "success", data: { lessons } });
};

// ============ Students / Public: reading ============

export const getCourseLessons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const courseId = getRouteParam(req.params.courseId);

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  const isOwner =
    !!req.user && course.instructor.toString() === req.user._id.toString();

  const isAdmin = !!req.user && req.user.role === "admin";

  if (course.status !== "published" && !isOwner && !isAdmin) {
    throw new ApiError("Course not found", 404);
  }

  let hasAccess = isOwner || isAdmin;

  if (!hasAccess && req.user) {
    hasAccess = await Enrollment.isEnrolled(req.user._id, courseId);
  }

  const lessons = await Lesson.find({ course: courseId })
    .sort({ order: 1 })
    .select("title description order duration isPreview type videoUrl articleBody")
    .lean();

  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);

  const payload = hasAccess
    ? lessons
    : lessons.map((l) =>
        l.isPreview
          ? l
          : {
              _id: l._id,
              title: l.title,
              description: l.description,
              order: l.order,
              duration: l.duration,
              isPreview: false,
              type: l.type,
              locked: true,
            },
      );

  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: { lessons: payload, totalDuration, hasAccess },
  });
};

export const getLesson = async (req: Request, res: Response): Promise<void> => {
  const id = getRouteParam(req.params.id);
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new ApiError("Lesson not found", 404);

  const course = await Course.findById(lesson.course);
  if (!course) throw new ApiError("Course not found", 404);

  const isOwner =
    !!req.user && course.instructor.toString() === req.user._id.toString();

  const isAdmin = !!req.user && req.user.role === "admin";

  if (course.status !== "published" && !isOwner && !isAdmin) {
    throw new ApiError("Lesson not found", 404);
  }

  let hasAccess =
    isOwner || isAdmin || (lesson.isPreview && course.status === "published");

  if (!hasAccess && req.user) {
    hasAccess = await Enrollment.isEnrolled(req.user._id, course._id);
  }

  if (!hasAccess) {
    throw new ApiError("Enroll in this course to access this lesson", 403);
  }

  res.status(200).json({
    status: "success",
    data: { lesson },
  });
};

// ============ Student: progress ============

export const markLessonComplete = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) throw new ApiError("User not authenticated", 401);

  const id = getRouteParam(req.params.id);
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new ApiError("Lesson not found", 404);

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: lesson.course,
    status: { $in: ["active", "completed"] },
  });

  if (!enrollment) {
    throw new ApiError("You are not enrolled in this course", 403);
  }

  const updated = await enrollment.markLessonComplete(lesson._id);

  res.status(200).json({
    status: "success",
    data: {
      progress: updated.progress,
      status: updated.status,
      completedLessons: updated.completedLessons.map((l) => l.toString()),
    },
  });
};
