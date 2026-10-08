import { Router, type Router as ExpressRouter } from "express";
import {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  getCourseSections,
} from "../controllers/sectionController.js";
import {
  optionalAuth,
  protect,
  restrictTo,
} from "../middlewares/authMiddleware.js";

const router: ExpressRouter = Router();

// Public — unpublished courses 404 for guests (same rules as lessons).
router.get(
  "/courses/:courseId/sections",
  optionalAuth,
  getCourseSections,
);

// Instructor / admin
router.post(
  "/courses/:courseId/sections",
  protect,
  restrictTo("instructor", "admin"),
  createSection,
);
router.patch(
  "/courses/:courseId/sections/reorder",
  protect,
  restrictTo("instructor", "admin"),
  reorderSections,
);
router.patch(
  "/sections/:id",
  protect,
  restrictTo("instructor", "admin"),
  updateSection,
);
router.delete(
  "/sections/:id",
  protect,
  restrictTo("instructor", "admin"),
  deleteSection,
);

export default router;
