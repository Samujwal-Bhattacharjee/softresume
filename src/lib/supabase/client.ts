/**
 * Supabase browser client (RS-040)
 *
 * Creates a singleton Supabase client for use in Client Components.
 * Uses @supabase/ssr to handle cookie-based session storage compatible
 * with Next.js App Router Server Components and middleware.
 *
 * Returns null when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are absent — this keeps local-first demo mode working with no config.
 */

import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!_client) {
    _client = createBrowserClient(url, key);
  }
  return _client;
}

/** True only when cloud mode is configured at startup */
export function isCloudModeEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
