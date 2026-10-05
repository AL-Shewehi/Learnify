import type { UserResponse } from "./user.js";

export interface AdminUser extends UserResponse {
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    active: number;
    inactive: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    dropped: number;
  };
  revenue: {
    total: number;
    averagePrice: number;
  };
}