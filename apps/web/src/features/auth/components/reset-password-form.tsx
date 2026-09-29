"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@learnify/shared";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "../hooks/use-reset-password";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword(token);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await resetPassword.mutateAsync(input);
    } catch {
      // The mutation state provides a generic message for expired tokens.
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      {resetPassword.isError ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-600">
          This reset link is invalid or has expired. Please request a new one.
        </p>
      ) : null}

      {resetPassword.isSuccess ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
          Your password has been reset successfully. You can now log in with
          your new password.
        </p>
      ) : null}

      <FormField<ResetPasswordInput>
        name="password"
        label="New password"
        type="password"
        placeholder="••••••••"
        register={register}
        errors={errors}
        required
      />

      <FormField<ResetPasswordInput>
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        placeholder="••••••••"
        register={register}
        errors={errors}
        required
      />

      <Button
        type="submit"
        disabled={resetPassword.isPending || resetPassword.isSuccess}
        className="h-12 rounded-xl text-base shadow-lg shadow-primary/20"
      >
        {resetPassword.isPending ? "Updating..." : "Reset password"}
      </Button>
    </form>
  );
}
