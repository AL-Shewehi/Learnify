import Course from "../models/Course";
import ApiError from "./ApiError";
import type { IUser } from "../models/User";

export const ensureCourseOwner = async (courseId: string, user: IUser) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError("Course not found", 404);
    }

    const isOwner = course.instructor.equals(user._id);
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new ApiError("You do not have permission to access this course", 403);
    }

    return course;
}