# SoftCV Studio

> **Create once. Improve with AI. Tailor to each job. Download without friction.**

SoftCV Studio is a full-stack, local-first, privacy-preserving career document studio built with a distinct **Nintendo.com 2001 / Console Chrome** design language (`docs/DESIGN.md`) and restrained, recruiter-friendly downloadable documents.

---

## Highlights

- **Nintendo 2001 Console Chrome Interface (`docs/DESIGN.md`)**:
  - Tactile hardware chassis styling: carbon navy (`#21242e`), lavender surfaces (`#eaedff`), chrome indigo (`#3d4f97`), signal orange (`#f68d1f`), and wayfinding amber (`#ecab37`).
  - Beveled cartridge plates, speaker grilles, uppercase technical telemetry, and keyboard-accessible focus traps.
- **Single Canonical Resume Schema (`RS-030`)**: One versioned, strictly-typed Zod schema powers the editor, previews, ATS checks, and exports. Templates never own or mutate content data.
- **Dual-Mode Persistence (Local-First + Supabase Cloud Vault) (`RS-040` – `RS-043`, `RS-070`)**:
  - **Standalone Local Mode:** 100% user-owned browser `localStorage` under `softcv_*` namespace with JSON backup exports, tombstoned autosave race protection, and scoped storage purge.
  - **Authenticated Cloud Vault:** Multi-tenant PostgreSQL persistence via Supabase with kernel-level Row-Level Security (`USING (auth.uid() = user_id)`) and redundant application authorization checks (`assertOwnership`).
  - **Seamless Local-to-Cloud Migration:** Non-destructive pre-flight planning, demo fixture exclusion, title deduplication, and optional post-migration local purge.
- **Deterministic ATS Readiness Engine (`RS-100` / `RS-101` / `RS-104`)**:
  - Independent unit-testable rules engine analyzing contact identity, structure, formatting, line density, and buzzwords without opaque scores or false ATS guarantees.
  - Context-aware completeness checks tailored to target personas (Fresher, Experienced, Technical, General).
  - Transparent Job Match keyword alignment against pasted job descriptions with a maintainable synonym map.
- **Interactive ATS Findings & Explainability Panel (`RS-103` / `RS-095` / `RS-096`)**:
  - Tabbed interface (Parse Readiness, Completeness, Writing Quality, Job Match) with severity indicators and actionable guidance.
  - **Single Source of Truth Catalog (`src/lib/ats/rules-catalog.ts`):** 24+ typed rule definitions preventing drift between scoring logic and explanatory copy.
  - **Side-by-Side Keyword Evidence Locator (`RS-096`):** Interactive Console Chrome dual-column locator transparently connecting job requirements to candidate resume citations. Features verbatim excerpt citations, multiple-occurrence disclosures, grounded missing-requirement guidance, ethical safeguards (explicit advice to never add skills without evidence), and non-destructive editor navigation via `navigateToSection`.
  - **"HOW THIS IS SCORED" Disclosure:** Collapsible Console Chrome cards explaining exact deterministic formulas (`Score = 100 - (Errors × 25) - (Warnings × 10) - (Suggestions × 3)` and Job Match alignment percentage), score bands, and explicit heuristic disclaimers ("guidance, not a guarantee of ATS acceptance or hiring outcomes").
  - **Filterable Checklist:** Toggle between All Checks, Incomplete, and Passed views.
  - **Per-Check Details:** Expandable drawers detailing what is evaluated, pass conditions, observed candidate data/triggers, and recruiter rationale.
  - **Actionable Remediation:** Direct click-to-edit navigation (`Edit in <section>`) jumping straight to the relevant editor form section.
  - **100% Offline & Local-First:** Operates entirely client-side with zero external API or AI dependencies.
- **Standard JSON Resume Import / Export (`RS-097`)**:
  - Full two-way support for the official JSON Resume Schema (v1.0.0) in `src/lib/export/json-resume.ts`.
  - Accessible via the Data Controls & Privacy Subsystem and Template Settings deck.
  - Pre-flight validation preview, bounded 1MB file size checks, non-destructive cartridge creation, and lossless round-trip preservation of SoftCV layout extensions via namespaced `x-softcv` blocks.
