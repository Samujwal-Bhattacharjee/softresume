# SoftCV Studio — Sprint 12 Engineering Report

> **Sprint Theme:** Keyword Evidence Locator & Standard JSON Resume Portability  
> **Sprint Execution Date:** `2026-10-23`  
> **Status:** Completed  
> **Lead Engineer / Architect:** Antigravity Full-Stack Systems & QA Lead  
> **Repository:** SoftCV Studio (`resumebuilder`)  
> **Active Design Specification:** Nintendo.com 2001 / Console Chrome (`docs/DESIGN.md`)  
> **Primary Release Constraint:** `RS-172` (Live Supabase Cross-User Isolation Gate) — Confirmed **P0 BLOCKER**

---

## 1. Summary of Code Changes & File Paths

### Primary Workstream (P1): `RS-096` — Side-by-Side Keyword Evidence Locator
- **Deterministic Heuristic Matching & Excerpt Generation (`src/lib/ats/job-match.ts`, `src/lib/ats/types.ts`)**:
  - Reused the existing deterministic offline engine as the single source of truth without duplicating matching formulas or calling third-party AI providers.
  - Implemented `normalizeKeyword(term)` to perform unicode diacritic folding (`NFKD`), whitespace trimming, and symbol normalization while preserving hyphenated compounds.
  - Implemented `generateExcerpt(fullText, matchIdx, termLen, maxLen = 110)` to extract verbatim resume citations with a balanced surrounding context window and leading/trailing ellipsis indicators. Quotes are grounded strictly in the candidate's actual text.
  - Extended `findRequirementEvidence()` and `evaluateJobRequirementsCoverage()` to return `EvidenceItem[]` across all matched locations and identify the primary section with highest occurrence weight.
  - Implemented `inferSuggestedSection(requirementText)` to infer sensible, grounded resume sections to inspect for unmet criteria (e.g. programming languages and tools suggest Technical Skills or Projects; degrees suggest Education; responsibilities suggest Experience) or provide safe fallback guidance without claiming certainty.
  - Extended `RequirementMatchEvidence` and `MissingRequirementItem` types to carry excerpts, primary sections, and grounded suggestions.
- **Non-Destructive Navigation State (`src/lib/resume/editor-store.ts`)**:
  - Added `locatorTarget: { term: string; source: "matched" | "missing" } | null` to the Zustand store.
  - Added `navigateToSection(section: string, term?: string, source?: "matched" | "missing")` which activates the target section tab and sets `locatorTarget` without touching `draft` or `history`, preserving undo/redo and autosave integrity.
- **Console Chrome Locator UI (`src/components/resume-editor/keyword-evidence-locator.tsx`)**:
  - Designed an accessible two-column / filterable dual-group interface matching `docs/DESIGN.md` tokens.
  - Features status filter pills (`ALL REQUIREMENTS`, `EVIDENCED`, `MISSING`), priority filter pills (`ALL PRIORITY`, `REQUIRED ONLY`, `PREFERRED ONLY`), and an instant keyword search input.
  - Renders exact verbatim citations with primary section tags.
  - Includes an expandable multi-occurrence disclosure (`aria-expanded`, `aria-controls`) to review secondary citations without overwhelming the panel.
  - Integrates non-destructive `LOCATE EVIDENCE →` and `REVIEW SECTION →` jump buttons.
  - Embeds prominent ethical safeguards and heuristic disclosures advising candidates to never add missing skills without possessing real, demonstrable experience.
- **Active Focus Context Banner (`src/app/resume/[resumeId]/edit/page.tsx`)**:
  - Implemented `LocatorTargetBanner` displaying an amber status plate with active keyword focus, section feedback, an accessible dismiss button, and a quick `← ATS REVIEW` return link.
- **Mount Point (`src/components/resume-editor/ats-readiness-panel.tsx`)**:
  - Mounted `KeywordEvidenceLocator` inside the Job Match tab under the scoring cards.

