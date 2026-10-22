# SoftCV Studio — Sprint 11 Engineering Report

> **Sprint Theme:** Release Readiness: Production Smoke Tests + Competitor Pattern Audit  
> **Sprint Execution Date:** `2026-10-22`  
> **Status:** Completed  
> **Lead Engineer / Architect:** Antigravity Full-Stack QA & Systems Lead  
> **Repository:** SoftCV Studio (`resumebuilder`)  
> **Active Design Specification:** Nintendo.com 2001 / Console Chrome (`docs/DESIGN.md`)  
> **Primary Release Constraint:** `RS-172` (Live Supabase Cross-User Isolation Gate) — Confirmed **P0 BLOCKER**

---

## 1. Changes Made

### Workstream A: Production Build and Runtime Smoke-Test Coverage
- **Authoritative Documentation (`docs/deployment-smoke-testing.md`)**:
  - Authored comprehensive production smoke-test specification detailing local production startup (`next start -p 3099`), environment variable presence matrix (without logging secret values), feature capability tiering across zero-config local-first mode, external AI provider mode, and Supabase cloud mode.
  - Formally differentiated between local compiled production testing and live deployed URL smoke verification.
- **Repeatable Automated Smoke Suite (`tests/production-smoke.test.ts`)**:
  - Implemented end-to-end production smoke suite using Playwright Chromium and Node fetch covering all 9 required journeys against a live compiled Next.js server instance (`next start -p 3099`).
  - Implemented robust, non-colliding server lifecycle management with Windows process tree termination (`taskkill /pid ... /T /F`) and POSIX `SIGTERM` cleanup, ensuring user processes (e.g., active dev server on port 3000) are never terminated.
- **Documented Command (`package.json`)**:
  - Added npm script `"test:smoke": "vitest run tests/production-smoke.test.ts"`.

### Workstream B: Deployment Risk Review (AI Rate Limiting & PDF Chromium)
- **AI Rate Limiter Memory & Scope Hardening (`src/lib/ai/rate-limiter.ts`)**:
  - Implemented `RateLimiterStore` interface and `InMemoryRateLimiterStore` with a strict memory bound (`MAX_RATE_LIMIT_ENTRIES = 5000`) and LRU eviction, preventing memory exhaustion attacks under high-traffic or IP-spoofing conditions.
  - Implemented input key sanitization (`sanitizeIdentifier`) to enforce length bounds (<= 128 chars) and strip control characters.
  - Introduced feature scope isolation (`scope?: string`) across `/api/ai/improve-bullet`, `/api/ai/improve-summary`, and `/api/ai/extract-requirements`. Previously, all routes keyed solely on client IP, causing requests on one route to prematurely consume the quota for other routes.
- **Rate Limiter Verification Suite (`tests/rate-limiter.test.ts`)**:
  - Added 6 automated tests validating quota exhaustion, time-window resets, feature scope isolation, and memory bounding under 6,000 synthetic IPs.
- **PDF Export Runtime Route & Fallback Hardening (`src/app/api/export/pdf/route.ts`, `tests/export.test.ts`)**:
  - Traced `/api/export/pdf` execution flow and verified server-side Chromium vector rendering vs client-side browser print fallback.
  - Extended `tests/export.test.ts` (+3 tests, 7 total) testing vector PDF binary buffers with `%PDF-` magic header, 400 schema error rejection, and graceful 500 responses providing actionable browser-print fallback instructions when Chromium is missing on a host.

### Workstream C: RS-002 Competitor Pattern Audit
- **Comprehensive Public Pattern Audit (`docs/competitive-audit.md`)**:
  - Completed in-depth audit of 7 competitor tools (Teal, FlowCV, Reactive Resume, Resume.io, Kickresume, Rezi, and Canva) based strictly on publicly verified documentation as of 2026-10-22.
  - Structured comparison matrix across 10 evaluation dimensions.
  - Formulated abstract implementation principles to adapt (interactive keyword match locator, immutable cartridge branching, page-budget telemetry, and standard JSON Resume portability).
  - Documented anti-patterns to avoid (dark-pattern trial paywalls, unverified "100% ATS guarantee" marketing claims, silent AI hallucinations, and black-box scoring).
  - Grounded SoftCV Studio's differentiated market position in verified codebase features.
  - Formulated 5 ranked, evidence-linked backlog opportunities with testable acceptance criteria (`RS-096` to `RS-100`).