- **Custom Sections & Optional Fields (`RS-075`)**:
  - Full modular support for Certifications, Honors & Awards, Volunteering & Community, Publications & Research, and user-defined Custom Sections.
  - Complete integration across the 13-module Section Rack (`src/app/resume/[resumeId]/edit/page.tsx`), dedicated Console Chrome editing decks, and bounded undo/redo history.
  - Clean omission guarantees: empty optional and custom sections never render in previews or exports.
  - Rigorous safety limits: custom section titles bounded to 80 chars, descriptions bounded to 2,000 chars, and items bounded to prevent UI or PDF burst.
  - Multi-template and multi-format export parity across all 5 production templates (Classic ATS, Fresher, Technical, Experienced, Modern Editorial) and binary exporters (PDF, DOCX, TXT, JSON Resume).
- **Real Resume Template Variants (5 Implemented, 1 Deferred)**:
  - **Classic ATS**: Single-column, high-contrast, maximum parsing compatibility.
  - **Fresher / Graduate**: Highlights education, coursework, student projects, and hackathons.
  - **Modern Editorial**: Refined typography, understated accent color, crisp dividers for product and business generalists.
  - **Technical / Project-First**: Highlights technical projects, code repositories, stack tags, and contribution bullets.
  - **Experienced Professional**: Emphasizes leadership scope, career progression, and multi-page layout stability.
  - *Creative / Portfolio* is truthfully marked as **deferred** to preserve ATS parse readiness.
- **Role-Specific Coaching Presets (`RS-093`)**:
  - Maintainable registry of 11 typed professional archetypes (Software Engineer, AI/ML, Cloud/DevOps, Data Scientist, Product Manager, UI/UX, Finance/Consulting, Sales/Customer Success, Research/Academic, Creative/Film, General/Career Switcher).
  - Non-destructive section architecture comparison and preview modal (`RoleCoachingModal`).
  - Grounded AI prompt enhancers injecting role framing and evidence expectations without hallucinating absent technologies or seniority.
  - Distinct fresher/internship vs experienced-professional coaching.
- **Bounded Undo/Redo & History Recovery (`RS-072`)**:
  - In-memory state history ring capped at 30 snapshots (`MAX_HISTORY = 30`) protecting memory bounds.
  - Keystroke debounce clustering (600ms) prevents single-character snapshot clutter.
  - Seamless AI rollback: accepting an AI suggestion captures an instant pre-mutation snapshot, enabling one-click undo if the candidate changes their mind.
  - Console Chrome toolbar controls (`UndoRedoControls`) with keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z) and polite `aria-live` status announcements.
- **Next.js 16 Proxy Convention (`RS-046`)**:
  - Full migration from deprecated `middleware.ts` to `src/proxy.ts` using `export async function proxy(request: NextRequest)`.
  - Preserves SSR cookie refresh and route protection with 0 framework deprecation warnings.
- **Supabase Isolation Verification & Staging Harness (`RS-172`)**:
  - Formal 14-case pgTAP test suite authored in `docs/supabase/tests/rls_isolation_tests.sql` covering anonymous blocking, User A CRUD, cross-user User B isolation, forged user ID rejection, and foreign key cascades.
  - Step-by-step staging verification runbook in `docs/supabase-staging-test.md` for dual-browser isolation tests.
  - 5 automated client cloud invariant tests in `tests/cloud-invariants.test.ts`.
- **Safe AI Foundation & On-Demand Gateway (`RS-044` / `RS-080` – `RS-085` / `RS-150`)**:
  - Server-side only execution: API keys are never bundled into client JavaScript.
  - Strict truth preservation: AI never fabricates metrics, team sizes, or unstated technologies.
  - Prompt injection defense: Quarantines untrusted user text inside delimited data tags.
  - Human-in-the-loop review: User inspects side-by-side diffs and must explicitly Accept, Edit, or Reject.
  - Honest unconfigured mode: Returns 503 `NOT_CONFIGURED` with an accessible alert banner when no key is set.
