import { Suspense } from "react";
import { LoginForm, AuthIntro, AuthFooterLink } from "@/features/auth";

export const metadata = {
  title: "Login | Learnify",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-20">
      <div className="mx-auto w-full">
        <AuthIntro
          eyebrow="Welcome back"
          title="Log in to continue your learning journey"
          subtitle="Your courses and progress are waiting for you."
        />

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <AuthFooterLink
          question="Don't have an account?"
          href="/signup"
          label="Sign up"
        />
      </div>
    </section>
  );
}