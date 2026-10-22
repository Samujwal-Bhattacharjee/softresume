/**
 * AuthStatusBar — shows cloud mode indicator + sign-out (RS-040)
 *
 * Renders only when cloud mode is active. In local demo mode renders nothing.
 * Used in the dashboard and editor command bars.
 */
"use client";

import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";
import { signOutAction } from "@/app/actions/auth";
import Link from "next/link";

export function AuthStatusBar() {
  const { mode, user, loading } = useStorageAdapter();

  // In demo/local mode or while loading, show nothing
  if (loading || mode === "local") return null;

  return (
    <div className="bg-systems-teal/15 border-b border-systems-teal/30 px-space-sm py-0.5 flex items-center justify-between gap-space-sm">
      <span className="font-micro text-micro text-systems-teal uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-systems-teal animate-pulse" />
        CLOUD MODE — {user?.email ?? "Signed in"}
      </span>
      <div className="flex items-center gap-space-sm">
        <Link
          href="/auth/signup"
          className="font-micro text-micro text-ink-soft hover:text-carbon underline transition-colors hidden sm:block"
        >
          Account
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            id="auth-sign-out"
            className="font-micro text-micro text-error hover:text-error/80 uppercase tracking-widest transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
