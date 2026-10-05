"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth-store";
import { authApi } from "../api/auth-api";
import type { UpdateMeInput, ChangePasswordInput } from "@learnify/shared";

export function useUpdateMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: UpdateMeInput) => authApi.updateMe(input),
    onSuccess: (user) => {
      setUser(user);
      toast.success("Profile updated successfully");
    },
    onError: (e) => toast.error(msg(e)),
  });
}

export const useChangePassword = () => {
  const logout = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),
    onSuccess: () => {
      toast.success("Password changed successfully. Please log in again.");
      logout(null);
      window.location.href = "/login";
    },
    onError: (e) => toast.error(msg(e)),
  });
};

export const useDeleteMe = () => {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: () => authApi.deleteMe(),
    onSuccess: () => {
      toast.success("Account deleted successfully.");
      setUser(null);
      window.location.href = "/";
    },
    onError: (e) => toast.error(msg(e)),
  });
};

const msg = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "Something went wrong";