### Workstream D: RS-172 Live Supabase Isolation Gate Preflight
- **Presence-Only Preflight Audit**:
  - Executed presence-only checks across Docker daemon, Supabase CLI, `.env.local`, and environment variables without printing any secrets or tokens.
  - Confirmed prerequisites remain absent. Left `RS-172` truthfully marked as **Blocked**.

---

## 2. Backlog Status Changes

| Ticket ID | Epic / Feature | Priority | Sprint 10 Status | Sprint 11 Status | Verification Evidence / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RS-002`** | Review competitor workflow patterns | P1 | `Not started` | **`Done`** | Comprehensive audit published in `docs/competitive-audit.md` auditing 7 competitors across 10 dimensions, with 5 ranked backlog opportunities (`RS-096`–`RS-100`). |
| **`RS-172`** | Run cross-user privacy and security tests | P0 | `Blocked` | **`Blocked`** *(P0 Release Blocker)* | Presence-only preflight confirms absence of staging credentials or local Docker daemon. Maintained strict truth-in-reporting; no mock conflated with live verification. |
| **`RS-095`** | ATS readiness scoring explainability | P1 | `Done` | `Done` | Re-verified via live runtime smoke test Journey 4 & 5 (`tests/production-smoke.test.ts`). |
| **`RS-173`** | Run export regression suite across templates | P0 | `Done` | `Done` | Re-verified via 21 matrix tests and live production export routes. |
| **`RS-174`** | Accessibility release review | P1 | `Done` | `Done` | Re-verified via 9 automated axe scans passing with 0 critical/serious issues. |

---

## 3. Production Smoke Test Matrix

*Automated via `tests/production-smoke.test.ts` against compiled production build (`npx next start -p 3099`).*

| Journey # | Route / Flow Tested | Environment | Expected Behavior | Actual Observed Result | Local vs Deployed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Journey 1** | Startup & Critical Routes (`/`, `/dashboard`, `/resume/new`, `/privacy`, `/terms`, `/help`, `/help/ats-and-ai`, `/release-notes`) | Compiled Next.js Production Server | 200 OK across all routes, Console Chrome metadata present, zero client-side console errors | All 7 routes returned 200 OK in <100ms; zero console errors logged | **Local Production** |
| **Journey 2** | Local-First Demo Mode (`/dashboard`) | Unconfigured Supabase (No credentials) | Dashboard renders cartridge rack in Demo Mode without requesting credentials or throwing auth errors | Rendered cleanly; verified cartridge rack present and zero credential prompts | **Local Production** |
| **Journey 3** | Guided Cartridge Initialization (`/resume/new`) | Clean browser context | Goal selector loads 6 archetype cards; selecting an archetype reveals starter modes | Renders all 6 archetypes; selecting slot transitions smoothly to step 2 | **Local Production** |
| **Journey 4 & 5** | ATS Readiness Explainability & Remediation Navigation (`/resume/[id]/edit`) | Production Editor Shell | UI cartridge commit navigates to editor; ATS Review section tab renders scoring guide disclosure and formula cards | Successfully navigated into editor; opened ATS Review; verified "How This Is Scored" disclosure card (`#scoring-guide-panel`) toggles cleanly | **Local Production** |
| **Journey 6** | Binary Exports: PDF (`/api/export/pdf`) & DOCX (`generateDocxBlob`) | Server-side Chromium & DOCX OpenXML engine | PDF returns binary buffer with `%PDF-` magic header (>1KB); DOCX returns valid OpenXML blob (>2KB); invalid payload returns 400 | PDF returned `%PDF-` buffer (200 OK); invalid payload returned 400; DOCX generated valid 2,800+ byte OpenXML blob | **Local Production** |
| **Journey 7** | Unconfigured AI Safe Fallback (`/api/ai/*`) | Unset `AI_API_KEY` | Routes return 503 `NOT_CONFIGURED` without leaking server secrets or crashing | `/api/ai/improve-bullet`, `/api/ai/improve-summary`, and `/api/ai/extract-requirements` all returned 503 `NOT_CONFIGURED` with structured JSON | **Local Production** |
| **Journey 8** | Policy & Trust Pages Compliance (`/privacy`, `/help/ats-and-ai`) | Static Route Previews | Policies disclose local storage boundaries and explicitly state that no software can guarantee hiring outcomes | `/privacy` confirmed localStorage disclosures; `/help/ats-and-ai` confirmed honest heuristic scoring copy | **Local Production** |
| **Journey 9** | Responsive Viewport & Keyboard Operation (`375px` & `1280px`) | Headless Playwright Chromium | Mobile 375px viewport exhibits zero horizontal overflow (`scrollWidth <= clientWidth`); Tab key traverses interactive elements | `scrollWidth === clientWidth` on mobile; Tab navigation smoothly focused primary controls | **Local Production** |

