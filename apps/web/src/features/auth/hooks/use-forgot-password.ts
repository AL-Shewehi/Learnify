"use client";

import { useMutation } from "@tanstack/react-query";
import type { ForgotPasswordInput } from "@learnify/shared";
import { authApi } from "../api/auth-api";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input),
  });
}
