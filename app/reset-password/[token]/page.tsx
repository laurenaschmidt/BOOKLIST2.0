import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-1 text-sm text-ink-muted">Enter and confirm your new password.</p>
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
