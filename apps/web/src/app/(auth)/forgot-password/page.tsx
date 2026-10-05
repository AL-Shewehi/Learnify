import { AuthFooterLink, AuthIntro, ForgotPasswordForm } from "@/features/auth";

export const metadata = {
  title: "Forgot Password | Learnify",
  description: "Reset your Learnify password",
};

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-20">
      <div className="mx-auto w-full">
        <AuthIntro
          eyebrow="Need a reset?"
          title="Get back to learning"
          subtitle="Enter your email and we will send you a secure link to reset your password."
        />

        <ForgotPasswordForm />

        <AuthFooterLink
          question="Remember your password?"
          href="/login"
          label="Log in"
        />
      </div>
    </section>
  );
}
