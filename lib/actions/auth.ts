"use server";

import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";

export type AuthActionState = { error?: string; success?: string } | undefined;

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const GENERIC_RESET_MESSAGE =
  "If an account exists for that email, we've sent a password reset link.";

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/library";

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/library" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created — please log in." };
    }
    throw error;
  }
}

// redirect: false — a soft client-side transition leaves prefetch requests
// from the previous page in flight, and their responses can re-issue a
// valid session cookie moments after this one clears it. A hard navigation
// (done by the caller) actually aborts those in-flight requests.
export async function logoutAction() {
  await signOut({ redirect: false });
}

// No rate limiting exists in this app yet — this endpoint is unthrottled.
// Acceptable for a small, personal-scale deployment; the generic response
// below already prevents it from being used to enumerate accounts.
export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const host = (await headers()).get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  // Always return the same message whether or not the account exists,
  // so this can't be used to check which emails are registered.
  return { success: GENERIC_RESET_MESSAGE };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawToken = formData.get("token");
  if (typeof rawToken !== "string" || !rawToken) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (
    !resetToken ||
    resetToken.usedAt !== null ||
    resetToken.expiresAt.getTime() < Date.now()
  ) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=success");
}
