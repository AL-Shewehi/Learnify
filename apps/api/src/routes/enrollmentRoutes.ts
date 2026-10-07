import { Router, type Router as ExpressRouter } from "express";
import {
  createEnrollment,
  getMyEnrollments,
  getCourseEnrollments,
  updateProgress,
} from "../controllers/enrollmentController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router: ExpressRouter = Router();

router.post(
  "/courses/:courseId/enroll",
  protect,
  restrictTo("student"),
  createEnrollment,
);
router.get(
  "/enrollments/me",
  protect,
  restrictTo("student"),
  getMyEnrollments,
);
router.get(
  "/courses/:courseId/enrollments",
  protect,
  restrictTo("instructor", "admin"),
  getCourseEnrollments,
);
router.patch(
  "/courses/:courseId/progress",
  protect,
  restrictTo("student"),
  updateProgress,
);

export default router;
