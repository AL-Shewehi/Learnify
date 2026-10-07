import { Router, type Router as ExpressRouter } from "express";
import {
  createReview,
  deleteReview,
  updateReview,
  getMyReview,
  getReviewsByCourse,
} from "../controllers/reviewController.js";
import {
  optionalAuth,
  protect,
  restrictTo,
} from "../middlewares/authMiddleware.js";

const router: ExpressRouter = Router();

// Public
router.get("/courses/:courseId/reviews", optionalAuth, getReviewsByCourse);

// Authenticated users
router.post("/courses/:courseId/reviews", protect, restrictTo("student"), createReview);
router.get("/courses/:courseId/my-review", protect, restrictTo("student"), getMyReview);
router.patch("/reviews/:reviewId", protect, restrictTo("student"), updateReview);
router.delete("/reviews/:reviewId", protect, restrictTo("student","admin"), deleteReview);

export default router;