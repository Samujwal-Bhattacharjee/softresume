# SoftCV Studio — Sprint 13 Engineering Report

> **Sprint Theme:** Custom Sections & Optional Fields Implementation + Release Hardening  
> **Sprint Execution Date:** `2026-10-23`  
> **Status:** Completed (Product & Quality Gates Verified; Cloud Release Gate Blocked by RS-172)  
> **Lead Engineer / Architect:** Antigravity Full-Stack Systems & QA Lead  
> **Repository:** SoftCV Studio (`resumebuilder`)  
> **Active Design Specification:** Nintendo.com 2001 / Console Chrome (`docs/DESIGN.md`)  
> **Primary Release Constraint:** `RS-172` (Live Supabase Cross-User PostgreSQL RLS Isolation) — Confirmed **P0 BLOCKER**

---

## 1. Summary and Exact Ticket Selected

### Selected Backlog Ticket
- **Ticket ID:** `RS-075`
- **Title:** `Implement custom sections and optional fields`
- **Priority:** `P1`
- **Original Estimate:** `L`
- **Labels:** `frontend`, `data`, `testing`
- **Pre-Sprint Status:** `Not started`
- **Post-Sprint Status:** `Done`

### Original Acceptance Criteria
1. **Empty sections do not render.**
2. **Custom sections have safe labels/content limits.**
3. **Templates can render or omit fields predictably.**

