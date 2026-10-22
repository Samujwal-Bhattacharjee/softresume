# SoftCV Studio — Application Security Architecture

**Document Reference:** `DOC-SEC-ARCH-2026-V1`  
**Status:** Implemented & Verified (Sprint 06)  
**Security Lead / Author:** Application Security Engineer & Full-Stack Maintainer  

---

## 1. Security Architecture & Core Tenets

SoftCV Studio is built upon five foundational security and privacy principles:

1. **Client-Side Ownership by Default:** User documents, tailored resumes, and job targets exist in the candidate's browser (`localStorage`). No server database quietly harvests or correlates candidate credentials.
2. **Strict Server-Secret Isolation:** AI provider keys (`AI_API_KEY`) and server configuration never cross the server-client boundary. No `NEXT_PUBLIC_` prefixes are permitted on provider secrets.
3. **Truth Preservation & Anti-Hallucination:** AI suggestions are treated as unverified computational proposals. The system prompt anchors on candidate-provided facts and refuses to fabricate metrics, dates, or employers.
4. **Zero-PII Telemetry:** Server logs and error reports strictly scrub candidate names, email addresses, phone numbers, and raw resume text before emitting structured log entries.
5. **Truthful Capability Advertising:** The product explicitly discloses that persistence is local-only, rate limiting is process-local, and no ATS score guarantees an employer interview.

---

## 2. Secrets Management & Environment Isolation

### Tracked vs Untracked Configuration

| Configuration File | Git Status | Contents & Purpose | Security Classification |
|---|---|---|---|
| `.env.example` | Tracked in Git | Placeholder keys, sample provider URLs, and documentation comments | Public Reference |
| `.env` / `.env.local` | Ignored by `.gitignore` | Local developer secrets (`AI_API_KEY`, etc.) | **Confidential Secret** |
| `src/lib/ai/provider.ts` | Tracked in Git | Server-side provider abstraction reading `process.env.AI_API_KEY` | Public Code |

### Automated Secret Hygiene Verification

```bash
# Verify no secret files are tracked in git index:
git ls-files --stage .env*
# Output: only .env.example tracked with hash and 0 secrets
```

- Keys must never be named with `NEXT_PUBLIC_` or referenced in React client components.
- In Next.js client bundles, any variable not prefixed with `NEXT_PUBLIC_` is replaced with `undefined` at compile time.

---

## 3. Dependency Hygiene & Audit Results

As of Sprint 06 verification:
- **Production Audit Command:** `npm audit --omit=dev`
- **Audit Result:** `found 0 vulnerabilities` across all production dependencies.
- **Lockfile Integrity:** `package-lock.json` is committed in version control, locking exact sha-512 package hashes and preventing dependency drift.

---

## 4. PII-Safe Logging Pattern (RS-045)

All server API handlers (`/api/ai/*`, `/api/export/pdf`) use the centralized structured logger in `src/lib/logger.ts`.

### Sanitization Mechanics

```typescript
// Example: candidate email, phone, and bearer tokens are automatically scrubbed:
logger.error("AI Provider exception", err, {
  route: "/api/ai/improve-bullet",
  status: 500,
  correlationId: "req-9912",
  // The following would be redacted automatically if passed:
  candidateEmail: "[REDACTED]",
  apiKey: "[REDACTED]"
});
```

- **Regex Scrubbing:** Active regex filters scrub email addresses, phone numbers, and OpenAI-style API keys (`sk-*`) from error messages and metadata strings.
- **Key Blacklisting:** Object keys containing `password`, `apiKey`, `secret`, `token`, `authorization`, `cookie`, `jobdescription`, `resume`, `bullet`, `email`, or `phone` are replaced with `[REDACTED]`.

---

## 5. Rate Limiting Specifications & Known Limitations (RS-151)

Rate limiting is enforced by `src/lib/ai/rate-limiter.ts`:

- **Bullet Improver (`/api/ai/improve-bullet`):** 20 requests per client IP per 60 seconds.
- **Summary Helper (`/api/ai/improve-summary`):** 10 requests per client IP per 60 seconds.
- **Job Extractor (`/api/ai/extract-requirements`):** 10 requests per client IP per 60 seconds.

### Documented Limitation