---

## 4. Competitor Audit Summary (`RS-002`)

- **Audit Date:** `2026-10-22`
- **Audited Products & Sources:**
  1. **Teal:** `https://www.tealhq.com/` — Career operating system & job tracker.
  2. **FlowCV:** `https://flowcv.com/` — Typography-first visual customization.
  3. **Reactive Resume:** `https://rxresu.me/` — Open-source, JSON Resume compliant, privacy-first builder.
  4. **Resume.io:** `https://resume.io/` — Wizard-driven commercial builder with aggressive paywalling.
  5. **Kickresume:** `https://www.kickresume.com/` — Graphical designer templates and AI assistant.
  6. **Rezi:** `https://www.rezi.ai/` — ATS keyword targeting and proprietary scoring.
  7. **Canva:** `https://www.canva.com/resumes/` — Freeform graphic canvas (poor ATS parseability).
- **Key Public Findings:**
  - Standard commercial tools (Resume.io, Kickresume, Teal) monetize heavily by gating export downloads or advanced keyword matching behind $25–$30/month subscriptions.
  - "ATS Compatibility" is frequently used as marketing shorthand without objective scoring formula disclosure.
  - Canva templates present significant text-stream scrambling risks in enterprise ATS parsers due to absolute canvas positioning.
- **Prioritized Backlog Opportunities (Ranked):**
  1. `RS-096`: Side-by-Side Keyword Evidence Locator in Editor (Priority P1, Effort M, Confidence 90%)
  2. `RS-097`: JSON Resume Standard Import & Export (Priority P2, Effort S, Confidence 85%)
  3. `RS-098`: Page-Budget Visualizer & Overflow Guard (Priority P2, Effort M, Confidence 75%)
  4. `RS-099`: Job Description Requirement Evolution Tracker (Priority P3, Effort M, Confidence 70%)
  5. `RS-100`: Offline-Ready PWA Manifest & Cartridge Vault (Priority P2, Effort S, Confidence 85%)
- **Non-Validated Disclosures:**
  - Competitor trial conversion rates, customer retention figures, and candidate hiring callback rates are explicitly labeled as **unverified by customer research or internal telemetry**.

---

## 5. Quality Gate Results

All gates were executed sequentially against the updated codebase:

