import { AuthFooterLink, AuthIntro, ForgotPasswordForm } from "@/features/auth";

export const metadata = {
  title: "Forgot Password | Learnify",
  description: "Reset your Learnify password",
};

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-14 sm:py-20 lg:px-16 xl:px-24">
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
