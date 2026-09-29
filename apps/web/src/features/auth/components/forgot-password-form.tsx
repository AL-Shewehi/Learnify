"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@learnify/shared";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "../hooks/use-forgot-password";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await forgotPassword.mutateAsync(input);
    } catch {
      // Keep the response generic so accounts cannot be discovered.
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      {forgotPassword.isSuccess ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
          If an account exists with this email, a reset link has been sent.
          Please check your inbox.
        </p>
      ) : null}

      {forgotPassword.isError ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          We could not send the reset link. Please try again.
        </p>
      ) : null}

      <FormField<ForgotPasswordInput>
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        register={register}
        errors={errors}
        required
      />

      <Button
        type="submit"
        disabled={forgotPassword.isPending}
        className="h-12 rounded-xl text-base shadow-lg shadow-primary/20"
      >
        {forgotPassword.isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