| Gate Command | Exit Status | Result Summary | Delta vs Sprint 10 Baseline |
| :--- | :--- | :--- | :--- |
| **`npm test`** | `0` (Pass) | **259 passed across 30 files** (0 failures) | +22 tests, +2 test files (`tests/rate-limiter.test.ts`, `tests/production-smoke.test.ts`) |
| **`npm run test:smoke`** | `0` (Pass) | **13 passed across 1 file** (9 journeys verified against live production build) | New suite implemented |
| **`npm run test:a11y`** | `0` (Pass) | **9 scans passed, 0 critical or serious WCAG 2.2 AA violations** | Clean parity maintained |
| **`npm run typecheck`** | `0` (Pass) | **0 type errors** (`tsc --noEmit`) | Strict TypeScript clean |
| **`npm run lint`** | `0` (Pass) | **0 errors, 1 known Next.js `<img>` warning** (`eslint`) | Clean lint gate |
| **`npm run build`** | `0` (Pass) | **18 static/dynamic routes compiled successfully** in 1.1s via Turbopack | Production bundle clean |
| **`npm audit --omit=dev`** | `0` (Pass) | **0 vulnerabilities found** | Zero production CVEs |
| **`git diff --check`** | `0` (Pass) | **0 whitespace, line-ending, or conflict marker errors** | Clean git tree |

---

## 6. Security Release Gate: RS-172 Status

- **Ticket Status:** **`BLOCKED`** (P0 Release Blocker)
- **Preflight Evaluation Findings (Non-Sensitive):**
  - `DOCKER_FOUND`: `false` (Docker daemon is not running in local environment)
  - `SUPABASE_CLI_FOUND`: `false` (Supabase CLI is not installed)
  - `ENV_LOCAL_EXISTS`: `false` (No `.env.local` file present in workspace root)
  - `URL_EXISTS`: `false` (`NEXT_PUBLIC_SUPABASE_URL` is empty)
  - `ANON_EXISTS`: `false` (`NEXT_PUBLIC_SUPABASE_ANON_KEY` is empty)
- **Why It Remains Blocked:**
  In accordance with project quality rules, static SQL reviews, client mock unit tests (11 passing tests in `tests/supabase-adapter.test.ts`), and invariant unit tests (5 passing tests in `tests/cloud-invariants.test.ts`) **must never be conflated with live database RLS verification**.
- **Prerequisites for Release Operator to Unblock RS-172:**
  1. Provision a disposable Supabase staging project (never test against production).
  2. Create a local `.env.local` containing the staging project URL and anon key (never commit this file).
  3. Execute `docs/supabase/tests/rls_isolation_tests.sql` via Supabase SQL Editor or `supabase db test`.
  4. Follow the two-account browser protocol in `docs/supabase-staging-test.md` to verify cross-user isolation across concurrent sessions.

---

## 7. Residual Architectural Risks

1. **In-Memory Rate Limiting Scope:**
   While the rate limiter in `src/lib/ai/rate-limiter.ts` has been hardened with memory bounds (5,000 entries with LRU purge), key sanitization, and feature scope isolation, rate limit state remains process-local. Deploying to multi-region serverless or auto-scaled container clusters will require a distributed store (e.g., Redis / Upstash KV).
2. **Server-Side Chromium Dependencies for PDF Export:**
   Generating true vector PDF binary streams on the server via `/api/export/pdf` requires Chromium. If deployed to a bare serverless container missing Chromium binaries, the endpoint safely catches the launch failure and returns a 500 status directing the user to use the browser print fallback.
3. **Live Deployed URL Smoke Testing:**
   Local compiled production builds (`next start`) are 100% verified. Testing against a live cloud CDN / edge runtime requires provisioning a target hosting environment.

---

## 8. Recommended Next Work

Ranked strictly by release risk and user impact:

1. **Provision Staging Environment & Execute RS-172 Gate (Priority: P0 | Impact: Critical)**:
   Provision a disposable Supabase staging project to execute `docs/supabase/tests/rls_isolation_tests.sql` and unblock the P0 release gate.
2. **Implement Side-by-Side Keyword Evidence Locator (`RS-096`) (Priority: P1 | Impact: High)**:
   Implement interactive keyword highlighting linking the ATS Readiness Panel directly to matched and missing skills in the editor drafting board.
3. **Standard JSON Resume Import / Export (`RS-097`) (Priority: P2 | Impact: Medium)**:
   Implement two-way JSON Resume import/export in the Data & Privacy Dialog to guarantee candidate data portability.
