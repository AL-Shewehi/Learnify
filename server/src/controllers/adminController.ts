import { Request, Response } from "express";
import { z } from "zod";
import User, { type UserRole } from "../models/User";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import ApiError from "../utils/ApiError";
import { getRouteParam } from "../utils/getRouteParam";

// ============ Schemas ============
const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["student", "instructor", "admin"]).optional(),
  search: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
});

const updateUserRoleSchema = z
  .object({
    role: z.enum(["student", "instructor", "admin"]),
  })
  .strict();

const toggleUserActiveSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

// ============ Controllers ============

export const getStats = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError("Unauthorized", 403);
  }

  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    activeUsers,
    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isActive: true }),
    Course.countDocuments(),
    Course.countDocuments({ status: "published" }),
    Course.countDocuments({ status: "draft" }),
    Course.countDocuments({ status: "archived" }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: "active" }),
    Enrollment.countDocuments({ status: "completed" }),
  ]);

  const revenueResult = await Enrollment.aggregate([
    {
      $match: {
        status: { $in: ["active", "completed"] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$price" },
        averagePrice: { $avg: "$price" },
      },
    },
  ]);

  const revenue = revenueResult[0]?.totalRevenue ?? 0;
  const averagePrice = revenueResult[0]?.averagePrice ?? 0;

  res.status(200).json({
    status: "success",
    data: {
      users: {
        total: totalUsers,
        students: totalStudents,
        instructors: totalInstructors,
        admins: totalAdmins,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
        archived: archivedCourses,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        dropped: totalEnrollments - activeEnrollments - completedEnrollments,
      },
      revenue: {
        total: Math.round(revenue * 100) / 100,
        averagePrice: Math.round(averagePrice * 100) / 100,
      },
    },
  });
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError("Unauthorized", 403);
  }

  const parsed = getUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const { page, limit, role, search, isActive } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: {
      users,
    },
  });
};

export const updateUserRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError("Unauthorized", 403);
  }

  const userId = getRouteParam(req.params.id);

  const parsed = updateUserRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0].message, 400);
  }

  const { role } = parsed.data;

  if (userId === req.user._id.toString()) {
    throw new ApiError("You cannot change your own role", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (role === "admin" && req.user.role !== "admin") {
    throw new ApiError("Only admins can promote users to admin", 403);
  }

  const oldRole = user.role;

  if (oldRole === role) {
    throw new ApiError(`User already has the role ${role}`, 400);
  }

  user.role = role as UserRole;
  await user.save();

  res.status(200).json({
    status: "success",
    message: `User role changed from ${oldRole} to ${role} successfully`,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });
};


export const toggleUserActive = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
        throw new ApiError("Unauthorized", 403);
    }

    const userId = getRouteParam(req.params.id);

    const parsed = toggleUserActiveSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0].message, 400);
    }

    const { isActive } = parsed.data;

    if (userId === req.user._id.toString()) {
        throw new ApiError("You cannot change your own active status", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
    status: "success",
    message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });
}


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
        throw new ApiError("Unauthorized", 403);
    }

    const userId = getRouteParam(req.params.id);

    if (userId === req.user._id.toString()) {
        throw new ApiError("You cannot delete your own account", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }

    const userName = user.name;
    user.isActive = false; // Deactivate the user instead of deleting
    await user.save();

    res.status(200).json({
        status: "success",
        message: `User ${userName} has been deactivated successfully`,
    });
}