import { SignupForm, AuthIntro, AuthFooterLink } from "@/features/auth";

export const metadata = {
  title: "Sign Up | Learnify",
  description: "Create your Learnify account",
};

export default function SignupPage() {
  return (
    <section className="mx-auto w-full max-w-2xl py-16 sm:py-20">
      <div className="mx-auto w-full">
        <AuthIntro
          eyebrow="Get started"
          title="Create your account and start learning today"
          subtitle="Join thousands of learners building new skills every day."
        />

        <SignupForm />

        <AuthFooterLink
          question="Already have an account?"
          href="/login"
          label="Log in"
        />
      </div>
    </section>
  );
}