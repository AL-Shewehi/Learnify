import { Router } from "express";
import {
  getStats,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/active", toggleUserActive);
router.delete("/users/:id", deleteUser);

export default router;