The rate limiter uses an **in-memory sliding window map** within the Node.js process.  
- **Single Container:** Reliably throttles rapid client bursts and prevents accidental request loops.
- **Multi-Instance / Serverless:** Each container maintains its own memory table. A distributed cache (e.g. Redis / Upstash) will be required when scaling to multi-region distributed deployments.

---

## 6. Binary Export Hardening

- **Filename Sanitization:** `src/lib/export/filename.ts` enforces `sanitizeResumeFilename()`. It strips path separators (`/`, `\`), null bytes (`%00`), quotes, and non-printable characters, enforcing a maximum length of 60 characters with safe `.pdf` and `.docx` extensions.
- **Chromium Isolation:** Headless Chromium runs in an isolated sandbox context with no network access, rendering purely semantic HTML and print CSS.

---

## 7. Supabase Cloud Security Architecture (RS-040–RS-042)

Implemented in Sprint 07 as a secure, authenticated cloud persistence layer while preserving standalone local-first mode as a fallback.

### 7.1 Multi-Tenant Row-Level Security (RLS)
PostgreSQL kernel-level security is enforced on all cloud persistence tables (`docs/supabase/migrations/001_initial.sql`):
- `ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE public.job_targets ENABLE ROW LEVEL SECURITY;`
- Strict policies ensure that `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries are constrained to `auth.uid() = user_id`. An attacker forging a resume UUID in SQL or HTTP requests cannot inspect or mutate another user's document.

### 7.2 Redundant Application-Layer Authorization (`supabase-adapter.ts`)
Defense-in-depth requires that client and server logic do not solely rely on the database layer:
1. **Authenticated Context Assertion:** Every mutation checks for an active Supabase auth session (`auth.getUser()`).
2. **Document Ownership Verification:** `assertOwnership(id, user_id)` verifies that the target document belongs to the requesting user before performing an update or delete.
3. **Pre-Write Zod Schema Validation:** Every resume written to PostgreSQL is validated against `ResumeDocumentSchema` via Zod. Corrupt or malicious payloads are rejected before database queries are issued.

### 7.3 Session Security & Cookie Handling (`@supabase/ssr`)
- Sessions are maintained using `@supabase/ssr` cookies with `HttpOnly`, `Secure` (in production), and `SameSite=Lax` attributes.
- Token refreshes are handled transparently in Next.js 16 Proxy (`src/proxy.ts`).
- Server actions (`signUpAction`, `signInAction`, `signOutAction`) manage credentials on the server, avoiding client token leaks.

### 7.4 Key Boundary & Secret Separation
- **Public Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`):** Publicly safe because it has zero database permissions except those permitted by RLS policies (`auth.uid() = user_id`).
- **Service Role Key:** Strictly forbidden in client code and browser adapters. SoftCV Studio does not expose or bundle service-role privileges into the frontend.
- **AI Keys (`AI_API_KEY`):** Isolated strictly in server runtime; zero client exposure.

### 7.5 Testing, Invariant Verification & Staging Readiness (RS-172)
- **Adapter Unit Tests (`tests/supabase-adapter.test.ts`):** 11 automated unit tests verify cross-user isolation, authorization failures, malformed input rejection, and data integrity.
- **Client Cloud Invariants (`tests/cloud-invariants.test.ts`):** 5 automated tests verify that unconfigured environments fall back cleanly to local demo mode, offline persistence remains functional, failed cloud saves emit explicit errors without false OK indicators, and local purges remain scoped to active user data.
- **PostgreSQL Database Isolation Tests (`docs/supabase/tests/rls_isolation_tests.sql`):** 14 pgTAP database tests covering table RLS enablement, anonymous user blocking, User A CRUD, User B cross-user isolation across SELECT/UPDATE/DELETE, forged user_id INSERT rejection, cross-user job_target attachment rejection, and cascade deletion.
- **Staging Verification Runbook (`docs/supabase-staging-test.md`):** Comprehensive testing procedure for testing against a disposable live Supabase staging project using two separate browser profiles (User A and User B).
- **Execution Status:** RS-172 remains truthfully **Blocked** because live remote Supabase credentials or a local Docker daemon are not installed in the automated test runner. Mocks and SQL scripts are not conflated with live database execution.
