import { Router, type Router as ExpressRouter } from "express";
import {
  createEnrollment,
  getMyEnrollments,
  getCourseEnrollments,
  updateProgress,
} from "../controllers/enrollmentController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router: ExpressRouter = Router();

router.use(protect);

router.post("/courses/:courseId/enroll", restrictTo("student"), createEnrollment);
router.get("/enrollments/me", restrictTo("student"), getMyEnrollments);
router.get("/courses/:courseId/enrollments", restrictTo("instructor", "admin"), getCourseEnrollments);
router.patch("/courses/:courseId/progress",restrictTo("student"),updateProgress);

export default router;