### Selection Rationale & Feasibility Audit
- We evaluated all unfinished tickets in [`docs/BACKLOG.md`](file:///c:/Users/Samujwal/OneDrive/Desktop/resumebuilder/docs/BACKLOG.md) and candidate competitor audit items in [`docs/competitive-audit.md`](file:///c:/Users/Samujwal/OneDrive/Desktop/resumebuilder/docs/competitive-audit.md).
- Tickets `RS-005`, `RS-014`, `RS-035`, `RS-060`, and `RS-172` are recorded as `P0`. `RS-172` is blocked due to the absence of Docker/Supabase staging infrastructure. `RS-060` (pagination) is a P0 ticket rather than P1. `RS-098` (page budgeting) is listed in the competitor audit as P2 and is not an active backlog ticket.
- Among ready, unblocked **P1** backlog tickets (`RS-013`, `RS-016`, `RS-025`, `RS-036`, `RS-061`, `RS-075`, `RS-086`, `RS-087`, `RS-160`, `RS-161`), `RS-075` was selected as the **highest-value feasible unfinished P1 ticket**:
  - It unlocks essential user-facing career document modularity (Certifications, Awards, Volunteering, Publications, and user-defined Custom Sections).
  - It resolves outstanding template and exporter gaps across the 5 production templates.
  - It directly satisfies candidate needs without requiring external paid infrastructure or unconfigured cloud services.

---

## 2. Files Changed and Behavior Implemented

### 1. Canonical Schema & Type System (`src/lib/schemas/resume.ts`)
- Exported `CustomSectionItem` interface and validated `CustomSection` schema with bounds checking.
- Confirmed canonical typing for `CertificationEntry`, `AwardEntry`, `VolunteeringEntry`, `PublicationEntry`, and `CustomSection`.

### 2. Editor Store State & History Engine (`src/lib/resume/editor-store.ts`)
- Implemented full CRUD actions with bounded undo/redo recording:
  - `addCertification`, `updateCertification`, `removeCertification`
  - `addAward`, `updateAward`, `removeAward`
  - `addVolunteering`, `updateVolunteering`, `removeVolunteering`
  - `addPublication`, `updatePublication`, `removePublication`
  - `addCustomSection`, `updateCustomSection`, `removeCustomSection`
  - `addCustomSectionItem`, `updateCustomSectionItem`, `removeCustomSectionItem`
- Implemented strict input sanitization and length bounds:
  - Custom section titles clamped to max 80 characters (`title.slice(0, 80)`).
  - Custom section item descriptions clamped to max 2,000 characters (`description.slice(0, 2000)`).
  - Custom section item titles clamped to max 200 characters.

### 3. Dedicated Console Chrome Editor Modules (`src/components/resume-editor/`)
Created 5 new form modules adhering to Nintendo 2001 / Console Chrome tokens:
- **`certifications-form.tsx`**: Repeatable credentials editor (Name, Issuer organization, Issue date, Expiration date, Credential ID, Verification URL) with accessible IDs and empty-state guidance.
- **`awards-form.tsx`**: Repeatable honors editor (Award title, Date received, Grantor/Issuer, Description) with character bounds.
- **`volunteering-form.tsx`**: Community service editor (Role, Organization, Start/End date, Ongoing checkbox, Contribution bullets) with repeatable bullet management.
- **`publications-form.tsx`**: Academic/industry research editor (Title, Venue/Publisher, Date, Authors, DOI/URL, Description).
- **`custom-sections-form.tsx`**: Flexible custom section builder allowing user-defined headers, dynamic item lists, subtitles, dates, URLs, descriptions, and bullets, complete with live character counters.

### 4. Responsive Editor Navigation Integration (`src/app/resume/[resumeId]/edit/page.tsx`)
- Extended `SECTION_NAV` to 13 distinct modules (`CONTACT`, `SUMMARY`, `EXPERIENCE`, `EDUCATION`, `PROJECTS`, `SKILLS`, `INTERNSHIPS`, `CERTIFICATIONS`, `AWARDS`, `VOLUNTEER`, `PUBLICATIONS`, `CUSTOM`, `ATS REVIEW`).
- Made the section rack module counter dynamic (`{SECTION_NAV.length} MODULES`).
- Added dispatch branches in `SectionEditor` to render all 5 new modules seamlessly alongside existing sections and locator status banners.

### 5. Multi-Template Rendering Parity (`src/components/resume-templates/`)
- **`primitives.tsx`**:
  - Exported `PublicationItem` and `CustomSectionBlock`.
  - Updated `getVisibleSections(doc)` to append any unlisted `doc.customSections` and standard sections while strictly filtering out `hiddenSections`.
  - Added non-empty item checks so that empty sections return `null`.
- **`classic-ats.tsx`**: Added support for `publications` and `customSections` with `hiddenSections` exclusion.
- **`fresher-graduate.tsx`**: Added support for `publications` and `customSections` with `hiddenSections` exclusion.
- **`technical.tsx`**: Added switch cases for `volunteering`, `publications`, and default `customSections`.
- **`experienced.tsx`**: Added switch cases for `publications` and default `customSections`.
- **`modern-editorial.tsx`**: Guaranteed that custom sections with 0 items return `null`.

### 6. Multi-Format Exporter Parity (`src/lib/export/`)
- **`txt-export.ts`**: Expanded `generatePlainTextResume` to export Certifications, Honors & Awards, Volunteering & Community, Publications, and Custom Sections while cleanly omitting empty or hidden ones.
- **`docx-export.ts`**: Expanded `generateDocxBlob` to build formatted headings, metadata runs, and bullet paragraphs for Certifications, Awards, Volunteering, Publications, and Custom Sections.

---

## 3. Tests Added/Changed and What They Prove

### New Automated Test Suite: `tests/custom-sections.test.tsx` (10 tests, 10 passed)
1. **`adds, updates, and removes certifications with undo/redo`**: Proves certifications state updates properly, undo reverts fields cleanly, redo restores them, and deletion purges the entry.
2. **`adds, updates, and removes awards`**: Proves awards CRUD operations work cleanly and preserve draft state.
3. **`adds, updates, and removes volunteering entries`**: Proves volunteering roles, organizations, dates, and repeatable bullets update accurately.
4. **`adds, updates, and removes publications`**: Proves publication entries (venues, authors, URLs) update and delete without residual state.
5. **`creates custom sections with items, enforces bounds, and supports deletion`**: Proves:
   - Custom sections and child items can be created, updated, and removed independently.
   - Title length is strictly bounded to <=80 characters.
   - Description length is strictly bounded to <=2,000 characters.
6. **`omits empty optional sections and empty custom sections across all 5 templates`**: Proves that empty optional sections and custom sections with 0 items **never** render section titles or HTML tags in any of the 5 production templates (`Classic ATS`, `Fresher/Graduate`, `Technical`, `Experienced`, `Modern Editorial`).
7. **`renders populated optional and custom sections in templates`**: Proves populated sections render valid text, dates, links, and subtitles across single-column and technical layouts.
8. **`respects hiddenSections for custom sections and optional fields`**: Proves sections listed in `settings.hiddenSections` are suppressed from the rendered document even when populated with data.
9. **`exports populated optional sections and custom sections into plain text and omits empty ones`**: Proves plain-text resume exports include populated sections with correct formatting and uppercase section titles while omitting empty ones.
10. **`preserves custom sections across JSON Resume export and re-import`**: Proves two-way round-trip fidelity through the `x-softcv` namespace without data degradation.

### Regression Test Suite Hardening (`tests/e2e-journeys.test.ts`)
- Added explicit 20,000ms timeouts to `RS-170` (Fresher Student Journey) and `RS-171` (Experienced Professional Journey) to prevent worker contention timeouts during parallel full-suite vitest runs.

---

## 4. Exact Quality-Gate Commands, Exit Statuses, and Real Totals

| Quality Gate | Command Line | Exit Code | Verified Outcome |
| :--- | :--- | :---: | :--- |
| **Unit & Integration Suite** | `npm test` | **0** | **34 test files passed (34/34)**, **289 tests passed (289/289)**, 0 failed. |
| **Production Smoke Tests** | `npm run test:smoke` | **0** | **1 test file passed (1/1)**, **13 tests passed (13/13)**, 0 failed. |
| **Accessibility Axe Suite** | `npm run test:a11y` | **0** | **1 test file passed (1/1)**, **9 tests passed (9/9)**, 0 critical/serious WCAG 2.2 AA violations. |
| **TypeScript Typecheck** | `npm run typecheck` | **0** | `tsc --noEmit` exited cleanly with 0 type errors. |
| **ESLint Static Analysis** | `npm run lint` | **0** | `eslint` passed with 0 errors (1 preexisting warning for hero img). |
| **Production Build** | `npm run build` | **0** | `next build` compiled cleanly via Turbopack; all 18 static/dynamic routes generated. |
| **Production Audit** | `npm audit --omit=dev` | **0** | **Found 0 vulnerabilities**. |
| **Git Diff Boundary Check**| `git diff --check` | **0** | Clean; no whitespace errors or merge markers. |

---

## 5. Keyword Locator / JSON Resume Regression Review Outcomes

A targeted review was performed over Sprint 12 features (`RS-096` and `RS-097`):
- **RS-096 — Keyword Evidence Locator**:
  - `tests/keyword-locator.test.tsx` (8 passed) and `tests/job-match.test.ts` (6 passed) executed cleanly.
  - Confirmed matched keywords cite real candidate text verbatim.
  - Confirmed missing-keyword suggestions provide grounded section advice and never hallucinate missing skills.
  - Confirmed `navigateToSection` does not alter draft state, break undo/redo, or trigger false autosaves.
- **RS-097 — JSON Resume v1.0.0 Portability**:
  - `tests/json-resume.test.ts` (6 passed) and `tests/json-resume-dialog.test.tsx` (6 passed) executed cleanly.
  - Confirmed 1MB size limit and Zod validation enforce boundaries before persistence.
  - Confirmed import preview validates without mutating existing resumes.
  - Verified round-trip preservation of `customSections`, `internships`, and layout settings via namespaced `x-softcv` blocks in `tests/custom-sections.test.tsx`.

---

## 6. Supabase Preflight (Presence-Only) and RS-172 Status

A strict, presence-only audit was executed:
```json
{
  "DOCKER_FOUND": false,
  "SUPABASE_CLI_FOUND": false,
  "ENV_LOCAL_EXISTS": false,
  "URL_EXISTS": false,
  "ANON_EXISTS": false
}
```
### Findings & Decision
- Neither Docker, Supabase CLI, `.env.local`, nor disposable staging environment URLs are present in the operator environment.
- In strict adherence to Non-Negotiable Constraint #4 ("Never mark RS-172 Done based on mocked/unit tests, a static SQL file, or application-layer ownership checks"), **`RS-172` remains BLOCKED (P0 release blocker)**.
- Local-first demo mode operates completely offline with full privacy guarantees, but cloud multi-tenant isolation cannot be certified without a live staging PostgreSQL instance.

---

## 7. Remaining Risks, Limitations, and Operator Actions

1. **Cloud Multi-Tenant Release Gate (`RS-172`)**:
   - *Risk:* Cross-user data isolation in Supabase Cloud cannot be declared production-ready until live pgTAP tests are run on disposable PostgreSQL infrastructure.
   - *Operator Action:* Provision a disposable Supabase project or local Docker daemon, populate `.env.local`, and follow [`docs/supabase-staging-test.md`](file:///c:/Users/Samujwal/OneDrive/Desktop/resumebuilder/docs/supabase-staging-test.md).
2. **Process-Local AI Rate Limiting (`RS-086`)**:
   - *Risk:* Token bucket rate limiting is implemented in-memory (`src/lib/ai/rate-limiter.ts`). In multi-instance serverless deployments without sticky sessions, burst thresholds could be exceeded across separate container instances.
   - *Operator Action:* Document single-instance or edge-sticky requirements, or attach an external Redis store if horizontal auto-scaling is introduced in future sprints.
3. **Deferred Creative/Portfolio Template**:
   - *Status:* Remains deferred by design to protect ATS parse-safety constraints.

---

## 8. Backlog Status Changes

| Ticket ID | Title | Priority | Previous Status | Updated Status | Rationale |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`RS-075`** | **Implement custom sections and optional fields** | **P1** | `Not started` | **`Done`** | Full editor UI, state management, safety bounds, template rendering parity, export parity, and 10 passing tests in `tests/custom-sections.test.tsx`. |
| **`RS-172`** | **Run cross-user privacy and security tests** | **P0** | `Blocked` | **`Blocked`** | Preserved as P0 release blocker. Staging PostgreSQL environment remains unavailable. |
| **`RS-096`** | **Side-by-side keyword evidence locator** | **P1** | `Done` | **`Done`** | Confirmed 0 regressions during Sprint 13 verification passes. |
| **`RS-097`** | **Standard JSON Resume import/export (v1.0.0)** | **P2** | `Done` | **`Done`** | Confirmed 0 regressions; extended roundtrip support for custom sections in `x-softcv`. |

---

*Report certified by SoftCV Studio Engineering Lead — 2026-10-23.*
