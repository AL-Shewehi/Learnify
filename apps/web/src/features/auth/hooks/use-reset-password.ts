"use client";

import { useMutation } from "@tanstack/react-query";
import type { ResetPasswordInput } from "@learnify/shared";
import { authApi } from "../api/auth-api";

export function useResetPassword(token: string) {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      authApi.resetPassword(token, input),
  });
}
