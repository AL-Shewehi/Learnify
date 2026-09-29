"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput, USER_ROLES } from "@learnify/shared";
import { useRouter } from "next/navigation";
import { useSignup } from "../hooks/use-signup";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { AuthSocialLogin } from "./auth-social-login";

const roleOptions = USER_ROLES.filter((r) => r !== "admin").map((role) => ({
  value: role,
  label: role.charAt(0).toUpperCase() + role.slice(1),
}));

export function SignupForm() {
  const router = useRouter();
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "student" },
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await signup.mutateAsync(input);
      router.push("/");
    } catch {
      // Handle error (e.g., show a notification or log the error)
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 w-full max-w-md">
      <FormField<SignupInput>
        name="name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        register={register}
        errors={errors}
        required
      />

      <FormField<SignupInput>
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        register={register}
        errors={errors}
        required
      />

      <FormField<SignupInput>
        name="password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        register={register}
        errors={errors}
        required
      />

      <FormField<SignupInput>
        name="role"
        label="I want to"
        type="select"
        control={control}
        options={roleOptions}
        register={register}
        errors={errors}
      />

      {signup.error && (
        <p className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          Email already in use or invalid data, please try again
        </p>
      )}

      <Button type="submit" disabled={signup.isPending}>
        {signup.isPending ? "Creating account..." : "Create Account"}
      </Button>

      <AuthSocialLogin />
    </form>
  );
}
