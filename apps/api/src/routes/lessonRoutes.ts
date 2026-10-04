import { Router } from "express";
import {
  deleteLesson,
  getLesson,
  markLessonComplete,
  updateLesson,
} from "../controllers/lessonController.js";
import {
  optionalAuth,
  protect,
  restrictTo,
} from "../middlewares/authMiddleware.js";

const router = Router();

// Public / enrolled
router.get("/lessons/:id", optionalAuth, getLesson);

// Student
router.post(
  "/lessons/:id/complete",
  protect,
  restrictTo("student"),
  markLessonComplete,
);

// Instructor / admin
router.patch(
  "/lessons/:id",
  protect,
  restrictTo("instructor", "admin"),
  updateLesson,
);
router.delete(
  "/lessons/:id",
  protect,
  restrictTo("instructor", "admin"),
  deleteLesson,
);

export default router;