"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@learnify/shared";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLogin } from "../hooks/use-login";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { AuthSocialLogin } from "./auth-social-login";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await login.mutateAsync(input);
      router.push(searchParams.get("from") ?? "/");
    } catch {
      // Handle error (e.g., show a notification or log the error)
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <FormField<LoginInput>
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        register={register}
        errors={errors}
        required
      />

      <div className="-mt-2 flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <FormField<LoginInput>
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        register={register}
        errors={errors}
        required
      />

      {login.error && (
        <p className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          Invalid credentials, please try again
        </p>
      )}

      <Button
        type="submit"
        disabled={login.isPending}
        className="h-12 rounded-xl text-base shadow-lg shadow-primary/20"
      >
        {login.isPending ? "Logging in..." : "Continue"}
      </Button>

      <AuthSocialLogin />
    </form>
  );
}
