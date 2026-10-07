import { api } from "@/lib/api";
import {
  AdminStats,
  AdminUser,
  GetUsersQuery,
  PaginatedSuccess,
} from "@learnify/shared";

export interface AdminUsersPage {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export const adminApi = {
  stats: (): Promise<AdminStats> =>
    api
      .get<{ status: "success"; data: AdminStats }>("/admin/stats")
      .then((r) => r.data.data),

  users: (params?: Partial<GetUsersQuery>): Promise<AdminUsersPage> =>
    api
      .get<PaginatedSuccess<{ users: AdminUser[] }>>("/admin/users", {
        params,
      })
      .then((r) => ({
        users: r.data.data.users,
        pagination: r.data.pagination,
      })),

  updateRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }).then((r) => r.data),

  toggleActive: (id: string, isActive: boolean) =>
    api.patch(`/admin/users/${id}/active`, { isActive }).then((r) => r.data),

  remove: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  suspendCourse: (id: string) =>
    api
      .patch(`/courses/${id}/suspend`, {
        reason: "Suspended by administrator",
      })
      .then((r) => r.data),
  activateCourse: (id: string) =>
    api.patch(`/courses/${id}/activate`).then((r) => r.data),
};
