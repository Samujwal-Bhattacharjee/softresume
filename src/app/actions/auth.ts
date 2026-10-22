/**
 * Auth Server Actions (RS-040)
 *
 * Sign-up, sign-in (email/password) and sign-out actions for the
 * SoftCV Studio Supabase cloud mode.
 *
 * These run exclusively on the server — credentials never touch client JS.
 * Validation uses Zod to match the project's existing schema patterns.
 */
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// ─── Shared form schemas ────────────────────────────────────────────────────

const EmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(320, "Email is too long")
  .trim()
  .toLowerCase();

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

const SignInSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

// ─── Action result types ────────────────────────────────────────────────────

export type AuthActionResult = {
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
  message?: string;
};

// ─── Sign-up ────────────────────────────────────────────────────────────────

export async function signUpAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      errors: { general: ["Cloud mode is not configured. Using local-first demo mode."] },
    };
  }

  const validated = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // Do not expose raw Supabase error messages to the user in production
    const safeMessage =
      error.message?.includes("already registered") ||
      error.message?.includes("User already registered")
        ? "An account with that email already exists. Try signing in."
        : "Sign-up failed. Check your details and try again.";
    return { errors: { general: [safeMessage] } };
  }

  return {
    message:
      "Account created! Check your email for a confirmation link before signing in.",
  };
}

// ─── Sign-in ────────────────────────────────────────────────────────────────

export async function signInAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      errors: { general: ["Cloud mode is not configured. Using local-first demo mode."] },
    };
  }

  const redirectTo = (formData.get("redirectTo") as string | null) ?? "/dashboard";

  const validated = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      errors: {
        general: [
          "Incorrect email or password. Check your credentials and try again.",
        ],
      },
    };
  }

  redirect(redirectTo);
}

// ─── Sign-out ────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
