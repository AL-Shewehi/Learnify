import { AuthFooterLink, AuthIntro, ResetPasswordForm } from "@/features/auth";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: "Reset Password | Learnify",
  description: "Set a new password for your Learnify account",
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-20">
      <div className="mx-auto w-full">
        <AuthIntro
          eyebrow="Create a new password"
          title="Choose a password you will remember"
          subtitle="Use at least 8 characters to keep your Learnify account secure."
        />

        <ResetPasswordForm token={token} />

        <AuthFooterLink
          question="Need another reset link?"
          href="/forgot-password"
          label="Try again"
        />
      </div>
    </section>
  );
}
