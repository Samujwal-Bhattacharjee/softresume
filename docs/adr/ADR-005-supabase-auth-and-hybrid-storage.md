# ADR-005: Supabase Authentication, Dual-Mode Storage Adapter & Cloud Migration

## Status
Accepted

## Date
2026-10-22

## Context
In previous sprints (01–06), SoftCV Studio operated strictly in a local-first architecture using the browser's `localStorage` (documented in [ADR-004](file:///c:/Users/Samujwal/OneDrive/Desktop/resumebuilder/docs/adr/ADR-004-local-first-data-controls-and-deletion.md)). While this provided immediate privacy and zero external server dependencies, users require cross-device persistence, authenticated account security, and cloud backups while preserving the local demo mode for unauthenticated users.

The requirements for cloud integration:
1. **Zero Compromise on Local-First**: Unauthenticated users and environments without Supabase credentials must continue running in standalone "Demo Mode" with full features (templates, ATS checks, PDF/DOCX exports, local JSON backups).
2. **Postgres Row-Level Security (RLS)**: Cloud persistence must enforce multi-tenant authorization at the database engine level so that cross-user access attempts are impossible even if client-side IDs are manipulated.
3. **Defense-in-Depth**: Application adapter layer must execute redundant `user_id` ownership assertions over RLS to prevent unauthorized reads/writes if policies are ever misconfigured.
4. **Idempotent, User-Controlled Migration**: Existing local resumes must never be silently or automatically uploaded. Moving local content to cloud must be an explicit, reviewable, idempotent workflow that validates records against the canonical Zod schema and preserves local copies until explicitly purged by the user.

## Decision

### 1. Official `@supabase/ssr` Package & Cookie-Based Sessions
We adopt `@supabase/ssr` and `@supabase/supabase-js`. Session tokens are managed in HTTP-only cookies synchronized between Next.js App Router server components, Server Actions (`src/app/actions/auth.ts`), middleware (`src/middleware.ts`), and client components.
- In Demo Mode (no environment variables), middleware is a transparent no-op and the client returns a local fallback.
- In Cloud Mode, protected routes (`/dashboard`, `/resume/*`) require an active session or redirect to `/auth/login`.

### 2. Dual Persistence Adapter Layer (`useStorageAdapter`)
We maintain a unified persistence interface implemented by both:
- `localAdapter`: Synchronous browser `localStorage` adapter with debounced saving, tombstone deletion guards, and JSON archive export.
- `createSupabaseAdapter(supabase, userId)`: Asynchronous Supabase cloud adapter querying Postgres tables `resumes` and `job_targets` with automatic Zod validation and ownership checks.
- The `useStorageAdapter()` React hook resolves the active session and transparently provides the appropriate adapter to dashboard and editor components.

### 3. Database Schema & RLS Policies
Repeatable migration `docs/supabase/migrations/001_initial.sql` defines:
- `resumes`: `id UUID PRIMARY KEY`, `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`, `title TEXT`, `template_id TEXT`, `is_master BOOLEAN`, `parent_resume_id UUID`, `document JSONB`, `updated_at TIMESTAMPTZ`.
- `job_targets`: `id UUID PRIMARY KEY`, `resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE`, `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`, `data JSONB`, `updated_at TIMESTAMPTZ`.
- Least-privilege RLS policies:
  - `SELECT`: `USING (auth.uid() = user_id)`
  - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
  - `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
  - `DELETE`: `USING (auth.uid() = user_id)`

### 4. Controlled Local-to-Cloud Migration
`src/lib/resume/cloud-migration.ts` implements:
- Pre-flight planning filtering out synthetic demo fixtures (Priya Mehta / Rohan Kapoor) by default.
- Zod schema validation before transmission; malformed rows are quarantined.
- Duplicate detection by cartridge title to ensure retrying after network errors is idempotent.
- Strict non-deletion of local records during upload; local records remain until the user explicitly triggers post-migration cleanup via `CloudMigrationDialog`.

## Consequences
- **Positive**: Complete data isolation across accounts, verifiable by automated unit tests and SQL schema; zero data leakage risks for offline users.
- **Positive**: Zero vendor lock-in; users can export local or cloud JSON backups at any time.
- **Trade-off**: Requires database credentials for live cloud persistence; test environments without Supabase credentials run live RLS tests in blocked/mocked state while all unit, adapter, migration, and E2E suites pass locally.
