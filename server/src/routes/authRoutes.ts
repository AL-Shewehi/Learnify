// src/routes/authRoutes.ts

import { Router } from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateMe,
  deleteMe,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected
router.get("/me", protect, getMe);
router.patch("/update-me", protect, updateMe);
router.patch("/change-password", protect, changePassword);
router.delete("/delete-me", protect, deleteMe);

export default router;