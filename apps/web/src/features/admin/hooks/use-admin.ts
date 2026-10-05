"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GetUsersQuery } from "@learnify/shared";
import { adminApi } from "../api/admin-api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
    staleTime: 30_000,
  });
}

export function useAdminUsers(params?: Partial<GetUsersQuery>) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminApi.users(params),
  });
}

export function useAdminActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const onError = (err: unknown) => {
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Action failed",
    );
  };

  return {
    updateRole: useMutation({
        mutationFn: ({id, role}: {id: string, role: string}) => adminApi.updateRole(id, role),
        onSuccess: (r: {message?: string}) => {
            invalidate();
            toast.success(r.message ?? "Role updated");
        },
        onError,
    }),

    toggleActive: useMutation({
        mutationFn: ({id, isActive}: {id: string, isActive: boolean}) => adminApi.toggleActive(id, isActive),
        onSuccess: (r: {message?: string}) => {
            invalidate();
            toast.success(r.message ?? "User status updated");
        },
        onError,
    }),

    remove: useMutation({
        mutationFn: (id: string) => adminApi.remove(id),
        onSuccess: (r: {message?: string}) => {
            invalidate();
            toast.success(r.message ?? "User removed");
        },
        onError,
    }),

    suspendCourse: useMutation({
        mutationFn: (id: string) => adminApi.suspendCourse(id),
        onSuccess: (r: {message?: string}) => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success(r.message ?? "Course suspended");
        },
        onError,
    }),

    activateCourse: useMutation({
        mutationFn: (id: string) => adminApi.activateCourse(id),
        onSuccess: (r: {message?: string}) => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success(r.message ?? "Course activated");
        },
        onError,
    }),
  }
}