- **Job-Specific Resume Branching & Cartridge Tailoring (`RS-094`)**:
  - Independent opportunity-specific branching: Tailor any cartridge for a targeted role and company with custom job description.
  - Master immutability guarantee: Powered by `structuredClone()`, ensuring modifications to bullets, skills, experience, or layout in a tailored copy never mutate the master cartridge.
  - Lineage tracking and telemetry: Retains `parentResumeId`, `targetRole`, and `targetCompany`; displayed in dashboard cartridge slots and the editor command bar (`◈ TAILORED // <Role>`).
  - Atomic rollback safety: If job target initialization fails, the newly branched cartridge is atomically purged, preventing corrupted half-created drafts.
  - Safe deletion boundaries: Deleting a tailored copy deletes only its record and attached job target without affecting master or sibling cartridges.
- **Full Multi-Template Binary Export Regression Matrix (`RS-173`)**:
  - Parametrized test matrix across all 5 implemented launch templates (Classic ATS, Fresher/Graduate, Modern Editorial, Technical/Project-First, Experienced Professional; Creative deferred).
  - 6 content profiles validated: Sparse/Minimal (1 page, omitted sections, no orphan headings), Typical Fresher, Dense Technical, Multipage Experienced (>= 2 pages, clean pagination), International/Unicode (accented French/German diacritics, typographic dashes), and Long URL/Overflow (links >120 chars, bullets >350 chars).
  - Dual geometry support: A4 and US Letter verified across binary PDF text extraction (`pdf-parse`) and OpenXML DOCX structures (`JSZip` checking `w:pgSz` dxa dimensions).
  - Headless Chromium Playwright zero-overflow assertion (`scrollWidth <= clientWidth + 2px`).
  - PDF vs DOCX semantic content fidelity checks.
- **Multi-Format Export & Real-File Validation (`RS-110` – `RS-123`)**:
  - **Vector PDF Download**: Direct binary vector PDF compilation via server-side Chromium (`/api/export/pdf`).
  - **Browser Print Fallback**: Instant local `window.print()` dialog with paginated media styles.
  - **Word (.docx)**: Editable Microsoft Word document with standard semantic headings and native bullets.
  - **Plain Text (.txt)**: Clean plain-text representation for job application portals.
  - **Automated Validation**: Automated tests inspect real PDF byte streams via `pdf-parse` and DOCX ZIP structures via `JSZip`.


---

## Technology Stack

- **Framework**: Next.js 16.4 (App Router, Turbopack, React 19)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Database & Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`, PostgreSQL with Row-Level Security)
- **Styling**: Tailwind CSS v4 & custom Nintendo 2001 Console Chrome tokens
- **State Management**: Zustand 5 + Immer
- **Schema Validation**: Zod 4
- **PDF Generation & Validation**: Playwright Chromium, `pdf-parse` v2
- **Document Generation & Inspection**: `docx` v9, `jszip` v3
- **Testing**: Vitest 5, jsdom, `@axe-core/playwright`, `@testing-library/react`

---

## Getting Started

### 1. Prerequisites

- Node.js 18.18+ or 20+
- npm 9+
- Playwright Chromium binary: `npx playwright install chromium`

### 2. Installation

```bash
git clone <repository-url>
cd resumebuilder
npm install
npx playwright install chromium
```

### 3. Local Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Verification & Testing

Run all quality gates:

```bash
# Run full suite: unit, component, real-file export, responsive, data controls, journey, history, presets, proxy, and cloud invariant tests (197 tests across 25 suites)
npm test

# Run dedicated WCAG 2.2 AA automated accessibility scans via axe-core (9 release-critical states)
npm run test:a11y

