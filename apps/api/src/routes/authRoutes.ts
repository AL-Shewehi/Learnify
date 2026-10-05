// src/routes/authRoutes.ts

import { Router, type Router as ExpressRouter } from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateMe,
  deleteMe,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router: ExpressRouter = Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", logout);

// Protected
router.get("/me", protect, getMe);
router.patch("/update-me", protect, updateMe);
router.patch("/change-password", protect, changePassword);
router.delete("/delete-me", protect, deleteMe);

export default router;