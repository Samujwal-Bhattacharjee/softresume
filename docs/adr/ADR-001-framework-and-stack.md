# ADR-001 — Framework, Routing Strategy, and Stack Selection

**Status:** Accepted  
**Date:** 2026-10-20  
**Author:** Lead Engineer (Antigravity build)

---

## Context

SoftCV Studio requires:
- Public SEO-friendly marketing pages (`/`, `/features`, `/templates`, `/help`, `/privacy`, `/terms`)
- Authenticated application routes (`/dashboard`, `/resume/[id]/edit`, `/settings`)
- Server-side AI API endpoints (keys must never reach the browser)
- Server-side PDF/DOCX generation endpoints
- Auth session handling with cookie-based sessions

## Decision

Use **Next.js 14 (App Router)** with **TypeScript (strict mode)**.

### Key stack choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js 14 App Router | Full-stack RSC + route handlers. Single repo for public and app. |
| TypeScript | Strict mode | Catch bugs at compile time; required by spec |
| Styling | Tailwind CSS + shadcn/ui | Utility-first with accessible, unstyled primitive components |
| Runtime validation | Zod | Schema-first; works on client and server; integrates with react-hook-form |
| Forms | React Hook Form + Zod resolvers | Performant, accessible, schema-validated forms |
| Client state | Zustand | Minimal, fast, easy to separate draft from persisted state |
| Auth | Supabase Auth | Managed auth, JWT/cookie sessions, SSR compatible |
| Database | Supabase PostgreSQL | RLS, JSONB, managed, pairs with auth |
| Motion | Framer Motion | Reduced-motion aware, mature ecosystem |

## Alternatives Considered

- **Pages Router:** App Router is the modern standard and supports RSC needed for server-side AI/export without separate API server.
- **Remix:** Comparable but Next.js has broader ecosystem and better Vercel integration.
- **Vanilla React + Express:** More boilerplate; App Router handles API routes cleanly.
- **Vite SPA:** Cannot do SSR for public SEO pages without extra config; no native API routes.

## Consequences

- App Router RSC patterns must be used correctly (server vs. client components).
- Zustand stores for draft state must stay in `'use client'` boundaries.
- Server Actions or Route Handlers for AI/export (never client-side API key exposure).
- Supabase client must distinguish between browser client (anon key only) and server client (service role, server-only).

## Rollback Trigger

If Next.js App Router stability issues emerge during export (e.g., serverless function timeouts for Playwright PDF generation), a separate Node worker process can be extracted behind the existing API interface without changing the product schema or UI.
