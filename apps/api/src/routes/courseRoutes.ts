import { Router } from "express";
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

const router = Router();

router.get("/", optionalAuth, getCourses);
router.get("/:id", optionalAuth, getCourse);
router.get("/:courseId/lessons", optionalAuth, getCourseLessons);

router.use(protect);
router.post("/", restrictTo("instructor", "admin"), createCourse);
router.patch("/:id", restrictTo("instructor", "admin"), updateCourse);
router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);
router.patch("/:id/publish", restrictTo("instructor"), publishCourse);
router.patch("/:id/unpublish", restrictTo("instructor"), unpublishCourse);
router.patch("/:id/suspend", restrictTo("admin"), suspendCourse);
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