### Secondary Workstream (P2): `RS-097` — Standard JSON Resume Import/Export (v1.0.0)
- **Standard Mapping Module (`src/lib/export/json-resume.ts`)**:
  - Created a pure, tested transformation module strictly decoupled from UI logic.
  - Implements full bi-directional mapping between canonical `ResumeDocument` and official [JSON Resume Schema v1.0.0](https://jsonresume.org/schema/).
  - Maps `basics` (name, label, email, phone, url, summary, location, profiles), `work` (position, name, dates normalized to `YYYY-MM`, highlights), `education` (institution, area, studyType, dates), `skills` (name, keywords), `projects` (name, description, highlights, url, keywords), `certificates`, `awards`, `publications`, and `languages`.
  - Normalizes legacy/loose fields (e.g. `gpa` to `grade`, `publisher` to `venue`).
  - Implements `x-softcv` namespaced extension to losslessly preserve SoftCV-specific data (internships, custom sections, layout settings) without violating the official schema.
  - Enforces bounded file parsing (`MAX_JSON_RESUME_SIZE = 1MB`) and runtime validation via `ResumeDocumentSchema.safeParse()`.
  - Guarantees safe text-node rendering with zero HTML injection vulnerabilities.
- **UI Integration in Data Controls & Privacy Dialog (`src/components/data-privacy-dialog.tsx`)**:
  - Added clearly separated "EXPORT ACTIVE RESUME (JSON RESUME STD V1.0)" download action.
  - Added "IMPORT STANDARD JSON RESUME (V1.0)" with a local file picker (`.json, application/json`).
  - Added a Pre-Flight Validation Preview Card displaying candidate name, schema validation badge, section list, item counts, and mapping notices/warnings for unsupported fields (e.g. references, volunteer).
  - Enforces non-destructive cartridge creation via `adapter.createResume(...)`.
- **UI Integration in Template Settings Panel (`src/components/resume-editor/template-settings-panel.tsx`)**:
  - Added a "Standard JSON Resume (v1.0) ↓" button in the Export Action Deck.

---

## 2. Ticket-by-Ticket Status and Verification Evidence

| Ticket ID | Feature / Subsystem | Priority | Pre-Sprint Status | Sprint 12 Status | Evidence & Verification Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RS-096`** | Side-by-side keyword evidence locator | P1 | `Not started` | **`Done`** | Implemented deterministic offline locator in `src/components/resume-editor/keyword-evidence-locator.tsx`. Verified verbatim citations, priority tags, multi-occurrence disclosures, grounded suggestions, zero AI calls, and non-destructive navigation. Passed 11 tests in `tests/keyword-locator.test.tsx` and 6 tests in `tests/job-match.test.ts`. |
| **`RS-097`** | Standard JSON Resume import/export (v1.0.0) | P2 | `Not started` | **`Done`** | Implemented standard v1.0.0 mapping in `src/lib/export/json-resume.ts` and UI in `DataPrivacyDialog` / `TemplateSettingsPanel`. Validated 1MB bound, round-trip fidelity, `x-softcv` extensions, and non-destructive cartridge creation. Passed 6 unit tests in `tests/json-resume.test.ts` and 3 UI tests in `tests/json-resume-dialog.test.tsx`. |
| **`RS-172`** | Live Supabase cross-user isolation gate | P0 | `Blocked` | **`Blocked`** *(P0 Release Blocker)* | Re-ran presence-only preflight checks. Docker, Supabase CLI, `.env.local`, and staging credentials remain absent. In accordance with release-gate rules, this ticket remains truthfully BLOCKED. |

---

## 3. Automated Test Suites & Exact Results

### New Test Suites Authored for Sprint 12
1. **`tests/keyword-locator.test.tsx` (11 tests, all passed)**:
   - Renders evidence locator with correct matched and missing counts.
   - Extracts and displays verbatim text excerpts for matched requirements.
   - Correctly renders required vs preferred priority badges.
   - Filters requirements by status (All, Evidenced, Missing).
   - Filters requirements by priority (All, Required, Preferred).
   - Discloses additional match occurrences when a keyword appears across multiple sections.
   - Displays grounded suggestion for missing technical skill without fabricating resume content.
   - Navigates to correct editor section when "Locate Evidence" is clicked.
   - Dispatches safe section navigation for missing requirement without corrupting editor state.
   - Operates with zero network and AI calls.
   - Renders honest ethical guidance advising users not to insert unpossessed skills.
2. **`tests/job-match.test.ts` (6 tests, all passed)**:
   - Evaluates coverage with verbatim excerpts and primary section identification.
   - Generates compact excerpts around matched term.
   - Grounded section inference maps technical skills to skills/projects and degrees to education.
   - Normalizes terms stripping punctuation and diacritics.
   - Handles empty and punctuation-only inputs safely without throwing.
   - Preserves job match scoring formulas across required/preferred weights.
3. **`tests/json-resume.test.ts` (6 tests, all passed)**:
   - Exports SoftCV ResumeDocument into valid, standard JSON Resume v1.0.0 format.
   - Imports representative standard JSON Resume fixture into valid SoftCV ResumeDocument.
   - Preserves all supported fields across round-trip import → export → import.
   - Preserves SoftCV extensions (internships, custom sections, settings) via `x-softcv` block.
   - Rejects files exceeding bounded size limit (1MB).
   - Rejects malformed JSON and unsupported payloads safely without throwing.
4. **`tests/json-resume-dialog.test.tsx` (3 tests, all passed)**:
   - Renders export and import options in DataPrivacyDialog clearly separated from app backup.
   - Previews parsed JSON Resume and imports as a new cartridge upon confirmation.
   - Handles invalid or malformed JSON gracefully with accessible error messages.

### Full Test Suite Execution Summary
- **Total Test Files Passed:** 33 / 33 (100%)
- **Total Tests Passed:** 279 / 279 (100%)
- **Failures / Regressions:** 0

---

## 4. Quality Gate Outcomes

All quality gates specified in Section 5 were run in sequence:

| Quality Gate Command | Exit Code | Result Details |
| :--- | :--- | :--- |
| **`npm test`** | `0` (Pass) | **279 passed across 33 test files** in 24.25s. |
| **`npm run test:smoke`** | `0` (Pass) | **13 passed across 1 file** (9 production journeys validated against local build). |
| **`npm run test:a11y`** | `0` (Pass) | **9 passed across 1 file** (0 critical or serious WCAG 2.2 AA violations). |
| **`npm run typecheck`** | `0` (Pass) | Strict TypeScript check passed with **0 type errors** (`tsc --noEmit`). |
| **`npm run lint`** | `0` (Pass) | **0 errors, 1 warning** (existing `<img>` tag in landing page; zero errors in all edited code). |
| **`npm run build`** | `0` (Pass) | **18 static/dynamic routes compiled successfully** in 4.4s via Next.js Turbopack. |
| **`npm audit --omit=dev`** | `0` (Pass) | **found 0 vulnerabilities**. Zero production dependencies flagged. |
| **`git diff --check`** | `0` (Pass) | **0 whitespace, line-ending, or conflict marker errors**. |

---

## 5. Security Release Gate: RS-172 Status

- **Current Ticket Status:** **`BLOCKED`** (P0 Release Blocker)
- **Presence-Only Audit Results (Non-Sensitive):**
  ```json
  {
    "DOCKER_FOUND": false,
    "SUPABASE_CLI_FOUND": false,
    "ENV_LOCAL_EXISTS": false,
    "URL_EXISTS": false,
    "ANON_EXISTS": false
  }
  ```
- **Explicit RLS Verification Statement:**
  > **Live PostgreSQL Row-Level Security was NOT tested against a real database during this sprint.**  
  > No disposable staging project, credentials, or local containerized database are available in the current environment. While static SQL tests (`docs/supabase/tests/rls_isolation_tests.sql`), client unit tests (11 tests in `tests/supabase-adapter.test.ts`), and invariant unit tests (5 tests in `tests/cloud-invariants.test.ts`) are fully maintained and passing, project governance strictly forbids claiming live RLS compliance based on unit mocks or SQL files alone. `RS-172` remains truthfully marked as **Blocked**.

- **Required Operator Actions to Unblock RS-172:**
  1. Provision a disposable Supabase staging project with no real user data.
  2. Populate `.env.local` with the staging URL and anon key (never committed to git).
  3. Execute `docs/supabase/tests/rls_isolation_tests.sql` via Supabase SQL Editor or `supabase db test`.
  4. Follow the documented two-account browser protocol in `docs/supabase-staging-test.md`.

---

## 6. Known Limitations & Architectural Notes

1. **JSON Resume Schema Semantic Boundaries:**
   - The official JSON Resume specification lacks standard schema properties for complex nested categories (e.g. grouped skill taxonomies, structured internships, custom layout options). SoftCV Studio uses the standard-compliant `x-softcv` extension block to preserve these collections across round trips without breaking standard parsers.
   - Non-standard JSON Resume sections (such as `references` and `volunteer`) are omitted during import and reported to the candidate as explicit mapping notices in the pre-flight verification card.
2. **Deterministic Heuristic Matching Limits:**
   - The Keyword Evidence Locator performs offline token-level and n-gram substring matching enriched with a curated synonym dictionary. It does not perform semantic embedding comparisons or deep semantic inference. Candidates are explicitly informed that keyword matches are heuristic guides and do not guarantee employer ATS acceptance or hiring outcomes.
3. **Template Families:**
   - All 5 core launch templates (Classic ATS, Fresher/Graduate, Modern Editorial, Technical, Experienced) remain fully verified. The Creative/Portfolio template remains deferred to preserve ATS readability.
4. **Rate Limiting:**
   - The in-memory sliding window rate limiter remains bounded (5,000 entries with LRU purge). Redis/distributed caching is recommended before multi-region container deployments.
