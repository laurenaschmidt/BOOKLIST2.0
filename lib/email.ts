import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BookList <onboarding@resend.dev>";

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailError";
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your BookList password",
    html:
      `<p>Someone requested a password reset for your BookList account.</p>` +
      `<p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 1 hour.</p>` +
      `<p>If you didn't request this, you can safely ignore this email.</p>`,
    text:
      `Someone requested a password reset for your BookList account.\n\n` +
      `Reset your password: ${resetUrl}\n\n` +
      `This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
  });

  if (error) {
    throw new EmailError(`Failed to send password reset email: ${error.message}`);
  }
}
