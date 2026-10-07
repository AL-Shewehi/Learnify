import { Router, type Router as ExpressRouter } from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  suspendCourse,
  activateCourse,
} from "../controllers/courseController.js";
import {
  optionalAuth,
  protect,
  restrictTo,
} from "../middlewares/authMiddleware.js";
import {
  createLesson,
  getCourseLessons,
  reorderLessons,
} from "../controllers/lessonController.js";
import { checkout } from "../controllers/checkoutController.js";

const router: ExpressRouter = Router();

router.get("/", optionalAuth, getCourses);
router.get("/:id", optionalAuth, getCourse);
router.get("/:courseId/lessons", optionalAuth, getCourseLessons);

router.post(
  "/",
  protect,
  restrictTo("instructor", "admin"),
  createCourse,
);
router.patch(
  "/:id",
  protect,
  restrictTo("instructor", "admin"),
  updateCourse,
);
router.delete(
  "/:id",
  protect,
  restrictTo("instructor", "admin"),
  deleteCourse,
);
router.patch(
  "/:id/publish",
  protect,
  restrictTo("instructor"),
  publishCourse,
);
router.patch(
  "/:id/unpublish",
  protect,
  restrictTo("instructor"),
  unpublishCourse,
);
router.patch("/:id/suspend", protect, restrictTo("admin"), suspendCourse);
router.patch("/:id/activate", protect, restrictTo("admin"), activateCourse);
router.post("/:courseId/checkout", protect, restrictTo("student"), checkout);

router.post(
  "/:courseId/lessons",
  protect,
  restrictTo("instructor", "admin"),
  createLesson,
);
router.patch(
  "/:courseId/lessons/reorder",
  protect,
  restrictTo("instructor", "admin"),
  reorderLessons,
);

export default router;
