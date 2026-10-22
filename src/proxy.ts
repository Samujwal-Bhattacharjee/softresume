/**
 * Next.js Request Proxy — Session Refresh & Route Protection (RS-040)
 *
 * Migrated to Next.js 16 `proxy.ts` convention from deprecated `middleware.ts`.
 * Runs in Node.js runtime before requests complete.
 *
 * Intercepts requests to refresh the Supabase session token stored in
 * cookies, ensuring Server Components always receive an up-to-date session.
 *
 * When Supabase is not configured (demo/local-first mode), the proxy
 * is a transparent passthrough with no auth checks.
 *
 * Protected routes (/dashboard, /resume/*) redirect unauthenticated users
 * to /auth/login ONLY when cloud mode is active. Local-first mode always
 * grants access because there is no user account concept.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that require an active session in cloud mode */
const PROTECTED_PREFIXES = ["/dashboard", "/resume"];
/** Routes that should redirect logged-in users away from (e.g. auth pages) */
const AUTH_PREFIXES = ["/auth"];

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Local-first demo mode: no Supabase configured → transparent passthrough
  if (!url || !key) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Mirror cookies into the request (for downstream Server Components)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Rebuild the response so cookies are forwarded to the browser
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — must be called before reading user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAuthPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
