import { ENROLLMENT_STATUSES } from "../constants/index.js";
import type { CourseResponse } from "./course.js";
import type { UserResponse } from "./user.js";

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export interface EnrollmentResponse {
  _id: string;
  student: string | UserResponse;
  course: string | CourseResponse;
  status: EnrollmentStatus;
  price: number;
  discount: number;
  progress: number;
  effectivePrice?: number;
  enrolledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}