# Run strict TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Run Next.js production build
npm run build
```

---

## Environment Variables

| Variable | Scope | Required / Optional | Default | Description |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Optional | *(None)* | Hosted Supabase project URL (e.g. `https://xyz.supabase.co`). If unset, app operates in local-first demo mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Optional | *(None)* | Public Supabase anon key restricted by PostgreSQL RLS (`auth.uid() = user_id`) |
| `AI_PROVIDER` | Server Only | Optional | `openai` | AI provider protocol (`openai` compatible) |
| `AI_API_KEY` | Server Only | Optional | *(None)* | API secret key for AI writing assistance |
| `AI_MODEL` | Server Only | Optional | `gpt-4o-mini` | Model identifier sent in completion payload |
| `AI_BASE_URL` | Server Only | Optional | `https://api.openai.com/v1` | Base URL for OpenAI-compatible gateway |

*Note: `AI_API_KEY` is never prefixed with `NEXT_PUBLIC_` and never delivered to client browsers. Supabase public keys are strictly constrained by Row-Level Security.*

---

## Public Content & Guidance Routes

- `/privacy` — Truthful privacy policy covering local storage, AI requests, and data deletion.
- `/terms` — Pragmatic draft terms regarding candidate content responsibility and no hiring guarantees.
- `/help/ats-and-ai` — Comprehensive technical guide to ATS parse readiness, keyword heuristics, and AI boundaries.
- `/release-notes` — Production release notes, template roster audit, and known architectural constraints.

---

## Architecture & Technical Documentation

- [`docs/threat-model.md`](docs/threat-model.md) — 10-area threat model covering data at rest, cloud trust boundaries, prompt injection, and residual risks.
- [`docs/security.md`](docs/security.md) — Application security architecture, Supabase RLS, secret hygiene, dependency audits, and rate limits.
- [`docs/architecture.md`](docs/architecture.md) — System component data flow diagram and module contracts.
- [`docs/data-model.md`](docs/data-model.md) — Canonical Zod schemas, migrations, Supabase PostgreSQL schema, and storage keys.
- [`docs/ai-safety.md`](docs/ai-safety.md) — System prompts, prompt injection quarantine, Zod response validators, and error codes.
- [`docs/data-retention.md`](docs/data-retention.md) — Data deletion lifecycle, cloud cascade deletion, backup retention, and verification steps.
- [`docs/incident-guide.md`](docs/incident-guide.md) — Production monitoring, cloud outage fallback, migration recovery, and secret rotation.
- [`docs/deployment-smoke-testing.md`](docs/deployment-smoke-testing.md) — Production build smoke test specification, infrastructure requirements, and 9 verified journeys.
- [`docs/competitive-audit.md`](docs/competitive-audit.md) — RS-002 audit of 7 competitor workflow patterns, comparison matrix, adapted principles, and backlog opportunities.
- [`docs/export-testing.md`](docs/export-testing.md) — Automated binary PDF/DOCX test procedures and visual baselines.
- [`docs/accessibility-audit.md`](docs/accessibility-audit.md) — Axe automated scan results and manual testing protocol.
- [`docs/DESIGN.md`](docs/DESIGN.md) — Nintendo.com 2001 / Console Chrome visual specification.
- [`docs/BACKLOG.md`](docs/BACKLOG.md) — Master backlog source of truth with ticket statuses and evidence.

---

## Known Limitations

1. **Unconfigured Cloud Fallback:** When `NEXT_PUBLIC_SUPABASE_URL` is omitted, the application operates strictly in local-first demo mode using browser `localStorage`.
2. **Live Remote Multi-Tenant Testing (RS-172):** All adapter authorization and cross-user isolation unit tests pass (11 tests in `tests/supabase-adapter.test.ts`), but live browser testing against a live remote Supabase instance requires active project credentials.
3. **Rate Limiting Scope:** The current rate limiter is process-local and in-memory. Multi-instance serverless deployments require a shared Redis limiter.
4. **Chromium Server Requirement:** Vector PDF compilation requires Chromium installed on the server environment. Browser print fallback is available if Chromium is absent.
5. **Manual Screen-Reader Verification:** Automated Axe scans pass with 0 critical/serious issues across 9 states, but physical testing with NVDA and VoiceOver remains an open operational item.
6. **No Hiring Guarantees:** ATS readiness findings are structural checks and do not guarantee interview invitations.

---

## License

Private / Proprietary. All rights reserved.
