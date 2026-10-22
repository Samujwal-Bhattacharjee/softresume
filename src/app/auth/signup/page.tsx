/**
 * Sign-Up Page (RS-040)
 * Nintendo 2001 Console Chrome design identity.
 */
"use client";

import { useActionState, useState } from "react";
import { signUpAction } from "@/app/actions/auth";
import Link from "next/link";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-periwinkle flex items-center justify-center p-space-sm">
      <div className="w-full max-w-md">
        {/* Command bar */}
        <div className="bg-carbon flex items-center gap-space-xs px-space-sm py-space-xs hardware-bevel">
          <span className="w-2 h-2 rounded-full bg-nav-gold" />
          <span className="w-2 h-2 rounded-full bg-systems-teal/60" />
          <span className="font-micro text-micro text-nav-gold uppercase tracking-widest ml-2">
            SoftCV Studio — Create Account
          </span>
        </div>

        <div className="bg-periwinkle-mid hardware-bevel p-space-md">
          <div className="bg-surface hardware-inset p-space-md">
            <h1 className="font-display text-2xl text-carbon uppercase tracking-tight mb-1">
              CREATE ACCOUNT
            </h1>
            <p className="font-hero-tagline text-hero-tagline text-carbon/70 mb-space-md">
              Save your resume cartridges to the cloud.
            </p>

            {/* Success state */}
            {state?.message && (
              <div
                role="status"
                className="bg-systems-teal/20 border border-systems-teal text-systems-teal font-mono text-xs px-space-sm py-space-xs hardware-inset mb-space-sm"
              >
                {state.message}
              </div>
            )}

            <form action={action} className="flex flex-col gap-space-sm">
              {/* General error */}
              {state?.errors?.general && (
                <div
                  role="alert"
                  className="bg-error-surface border border-error text-error font-mono text-xs px-space-sm py-space-xs hardware-inset"
                >
                  {state.errors.general.join(" ")}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="signup-email"
                  className="font-micro text-micro uppercase tracking-wider text-carbon"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="bg-surface hardware-inset px-space-sm py-space-xs font-mono text-sm text-carbon placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-nav-gold w-full"
                  aria-describedby={
                    state?.errors?.email ? "signup-email-error" : undefined
                  }
                  aria-invalid={Boolean(state?.errors?.email)}
                />
                {state?.errors?.email && (
                  <span
                    id="signup-email-error"
                    role="alert"
                    className="text-error font-mono text-xs"
                  >
                    {state.errors.email.join(". ")}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="signup-password"
                  className="font-micro text-micro uppercase tracking-wider text-carbon"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Min 8 characters"
                    className="bg-surface hardware-inset px-space-sm py-space-xs pr-16 font-mono text-sm text-carbon placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-nav-gold w-full"
                    aria-describedby={
                      state?.errors?.password
                        ? "signup-password-error"
                        : "signup-password-hint"
                    }
                    aria-invalid={Boolean(state?.errors?.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-carbon font-micro text-micro uppercase tracking-wider px-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {state?.errors?.password ? (
                  <span
                    id="signup-password-error"
                    role="alert"
                    className="text-error font-mono text-xs"
                  >
                    {state.errors.password.join(". ")}
                  </span>
                ) : (
                  <span
                    id="signup-password-hint"
                    className="text-ink-soft font-mono text-xs"
                  >
                    At least 8 characters
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                id="signup-submit"
                className="bg-carbon hover:bg-nav-gold text-nav-gold hover:text-carbon font-bold font-nav-link text-nav-link uppercase px-space-lg py-space-sm hardware-bevel transition-colors disabled:opacity-60 disabled:cursor-wait w-full mt-2"
              >
                {pending ? "CREATING ACCOUNT…" : "CREATE ACCOUNT →"}
              </button>

              {/* Sign-in link */}
              <div className="text-center font-micro text-micro text-ink-soft mt-2">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-carbon hover:text-nav-gold underline transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>

            {/* Local-first note */}
            <div className="border-t border-ink-soft/20 mt-space-md pt-space-sm">
              <p className="font-micro text-micro text-ink-soft">
                No account needed for local use.{" "}
                <Link
                  href="/dashboard"
                  className="text-carbon hover:text-nav-gold underline transition-colors"
                >
                  Continue in Demo Mode
                </Link>{" "}
                — data stays in your browser only.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-carbon px-space-sm py-space-xs text-center">
          <span className="font-micro text-micro text-ink-soft/60 uppercase tracking-widest">
            SoftCV Studio © 2025
          </span>
        </div>
      </div>
    </div>
  );
}
