/**
 * Supabase server client (RS-040)
 *
 * Creates a per-request Supabase client for use in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * Uses @supabase/ssr cookie helpers to read/write session tokens from
 * the Next.js request/response cookies without requiring a custom JWT.
 *
 * Returns null when Supabase is not configured (local-first demo mode).
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component context — cookie writes are ignored (middleware handles refresh)
        }
      },
    },
  });
}

/**
 * Service-role client for trusted server operations (e.g. RLS bypass in migrations).
 * NEVER expose this to the browser. Only call from server-only files.
 */
export async function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  // Dynamically import to ensure this is never bundled into client code
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
