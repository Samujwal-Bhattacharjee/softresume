# Resume Studio — Product & Engineering Backlog

> Companion to [`PLAN.md`](./PLAN.md).  
> Backlog status at creation: **Not started** unless noted otherwise.  
> Estimate scale: **XS** (< half-day), **S** (about 0.5–1 day), **M** (about 2–3 days), **L** (about 4–6 days), **XL** (larger than one week or needs a spike). Estimates are relative, not delivery promises.  
> Priority: **P0** release blocker, **P1** MVP-critical, **P2** valuable after core MVP, **P3** later/experimental.  
> Labels: `frontend`, `backend`, `ai`, `design`, `data`, `security`, `accessibility`, `export`, `testing`, `docs`, `ops`, `research`.

---

## 0. How to use this backlog

1. Build in dependency order, not just in numerical order.
2. Keep MVP scope bounded. Do not start V2 import, public sharing, academic CV, or application tracking before the main create → edit → save → check → export workflow is reliable.
3. Every ticket needs acceptance criteria, tests, and an explicit definition of done.
4. Estimates assume one developer familiar with React/TypeScript; revise after the first export and database spikes.
5. Mark work `Blocked` when a dependency or decision is unresolved. Do not hide uncertainty inside a task estimate.
6. Use synthetic fixtures in tests and demos. Do not commit a real person's resume.
7. If the implementation changes materially from `PLAN.md`, update the plan and architecture notes in the same pull request.

### Suggested status values

- `Not started`
- `Ready`
- `In progress`
- `Blocked`
- `In review`
- `Done`
- `Deferred`

### MVP release gate

Do not call the product MVP-complete until every P0/P1 issue tagged `MVP` is Done, the release acceptance checklist passes, and PDF/DOCX behavior is verified using actual exported files.

---

## EPIC 00 — Product definition and technical decisions

### RS-001 — Finalize product brief and target user journeys
- **Priority:** P0 | **Estimate:** S | **Labels:** `research`, `docs` | **Status:** Not started
- **Description:** Consolidate product vision, personas, core journey, goals, non-goals, and MVP scope in `PLAN.md`.
- **Acceptance criteria:**
  - Student/fresher and experienced-professional user journeys are written down.
  - MVP and deferred features are explicit.
  - ATS limitations and AI truth-preservation principles are documented.
  - The plan has an open-decisions list.
- **Dependencies:** None.

### RS-002 — Review competitor workflow patterns
- **Priority:** P1 | **Estimate:** S | **Labels:** `research`, `docs` | **Status:** Not started
- **Description:** Review FlowCV, Teal, Kickresume, Reactive Resume, Resume.io and Canva, documenting feature patterns to learn from rather than copying proprietary designs.
- **Acceptance criteria:**
  - Record onboarding, editor, templates, export, job tailoring, AI, and pricing observations where publicly visible.
  - Record the review date and official URL for every observation.
  - Distinguish verified public features from assumptions.
- **Dependencies:** RS-001.

### RS-003 — Decide brand name and domain strategy
- **Priority:** P2 | **Estimate:** XS | **Labels:** `research`, `design` | **Status:** Not started
- **Description:** Treat “SoftCV Studio” as working name until availability and branding are checked.
- **Acceptance criteria:**
  - Shortlist of names and domain availability checked.
  - Basic search/trademark-conflict check performed before public use.
  - Brand chosen or working name explicitly retained for development only.
- **Dependencies:** None.

### RS-004 — Create architecture decision records (ADRs)
- **Priority:** P1 | **Estimate:** S | **Labels:** `docs`, `backend`, `export` | **Status:** Not started
- **Description:** Record why the product uses a single resume schema, selected export route, selected AI provider abstraction, and selected storage model.
- **Acceptance criteria:**
  - At least one ADR exists for PDF generation and one for canonical resume schema.
  - Trade-offs, alternatives, and rollback/revisit triggers are documented.
- **Dependencies:** RS-001, RS-009, RS-010.

### RS-005 — Define MVP release acceptance checklist
- **Priority:** P0 | **Estimate:** XS | **Labels:** `testing`, `docs` | **Status:** Not started
- **Description:** Make a release gate from the launch checklist in `PLAN.md`.
- **Acceptance criteria:**
  - Includes product journey, PDF/DOCX, data isolation, AI safety, accessibility and operations.
  - Each item has a clear owner or a repeatable test.
- **Dependencies:** RS-001.

---

## EPIC 01 — Repository foundation, quality gates and environments

### RS-010 — Scaffold the application
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `ops` | **Status:** Not started
- **Description:** Create the Next.js + TypeScript application with strict type checking and predictable route/component structure.
- **Acceptance criteria:**
  - Local development and production builds work.
  - TypeScript strict mode is enabled or deviations are documented.
  - No API secret is included in browser code.
  - `.env.example` contains names and placeholder values only.
- **Dependencies:** RS-001.

### RS-011 — Configure formatting, linting and type checks
- **Priority:** P0 | **Estimate:** S | **Labels:** `ops`, `testing` | **Status:** Not started
- **Description:** Set up ESLint, formatting, type-check scripts and consistent import conventions.
- **Acceptance criteria:**
  - Documented scripts run locally.
  - CI fails on lint/type errors.
  - Generated or third-party files are excluded appropriately.
- **Dependencies:** RS-010.

### RS-012 — Configure unit and component test framework
- **Priority:** P0 | **Estimate:** M | **Labels:** `testing`, `ops` | **Status:** Not started
- **Description:** Configure Vitest and React Testing Library.
- **Acceptance criteria:**
  - A sample component and utility test run in CI.
  - Coverage reporting is available, even if an aggressive threshold is deferred until meaningful tests exist.
- **Dependencies:** RS-010.

### RS-013 — Configure Playwright end-to-end tests
- **Priority:** P1 | **Estimate:** M | **Labels:** `testing`, `ops` | **Status:** Not started
- **Description:** Add browser-based tests for the main flows and later PDF/DOCX export verification.
- **Acceptance criteria:**
  - Chromium test can start the app and exercise a sample route.
  - Tests can use deterministic synthetic fixture data.
  - CI artifacts contain useful failure screenshots/traces without leaking personal data.
- **Dependencies:** RS-010.

### RS-014 — Create CI pipeline
- **Priority:** P0 | **Estimate:** M | **Labels:** `ops`, `testing` | **Status:** Not started
- **Description:** Run lint, type-check, unit tests and build on pull requests; add applicable integration/E2E jobs as the environment is ready.
- **Acceptance criteria:**
  - Pull request fails for a broken required check.
  - Secrets are stored only in the CI secret manager.
  - Migrations/tests cannot accidentally target production from a pull-request job.
- **Dependencies:** RS-011, RS-012.

### RS-015 — Configure environment validation and secret handling
- **Priority:** P0 | **Estimate:** S | **Labels:** `security`, `ops` | **Status:** Not started
- **Description:** Validate required environment variables and separate public browser configuration from server secrets.
- **Acceptance criteria:**
  - App fails clearly when required server configuration is missing.
  - Private API/database keys cannot be imported by client components.
  - `.env.example` and setup docs stay synchronized.
- **Dependencies:** RS-010.

### RS-016 — Set up preview, staging and production deployment conventions
- **Priority:** P1 | **Estimate:** M | **Labels:** `ops`, `docs` | **Status:** Not started
- **Description:** Define environment separation, migration procedure, preview deployments and rollback/forward-fix procedure.
- **Acceptance criteria:**
  - Environments do not share credentials accidentally.
  - Database migration process is documented.
  - Demo/staging use synthetic resume content.
- **Dependencies:** RS-014, RS-015.

---

## EPIC 02 — Product UX, soft-club design system and accessibility

### RS-020 — Define design tokens and theme modes
- **Priority:** P0 | **Estimate:** M | **Labels:** `design`, `frontend`, `accessibility` | **Status:** Not started
- **Description:** Implement the palette, spacing, radius, shadow, type scale and light/dark theme system.
- **Acceptance criteria:**
  - Tokens include warm off-white `#F7F5F4`, dark text `#201E28`, lavender `#C8BFFF`, blue `#BEE9F2`, pink `#F3C6D8`, and dark surface `#24222F` as initial candidates.
  - Text/control contrast is checked and corrected where needed.
  - The theme is not dependent on hard-coded colors scattered across components.
- **Dependencies:** RS-010.

### RS-021 — Build accessible UI primitives
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `design`, `accessibility` | **Status:** Not started
- **Description:** Establish form inputs, buttons, dialogs, menus, tabs, banners, tooltips, cards, status indicators and toasts using a consistent component library.
- **Acceptance criteria:**
  - Keyboard focus is visible.
  - Controls have accessible names and states.
  - Validation errors are associated with their fields.
  - Color is not the sole status indicator.
- **Dependencies:** RS-020.

### RS-022 — Build soft-club landing page
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design` | **Status:** Not started
- **Description:** Create a polished public homepage with a clear product promise and a primary create-resume action.
- **Acceptance criteria:**
  - Uses subtle gradients, retro window details and controlled motion.
  - Avoids excessive glass effects and decorative clutter.
  - Mobile layout works and reduced-motion setting is honored.
  - Product claims describe implemented features only.
- **Dependencies:** RS-020, RS-021.

### RS-023 — Build dashboard and empty states
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design` | **Status:** Not started
- **Description:** Display resumes, saved versions, recent work and clear create/import actions.
- **Acceptance criteria:**
  - Empty state explains how to begin.
  - Resume cards show title and last-updated metadata, not unnecessary sensitive preview text.
  - Duplicate/delete actions have clear confirmation and error states.
- **Dependencies:** RS-021, RS-030, RS-031.

### RS-024 — Build responsive editor shell
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `design`, `accessibility` | **Status:** Not started
- **Description:** Implement editor navigation, section panel, preview panel, context tools and persistent save/export status.
- **Acceptance criteria:**
  - Desktop provides editor and preview side-by-side or in a clear split layout.
  - Mobile has Edit/Preview tabs and no required horizontal scrolling.
  - Focus order is logical.
  - Saving/saved/error statuses are announced accessibly.
- **Dependencies:** RS-021, RS-040.

### RS-025 — Add reduced-motion and responsive behavior tests
- **Priority:** P1 | **Estimate:** M | **Labels:** `accessibility`, `testing`, `frontend` | **Status:** Not started
- **Description:** Check mobile widths, zoom/reflow, keyboard flow and reduced-motion behavior.
- **Acceptance criteria:**
  - Key flows pass at target mobile/desktop viewport widths.
  - Animation is reduced/removed when requested.
  - No critical action is hover-only.
- **Dependencies:** RS-022, RS-024.

### RS-026 — Add accessibility audits
- **Priority:** P1 | **Estimate:** M | **Labels:** `accessibility`, `testing` | **Status:** Not started
- **Description:** Add automated axe checks and manual keyboard/screen-reader reviews for the landing page, editor and dialogs.
- **Acceptance criteria:**
  - No unresolved critical/serious automated issue in release-critical routes.
  - Manual checklist is recorded because automation alone is insufficient.
- **Dependencies:** RS-021, RS-024.

---

## EPIC 03 — Resume schema, state and data integrity

### RS-030 — Define canonical versioned resume schema
- **Priority:** P0 | **Estimate:** L | **Labels:** `data`, `backend`, `testing` | **Status:** Not started
- **Description:** Define TypeScript types and runtime validation for basics, summary, experience, education, projects, skills and extensible sections.
- **Acceptance criteria:**
  - Schema includes `schemaVersion` and stable IDs for repeatable items.
  - Optional fields are supported without blank labels.
  - Input length/size limits are defined.
  - Fixtures cover freshers, experienced users, career switchers and multi-page data.
  - Schema is independent of template selection.
- **Dependencies:** RS-001, RS-010.

### RS-031 — Create schema migration framework
- **Priority:** P1 | **Estimate:** M | **Labels:** `data`, `backend`, `testing` | **Status:** Not started
- **Description:** Support future schema evolution with documented migrations and tests.
- **Acceptance criteria:**
  - Old fixtures can be upgraded to the current schema.
  - Migration behavior is deterministic.
  - Invalid old data produces a recoverable error/report rather than silent data loss.
- **Dependencies:** RS-030.

### RS-032 — Define editor draft-state model
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `data`, `testing` | **Status:** Not started
- **Description:** Separate local edit state from persisted state; decide how undo/redo and autosave interact.
- **Acceptance criteria:**
  - Changes do not mutate canonical data unexpectedly.
  - Original text remains available during AI suggestions.
  - Save conflicts and stale edits have a documented initial policy.
- **Dependencies:** RS-030.

### RS-033 — Implement repeatable section primitives
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `data`, `testing` | **Status:** Not started
- **Description:** Shared add/edit/remove/duplicate behavior for experience, education, projects, skills and other repeatable entries.
- **Acceptance criteria:**
  - Stable IDs preserve entry identity when reordered.
  - Deletion has confirmation or immediate undo for recovery.
  - Optional fields and empty lists render correctly.
- **Dependencies:** RS-030, RS-032.

### RS-034 — Implement section reorder/hide/rename
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `accessibility`, `testing` | **Status:** Not started
- **Description:** Let users reorder, hide and rename supported sections.
- **Acceptance criteria:**
  - Reordering works with mouse and keyboard.
  - Hidden sections remain saved but are omitted from export.
  - Order is represented in data/settings and survives refresh/template changes.
- **Dependencies:** RS-033, RS-050.

### RS-035 — Define master and tailored resume lineage
- **Priority:** P0 | **Estimate:** M | **Labels:** `data`, `backend`, `testing` | **Status:** Not started
- **Description:** Define how a master resume and each job-specific copy relate, including duplicate behavior.
- **Acceptance criteria:**
  - Editing a tailored copy cannot silently alter the master.
  - User can identify which master/version a tailored copy originated from.
  - Copy behavior is tested for nested/repeatable sections.
- **Dependencies:** RS-030, RS-040.

### RS-036 — Implement draft validation and safe limits
- **Priority:** P1 | **Estimate:** M | **Labels:** `data`, `frontend`, `security` | **Status:** Not started
- **Description:** Validate email/URL/date shapes, input lengths and payload size while allowing reasonable international characters and valid variations.
- **Acceptance criteria:**
  - Error messages explain how to fix invalid data.
  - No silent truncation of user text.
  - Long/Unicode/special characters are tested.
- **Dependencies:** RS-030.

---

## EPIC 04 — Authentication, database and privacy controls

### RS-040 — Configure Supabase Auth
- **Priority:** P0 | **Estimate:** M | **Labels:** `backend`, `security` | **Status:** Not started
- **Description:** Add sign-in, sign-out, session handling and account recovery flow according to the selected authentication approach.
- **Acceptance criteria:**
  - Protected routes require a valid session.
  - Session handling works through refresh/reopen.
  - Error states do not expose secrets or internal stack traces.
- **Dependencies:** RS-015, RS-010.

### RS-041 — Create database tables and migrations
- **Priority:** P0 | **Estimate:** L | **Labels:** `backend`, `data`, `security` | **Status:** Not started
- **Description:** Create profiles, resumes and any minimum metadata needed for versions and job-target association.
- **Acceptance criteria:**
  - Migrations are committed and repeatable.
  - Ownership columns/relationships are explicit.
  - Indexes support common owner/updated-time queries.
  - No unnecessary duplicated personal information is stored.
- **Dependencies:** RS-030, RS-040.

### RS-042 — Implement RLS and server authorization
- **Priority:** P0 | **Estimate:** L | **Labels:** `security`, `backend`, `testing` | **Status:** Not started
- **Description:** Implement Row Level Security and server-side ownership checks for every private record operation.
- **Acceptance criteria:**
  - A user cannot read/update/delete another user's resume by changing an ID.
  - Client-side filtering is never the only authorization control.
  - Tests cover authenticated, unauthenticated and cross-user access.
- **Dependencies:** RS-041.

### RS-043 — Implement data export and delete controls
- **Priority:** P1 | **Estimate:** M | **Labels:** `security`, `backend`, `frontend` | **Status:** Not started
- **Description:** Let users export stored resume data and permanently delete resume/account data in line with the defined retention policy.
- **Acceptance criteria:**
  - User can download a structured backup or use the available export flow.
  - Delete action requires clear confirmation.
  - Deletion behavior is documented for database rows, files, logs and backups.
  - Tests verify data is no longer accessible after deletion.
- **Dependencies:** RS-041, RS-042, RS-090.

### RS-044 — Add privacy/AI disclosure copy
- **Priority:** P1 | **Estimate:** S | **Labels:** `security`, `docs`, `design` | **Status:** Not started
- **Description:** Explain what data is stored and when resume/job text is sent to an AI provider.
- **Acceptance criteria:**
  - Disclosure is visible near AI-related actions and linked from privacy settings.
  - Copy accurately describes actual provider/data handling.
  - Do not claim data is never stored/used by a provider unless verified by current provider terms/settings.
- **Dependencies:** RS-070, RS-091.

### RS-045 — Scrub PII from logs and analytics
- **Priority:** P0 | **Estimate:** M | **Labels:** `security`, `ops` | **Status:** Not started
- **Description:** Define safe logging patterns for errors, AI requests, exports and product analytics.
- **Acceptance criteria:**
  - Resume content, phone, email and raw job descriptions are not added to analytics events.
  - Error reports scrub request bodies and credentials.
  - Logging rules are documented and tested with sample payloads.
- **Dependencies:** RS-014, RS-070.

---

## EPIC 05 — Template engine and live preview

### RS-050 — Design template rendering contract
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `data`, `docs` | **Status:** Not started
- **Description:** Define template metadata, supported options, render interface, page settings and validation status.
- **Acceptance criteria:**
  - Each template consumes the canonical resume schema and style settings.
  - Template config is separate from resume content.
  - New templates can be added without duplicating editor forms.
  - Unknown settings fall back safely.
- **Dependencies:** RS-030.

### RS-051 — Build shared resume rendering primitives
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `export`, `testing` | **Status:** Not started
- **Description:** Build semantic components for headings, dates, experience entries, bullets, links, skills and page layout.
- **Acceptance criteria:**
  - Semantic text order is explicit.
  - Optional data does not produce empty labels.
  - Long URLs and bullets wrap safely.
  - Styles work in screen and print contexts.
- **Dependencies:** RS-050.

### RS-052 — Implement Classic ATS template
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `export`, `testing` | **Status:** Not started
- **Description:** Build conservative single-column black/white layout with standard section names and no decorative charts.
- **Acceptance criteria:**
  - Includes basic contact information in document body.
  - No text-only information exists solely in icons/graphics.
  - PDF text order passes the initial test suite.
- **Dependencies:** RS-051.

### RS-053 — Implement Modern Editorial template
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design`, `export` | **Status:** Not started
- **Description:** Build a restrained accent-color layout with refined typography and subtle dividers.
- **Acceptance criteria:**
  - Uses the same semantic sections as the schema.
  - Remains readable in grayscale/printed form.
  - Long content is tested.
- **Dependencies:** RS-051.

### RS-054 — Implement Fresher / Graduate template
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `design`, `export` | **Status:** Not started
- **Description:** Build a student-first version supporting education, projects, coursework, internships, clubs and hackathons.
- **Acceptance criteria:**
  - Supports education-first defaults without preventing user reordering.
  - Omits employment sections cleanly if empty.
  - Supports project links and technologies.
- **Dependencies:** RS-051, RS-052.

### RS-055 — Implement Technical / Project-First template
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design`, `export` | **Status:** Not started
- **Description:** Emphasize project descriptions, technologies, contribution details and repository/demo URLs.
- **Acceptance criteria:**
  - Links remain readable in exported documents.
  - Technology lists do not overflow the page.
  - Project and experience content keeps a sensible reading order.
- **Dependencies:** RS-051.

### RS-056 — Implement Experienced Professional template
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design`, `export` | **Status:** Not started
- **Description:** Give relevant experience, scope, leadership and achievements sufficient room; handle multiple pages.
- **Acceptance criteria:**
  - Multi-page output is supported.
  - No content is silently cut to force one page.
  - Date/title/company relationships remain clear.
- **Dependencies:** RS-051, RS-060.

### RS-057 — Implement Creative / Portfolio template
- **Priority:** P2 | **Estimate:** L | **Labels:** `frontend`, `design`, `export` | **Status:** Not started
- **Description:** Provide a visually distinctive template for designers, filmmakers and creative roles.
- **Acceptance criteria:**
  - Portfolio URL and selected work are supported.
  - UI labels its layout characteristics and ATS validation status accurately.
  - It is never described as universally ATS-safe without supporting tests.
- **Dependencies:** RS-051, RS-060.

### RS-058 — Build template gallery and preview switching
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design`, `testing` | **Status:** Not started
- **Description:** Let users preview and switch template families without data loss.
- **Acceptance criteria:**
  - Switching templates preserves all semantic resume content.
  - Template previews use synthetic sample data and are labelled as examples.
  - Template choice persists across sessions.
- **Dependencies:** RS-052, RS-053, RS-054, RS-055, RS-056.

### RS-059 — Implement font and style presets
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design`, `export` | **Status:** Not started
- **Description:** Offer curated Clean, Corporate, Editorial and Classic Serif font presets, plus accent and spacing settings with safe bounds.
- **Acceptance criteria:**
  - Font fallback behavior is defined and tested.
  - Small-font warnings are triggered below the chosen readability threshold.
  - Settings apply consistently to preview and export.
- **Dependencies:** RS-051.

### RS-060 — Implement pagination and overflow warnings
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `export`, `testing` | **Status:** Not started
- **Description:** Handle page boundaries, avoid orphaned headings where possible, and detect overflow/near-empty pages.
- **Acceptance criteria:**
  - Long content flows to subsequent pages rather than disappearing.
  - User receives a warning for unexpectedly empty extra pages or extreme density.
  - A4 and US Letter page settings are supported.
- **Dependencies:** RS-051.

### RS-061 — Implement role presets for section order
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `data`, `testing` | **Status:** Not started
- **Description:** Add role presets for software, AI/ML, cloud/DevOps, data, product, UI/UX, finance/consulting, sales/customer success, research and creative work.
- **Acceptance criteria:**
  - Presets change recommended order/prompts, not schema shape.
  - User can override all preset choices.
  - Fresher and experienced defaults differ appropriately.
- **Dependencies:** RS-034, RS-050.

---

## EPIC 06 — Editing UX and persistence

### RS-070 — Implement profile and resume CRUD
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `backend`, `data`, `testing` | **Status:** Not started
- **Description:** Create, load, rename, duplicate and delete a resume.
- **Acceptance criteria:**
  - All operations enforce ownership.
  - Empty/error/loading states are present.
  - Duplicate resumes have independent IDs and content.
- **Dependencies:** RS-041, RS-042, RS-032.

### RS-071 — Implement autosave with explicit states
- **Priority:** P0 | **Estimate:** L | **Labels:** `frontend`, `backend`, `testing` | **Status:** Not started
- **Description:** Debounced save with visible saving/saved/error states and conflict protection.
- **Acceptance criteria:**
  - “Saved” appears only after persistence succeeds.
  - Failed writes preserve local draft and provide retry guidance.
  - Stale saves cannot silently overwrite newer content.
  - Refresh/reopen recovers committed data.
- **Dependencies:** RS-070, RS-032.

### RS-072 — Implement undo/redo or reliable field-level recovery
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `testing` | **Status:** Not started
- **Description:** Let users recover from accidental edits, deletions and AI suggestion acceptance.
- **Acceptance criteria:**
  - Undo/redo scope is documented.
  - AI acceptance can be undone.
  - Large state history is bounded to avoid unbounded memory usage.
- **Dependencies:** RS-032, RS-071.

### RS-073 — Implement mobile edit/preview tabs
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `accessibility`, `testing` | **Status:** Not started
- **Description:** Make editing and checking the resume practical on small screens.
- **Acceptance criteria:**
  - Edit and Preview tabs preserve in-progress changes.
  - Download and save state remain discoverable.
  - No required controls are only available on hover.
- **Dependencies:** RS-024, RS-071.

### RS-074 — Implement resume duplication into a job-specific copy
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `data`, `testing` | **Status:** Not started
- **Description:** Start a tailored copy from a selected master or existing version.
- **Acceptance criteria:**
  - Master and derived versions are independent.
  - Copy lineage is stored.
  - User can rename the copy and associate a job target later.
- **Dependencies:** RS-035, RS-070.

### RS-075 — Implement custom sections and optional fields
- **Priority:** P1 | **Estimate:** L | **Labels:** `frontend`, `data`, `testing` | **Status:** Not started
- **Description:** Support additional sections such as volunteering, awards, certifications, leadership, languages and custom user-defined content.
- **Acceptance criteria:**
  - Empty sections do not render.
  - Custom sections have safe labels/content limits.
  - Templates can render or omit fields predictably.
- **Dependencies:** RS-030, RS-033, RS-051.

---

## EPIC 07 — AI provider integration and AI safety

### RS-080 — Choose AI provider and define provider abstraction
- **Priority:** P0 | **Estimate:** M | **Labels:** `ai`, `research`, `backend`, `security` | **Status:** Not started
- **Description:** Compare available providers for structured outputs, quality, cost, privacy controls and target-region availability; isolate provider logic behind an internal interface.
- **Acceptance criteria:**
  - Provider choice and date are documented.
  - API calls happen server-side only.
  - Timeouts, retries and provider failures are defined.
  - Provider can be changed without rewriting feature-level UI.
- **Dependencies:** RS-015, RS-001.

### RS-081 — Define AI response schemas and validators
- **Priority:** P0 | **Estimate:** M | **Labels:** `ai`, `data`, `testing` | **Status:** Not started
- **Description:** Create validated output shapes for bullet suggestions, summary suggestions, job requirements and explanations.
- **Acceptance criteria:**
  - Invalid model output is caught and handled safely.
  - UI never trusts arbitrary model markup/code.
  - Fallback errors are user-friendly.
- **Dependencies:** RS-030, RS-080.

### RS-082 — Implement AI bullet-point improver
- **Priority:** P0 | **Estimate:** L | **Labels:** `ai`, `frontend`, `backend`, `testing` | **Status:** Not started
- **Description:** Rewrite one bullet while preserving truth, with concise explanations and missing-fact questions.
- **Acceptance criteria:**
  - Original bullet remains available.
  - User can accept, edit or reject suggestion.
  - No new metric/claim is inserted without evidence.
  - Request length limits and rate limits exist.
  - Loading, timeout, provider-error and retry states exist.
- **Dependencies:** RS-080, RS-081, RS-032, RS-045.

### RS-083 — Implement AI summary helper
- **Priority:** P1 | **Estimate:** M | **Labels:** `ai`, `frontend`, `backend` | **Status:** Not started
- **Description:** Suggest a summary based only on the user's provided experience, skills and target context.
- **Acceptance criteria:**
  - Summary is editable and optional.
  - No unsupported credentials, seniority or results are added.
  - The UI displays the evidence/context used in a concise explanation.
- **Dependencies:** RS-082.

### RS-084 — Implement prompt-injection and untrusted-input protection
- **Priority:** P0 | **Estimate:** M | **Labels:** `ai`, `security`, `testing` | **Status:** Not started
- **Description:** Ensure pasted job descriptions and imported documents are treated as data, not instructions to the assistant.
- **Acceptance criteria:**
  - Instructions embedded in a sample job description do not alter the tool's safety behavior.
  - Only intended structured fields are returned/rendered.
  - Adversarial fixtures exist in tests.
- **Dependencies:** RS-080, RS-081.

### RS-085 — Create AI evaluation fixture set
- **Priority:** P0 | **Estimate:** L | **Labels:** `ai`, `testing`, `docs` | **Status:** Not started
- **Description:** Create synthetic/anonymized test examples to measure factual preservation, role relevance, concision, schema validity and latency/cost.
- **Acceptance criteria:**
  - Includes fresher, experienced, technical, non-technical, incomplete and adversarial examples.
  - Includes examples where missing evidence should cause a question rather than an invented result.
  - Evaluation criteria and thresholds are documented.
- **Dependencies:** RS-081, RS-082.

### RS-086 — Add AI cost, rate-limit and usage handling
- **Priority:** P1 | **Estimate:** M | **Labels:** `ai`, `backend`, `ops`, `security` | **Status:** Not started
- **Description:** Add per-user/IP limits as appropriate, token/input limits, cancellation, timeout handling and cost telemetry without storing resume content.
- **Acceptance criteria:**
  - Requests are bounded in size and frequency.
  - Errors give an understandable retry path.
  - Telemetry does not log raw prompts or personal resume text.
- **Dependencies:** RS-080, RS-045.

### RS-087 — Implement suggestion history and acceptance state
- **Priority:** P1 | **Estimate:** M | **Labels:** `ai`, `data`, `frontend`, `testing` | **Status:** Not started
- **Description:** Track pending/accepted/edited/rejected status with minimal necessary metadata.
- **Acceptance criteria:**
  - User can compare original and proposed text.
  - State remains associated with the correct resume field/version.
  - Rejecting a suggestion does not alter the resume.
- **Dependencies:** RS-082, RS-071.

---

## EPIC 08 — Job description analysis and role coaching

### RS-090 — Define job target data model
- **Priority:** P1 | **Estimate:** M | **Labels:** `data`, `backend`, `testing` | **Status:** Not started
- **Description:** Store a job title/company label, pasted description, extracted requirements, timestamps and association to a tailored resume.
- **Acceptance criteria:**
  - Data is private and user-owned.
  - Input retention and deletion behavior are documented.
  - Large descriptions are limited safely.
- **Dependencies:** RS-041, RS-042.

### RS-091 — Build job description requirement extractor
- **Priority:** P1 | **Estimate:** L | **Labels:** `ai`, `backend`, `testing` | **Status:** Not started
- **Description:** Extract required/preferred skills, qualifications, responsibilities and relevant phrases from pasted job text.
- **Acceptance criteria:**
  - Output follows a validated schema.
  - Duplicates and low-confidence requirements are handled.
  - Job text is treated as untrusted input.
  - User can correct extracted requirements.
- **Dependencies:** RS-081, RS-084, RS-090.

### RS-092 — Implement transparent skill/keyword coverage
- **Priority:** P1 | **Estimate:** L | **Labels:** `ai`, `backend`, `frontend`, `testing` | **Status:** Not started
- **Description:** Compare job requirements with explicit evidence in resume content, including a maintainable synonym map.
- **Acceptance criteria:**
  - Required and preferred criteria are distinguishable.
  - Matched evidence points to a resume field/bullet where possible.
  - Missing and weakly evidenced requirements are labelled accurately.
  - Result is described as heuristic coverage, not an employer ATS score.
- **Dependencies:** RS-091, RS-030.

### RS-093 — Implement role-specific coaching presets
- **Priority:** P1 | **Estimate:** L | **Labels:** `ai`, `data`, `frontend`, `testing` | **Status:** Not started
- **Description:** Add prompt/criteria presets for software, AI/ML, cloud/DevOps, data, product, UI/UX, finance/consulting, sales/customer success, research and creative roles.
- **Acceptance criteria:**
  - Each preset has documented evidence expectations and sample prompts.
  - Presets never require fabricated metrics.
  - User can change the target role at any time.
- **Dependencies:** RS-061, RS-082, RS-092.

### RS-094 — Implement job-specific resume copy workflow
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `data`, `testing` | **Status:** Not started
- **Description:** Allow user to create a tailored resume copy from a job target and review recommended changes.
- **Acceptance criteria:**
  - Recommendations are proposed, not auto-applied in bulk.
  - Master resume remains unchanged.
  - User can see the target job and copy lineage.
- **Dependencies:** RS-074, RS-090, RS-092.

### RS-095 — Add explanation for check scores/indicators
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `ai`, `design`, `testing` | **Status:** Not started
- **Description:** Explain criteria behind each readiness and keyword indicator.
- **Acceptance criteria:**
  - Every numeric heuristic can be expanded to view the counted criteria.
  - No guarantee of passing ATS/employer screening is implied.
  - Distinct assessments for parsing, job match and content quality remain visually separate.
- **Dependencies:** RS-100, RS-092.

---

## EPIC 09 — ATS/readiness/content checks

### RS-100 — Define rule-based parse-readiness engine
- **Priority:** P0 | **Estimate:** L | **Labels:** `backend`, `testing`, `export` | **Status:** Not started
- **Description:** Implement deterministic checks for section names, contact detail availability/placement, layout risk flags and common formatting problems.
- **Acceptance criteria:**
  - Rule names, severities and explanations are explicit.
  - Rules do not claim to emulate a specific proprietary ATS.
  - Results can be tested from deterministic fixture data.
- **Dependencies:** RS-030, RS-050.

### RS-101 — Implement content completeness checks
- **Priority:** P1 | **Estimate:** M | **Labels:** `backend`, `frontend`, `testing` | **Status:** Not started
- **Description:** Flag potentially missing contact links, dates, role details, education or relevant supporting sections without making every section mandatory.
- **Acceptance criteria:**
  - Findings vary by selected role/experience context.
  - Optional sections are not reported as errors by default.
  - Every issue has a reason and recommended fix.
- **Dependencies:** RS-030, RS-061.

### RS-102 — Implement writing-quality checks
- **Priority:** P1 | **Estimate:** M | **Labels:** `ai`, `backend`, `frontend`, `testing` | **Status:** Not started
- **Description:** Provide clarity, consistency, duplicate wording, date consistency and action/evidence prompts.
- **Acceptance criteria:**
  - Suggestions distinguish objective rule failures from subjective writing guidance.
  - No unsupported metrics are proposed as existing facts.
  - User can ignore subjective suggestions.
- **Dependencies:** RS-082, RS-100.

### RS-103 — Build readiness results panel
- **Priority:** P0 | **Estimate:** M | **Labels:** `frontend`, `design`, `accessibility` | **Status:** Not started
- **Description:** Display parse-readiness, content quality and job-match findings as three distinct assessments.
- **Acceptance criteria:**
  - Findings use text, icons and clear labels rather than color alone.
  - Each issue links to the relevant field or explains how to locate it.
  - Wording avoids “guaranteed ATS pass” claims.
- **Dependencies:** RS-100, RS-101, RS-092.

### RS-104 — Add page density and overflow recommendations
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `export`, `testing` | **Status:** Not started
- **Description:** Surface extreme density, tiny font, excessive whitespace, orphan-like headings and unexpectedly blank pages.
- **Acceptance criteria:**
  - Warnings do not automatically delete or shrink content.
  - User can navigate to settings/content to address the issue.
  - Works for both page sizes.
- **Dependencies:** RS-060, RS-059.

---

## EPIC 10 — PDF export and verification

### RS-110 — Run PDF generation technical spike
- **Priority:** P0 | **Estimate:** L | **Labels:** `export`, `research`, `testing` | **Status:** Not started
- **Description:** Compare browser print and server-side Playwright/Chromium using actual templates and representative content; document whether a separate PDF renderer is justified.
- **Acceptance criteria:**
  - Test A4 and US Letter.
  - Test long, short, Unicode, URL and multi-page content.
  - Measure generation reliability and deployment/runtime constraints.
  - Decision and limitations are captured in an ADR.
- **Dependencies:** RS-051, RS-060.

### RS-111 — Implement PDF generation
- **Priority:** P0 | **Estimate:** L | **Labels:** `export`, `backend`, `testing` | **Status:** Not started
- **Description:** Generate PDF from semantic HTML/print CSS or the selected validated approach.
- **Acceptance criteria:**
  - PDF contains real selectable text.
  - Page size and selected template are respected.
  - No clipped/overlapped content in launch fixtures.
  - Errors produce a retryable user-facing message.
- **Dependencies:** RS-110.

### RS-112 — Implement PDF text extraction validation
- **Priority:** P0 | **Estimate:** L | **Labels:** `export`, `testing`, `backend` | **Status:** Not started
- **Description:** Extract text from generated files and compare expected names, headings, dates and bullets with the semantic model.
- **Acceptance criteria:**
  - Every launch template has extraction fixtures.
  - Critical text missing/order defects fail the test.
  - Test reports make it clear which expected content is absent or misplaced.
- **Dependencies:** RS-111.

### RS-113 — Implement PDF visual regression fixtures
- **Priority:** P1 | **Estimate:** L | **Labels:** `export`, `testing`, `design` | **Status:** Not started
- **Description:** Render generated PDFs to images and compare against approved visual baselines.
- **Acceptance criteria:**
  - Each launch template has short, typical and long-content baselines.
  - Intentional changes require baseline review/update.
  - Test artifacts are retained safely and contain synthetic data.
- **Dependencies:** RS-111.

### RS-114 — Implement PDF download settings
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `export`, `testing` | **Status:** Not started
- **Description:** Add format/page size/template/font/accent/spacing/section options to the export UI.
- **Acceptance criteria:**
  - User sees current export configuration before download.
  - Preview and export reflect the same settings.
  - Unsafe typography settings produce a warning.
- **Dependencies:** RS-059, RS-060, RS-111.

### RS-115 — Test filename and download behavior
- **Priority:** P1 | **Estimate:** S | **Labels:** `export`, `security`, `testing` | **Status:** Not started
- **Description:** Sanitize user-derived filenames and ensure browser download behavior is predictable.
- **Acceptance criteria:**
  - Filenames do not contain path traversal/control characters.
  - Non-ASCII names behave safely with a fallback.
  - Repeated exports do not expose another user's data.
- **Dependencies:** RS-111.

---

## EPIC 11 — DOCX export and editable files

### RS-120 — Run DOCX generation spike
- **Priority:** P0 | **Estimate:** M | **Labels:** `export`, `research`, `testing` | **Status:** Not started
- **Description:** Validate the `docx` package or an alternative for headings, paragraphs, hyperlinks, bullets, page size, page breaks and multi-page behavior.
- **Acceptance criteria:**
  - Chosen library and limitations are documented.
  - Word file opens in a supported Word-compatible editor/parser.
  - Common styles render predictably without relying on unsupported effects.
- **Dependencies:** RS-030, RS-050.

### RS-121 — Implement DOCX generator for launch templates
- **Priority:** P0 | **Estimate:** XL | **Labels:** `export`, `backend`, `testing` | **Status:** Not started
- **Description:** Generate editable Word documents from the canonical resume schema.
- **Acceptance criteria:**
  - Text is editable, not inserted as one image.
  - Headings, bullets, dates and links remain readable.
  - Unsupported template decorations degrade gracefully.
  - Master content is unchanged by export.
- **Dependencies:** RS-120.

### RS-122 — Implement DOCX validation tests
- **Priority:** P0 | **Estimate:** L | **Labels:** `export`, `testing` | **Status:** Not started
- **Description:** Inspect DOCX text/order with a parser and test representative documents.
- **Acceptance criteria:**
  - Name/contact information and key sections can be extracted.
  - Multi-page documents remain coherent.
  - Missing/duplicate bullets and section-order defects fail tests.
- **Dependencies:** RS-121.

### RS-123 — Build shared export panel for PDF/DOCX
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `export`, `accessibility` | **Status:** Not started
- **Description:** Present PDF/DOCX as first-class formats with clear explanations and status handling.
- **Acceptance criteria:**
  - Download action indicates selected format.
  - Generation errors have retry guidance.
  - Export settings are usable by keyboard and on mobile.
- **Dependencies:** RS-114, RS-121.

---

## EPIC 12 — Import, TXT/JSON export and document history (V2)

### RS-130 — Implement TXT export
- **Priority:** P2 | **Estimate:** M | **Labels:** `export`, `testing` | **Status:** Deferred
- **Description:** Export the semantic model as plain text in the intended reading order.
- **Acceptance criteria:**
  - Output is stable, readable and has no template-specific decoration.
  - Text order is tested.
  - Unsupported fields are not silently lost without a rule.
- **Dependencies:** RS-030.

### RS-131 — Implement JSON backup export/import
- **Priority:** P2 | **Estimate:** M | **Labels:** `data`, `export`, `security`, `testing` | **Status:** Deferred
- **Description:** Support portable structured resume data with schema versioning.
- **Acceptance criteria:**
  - Export includes schema version but no internal secrets or database-only metadata.
  - Import validates schema and reports errors before saving.
  - Malformed/oversized files are rejected safely.
- **Dependencies:** RS-030, RS-031.

### RS-132 — Implement PDF text import prototype
- **Priority:** P2 | **Estimate:** XL | **Labels:** `backend`, `data`, `security`, `testing` | **Status:** Deferred
- **Description:** Extract text from existing PDFs and infer sections into a reviewable draft.
- **Acceptance criteria:**
  - Image-only/scanned input is detected or explicitly reported as unsupported/incomplete.
  - Extracted fields require user review.
  - File size/type limits and cleanup policy are enforced.
  - Imported source never silently overwrites an existing resume.
- **Dependencies:** RS-030, RS-131, RS-090.

### RS-133 — Implement DOCX import prototype
- **Priority:** P2 | **Estimate:** L | **Labels:** `backend`, `data`, `security`, `testing` | **Status:** Deferred
- **Description:** Extract Word text/paragraphs and map common patterns into a reviewable resume draft.
- **Acceptance criteria:**
  - Original order is preserved where possible.
  - Low-confidence mappings are flagged for confirmation.
  - Unsupported embedded objects are reported rather than silently treated as text.
- **Dependencies:** RS-132.

### RS-134 — Build import review/correction screen
- **Priority:** P2 | **Estimate:** L | **Labels:** `frontend`, `data`, `accessibility` | **Status:** Deferred
- **Description:** Let users inspect and correct extracted name, contact, dates, roles, schools, projects and bullets before importing.
- **Acceptance criteria:**
  - User explicitly confirms import.
  - Confidence/uncertainty is visible where available.
  - Rejecting the import leaves existing data unchanged.
- **Dependencies:** RS-132, RS-133.

### RS-135 — Implement resume version history and compare view
- **Priority:** P2 | **Estimate:** L | **Labels:** `data`, `frontend`, `testing` | **Status:** Deferred
- **Description:** Show previous saved versions and compare changes between a master and job-specific copy.
- **Acceptance criteria:**
  - Version restore is explicit and recoverable.
  - Differences in sections/bullets are readable.
  - Retention limits are documented to prevent unbounded growth.
- **Dependencies:** RS-035, RS-071.

---

## EPIC 13 — Later career tools (V2/V3)

### RS-140 — Cover-letter generator
- **Priority:** P2 | **Estimate:** L | **Labels:** `ai`, `frontend`, `backend`, `testing` | **Status:** Deferred
- **Description:** Generate an editable, job-specific cover letter using approved resume evidence and the target job description.
- **Acceptance criteria:**
  - No invented employment facts or employer-specific claims.
  - User can edit and export the letter.
  - Cover-letter data is separate from resume data.
- **Dependencies:** RS-082, RS-090, RS-091.

### RS-141 — Application tracker discovery/prototype
- **Priority:** P3 | **Estimate:** L | **Labels:** `research`, `frontend`, `data` | **Status:** Deferred
- **Description:** Validate demand for tracking company, role, source, application date, status, deadlines, contacts and notes.
- **Acceptance criteria:**
  - User interviews or feedback demonstrate a clear use case.
  - Privacy and data-model implications are documented.
  - Implement only after core resume workflow is stable.
- **Dependencies:** MVP release.

### RS-142 — Portfolio/website generator discovery
- **Priority:** P3 | **Estimate:** XL | **Labels:** `research`, `frontend`, `ai` | **Status:** Deferred
- **Description:** Explore generating a simple personal portfolio page from approved resume projects and links.
- **Acceptance criteria:**
  - User chooses exactly which content becomes public.
  - Resume data is never published automatically.
  - Template/privacy/security model is documented before implementation.
- **Dependencies:** RS-131, MVP release.

### RS-143 — Interview practice assistant
- **Priority:** P3 | **Estimate:** L | **Labels:** `ai`, `research` | **Status:** Deferred
- **Description:** Generate practice questions from a target job and user-approved resume evidence.
- **Acceptance criteria:**
  - Questions refer to actual experience and job requirements.
  - Suggestions are framed as practice, not a prediction of actual interview questions.
  - Personal information is minimised in AI context.
- **Dependencies:** RS-090, RS-091, RS-082.

### RS-144 — Skill-gap and learning-plan feature
- **Priority:** P3 | **Estimate:** XL | **Labels:** `ai`, `research`, `frontend` | **Status:** Deferred
- **Description:** Identify requirements not evidenced in the resume and suggest honest next steps such as a project, course or practice exercise.
- **Acceptance criteria:**
  - Distinguishes “not found in resume” from “user does not have this skill.”
  - Recommendations are actionable and not pay-to-win endorsements.
  - Any external resources are checked before being presented as current.
- **Dependencies:** RS-092.

### RS-145 — Academic CV mode
- **Priority:** P3 | **Estimate:** XL | **Labels:** `frontend`, `data`, `export`, `research` | **Status:** Deferred
- **Description:** Add publications, research, teaching, presentations, grants and academic multi-page layout.
- **Acceptance criteria:**
  - Academic fields are structured and exportable.
  - Does not overload standard resume mode with academic-only forms.
  - Publication metadata and ordering are validated.
- **Dependencies:** RS-030, RS-050, RS-060, RS-121.

### RS-146 — Localisation foundation and additional languages
- **Priority:** P2 | **Estimate:** L | **Labels:** `frontend`, `data`, `accessibility` | **Status:** Deferred
- **Description:** Separate UI strings, dates and labels from hard-coded English; define fallback behavior and font support.
- **Acceptance criteria:**
  - UI strings are externalised.
  - Date formatting is locale-aware.
  - Export font support for target scripts is tested before claiming language support.
- **Dependencies:** RS-020, RS-050.

### RS-147 — Public resume share links (opt-in)
- **Priority:** P3 | **Estimate:** L | **Labels:** `security`, `backend`, `frontend` | **Status:** Deferred
- **Description:** Create optional read-only resume links with revocation and expiry controls.
- **Acceptance criteria:**
  - Default is private; user takes an explicit share action.
  - Tokens are unguessable and stored safely (e.g., hashed where practical).
  - Link can be revoked and may support expiry.
  - Shared content is a chosen snapshot and not automatically the master profile.
  - Search indexing behavior is deliberate and documented.
- **Dependencies:** RS-042, RS-070, security review.

---

## EPIC 14 — Privacy, security and hardening

### RS-150 — Threat-model the core workflows
- **Priority:** P0 | **Estimate:** M | **Labels:** `security`, `docs` | **Status:** Not started
- **Description:** Map threats for auth, saved data, AI requests, imports, exports, sharing and deletion.
- **Acceptance criteria:**
  - Threats include ID tampering, prompt injection, excessive requests, file abuse, cross-user access and accidental sharing.
  - Mitigations and residual risks are documented.
- **Dependencies:** RS-001, RS-040.

### RS-151 — Add rate limiting and payload limits
- **Priority:** P0 | **Estimate:** M | **Labels:** `security`, `backend`, `ops` | **Status:** Not started
- **Description:** Protect AI and export/import routes from excessive usage and large payloads.
- **Acceptance criteria:**
  - Limits are documented and appropriate for the deployed infrastructure.
  - Responses use clear rate-limit/error semantics.
  - Legitimate retries are not silently duplicated when avoidable.
- **Dependencies:** RS-080, RS-111, RS-121.

### RS-152 — Verify secrets and dependency hygiene
- **Priority:** P0 | **Estimate:** S | **Labels:** `security`, `ops` | **Status:** Not started
- **Description:** Add secret scanning and dependency vulnerability checks.
- **Acceptance criteria:**
  - CI blocks obvious committed secrets where tooling supports it.
  - Lockfile is committed.
  - Findings have documented triage expectations.
- **Dependencies:** RS-014, RS-015.

### RS-153 — Review file upload processing for V2 imports
- **Priority:** P2 | **Estimate:** M | **Labels:** `security`, `backend`, `testing` | **Status:** Deferred
- **Description:** Add safe type validation, processing time limits, file-size limits, cleanup and hostile-file handling before enabling import publicly.
- **Acceptance criteria:**
  - Extension and actual content are checked where practical.
  - Temporary files are cleaned up according to policy.
  - Malformed files do not crash the whole service.
- **Dependencies:** RS-132.

### RS-154 — Define deletion and backup retention policy
- **Priority:** P1 | **Estimate:** M | **Labels:** `security`, `ops`, `docs` | **Status:** Not started
- **Description:** Document how user deletion affects primary data, object storage, logs, provider-side requests and backups.
- **Acceptance criteria:**
  - Policy has specific retention/deletion behavior.
  - User-facing copy accurately reflects what happens.
  - Operations can verify the procedure.
- **Dependencies:** RS-043, RS-045.

### RS-155 — Add production monitoring and incident guide
- **Priority:** P1 | **Estimate:** M | **Labels:** `ops`, `security`, `docs` | **Status:** Not started
- **Description:** Track error rate, export failures, AI timeout/failure, latency and abuse signals without personal resume content.
- **Acceptance criteria:**
  - Alerts cover critical workflow failures.
  - A small incident guide documents rollback, secret rotation, data exposure escalation and user communication.
- **Dependencies:** RS-014, RS-045, RS-016.

---

## EPIC 15 — Analytics, onboarding and documentation

### RS-160 — Design privacy-conscious product event schema
- **Priority:** P1 | **Estimate:** M | **Labels:** `ops`, `data`, `security` | **Status:** Not started
- **Description:** Define product funnel events without embedding personal resume content or raw job text.
- **Acceptance criteria:**
  - Track start, first section, preview, save, export and AI suggestion actions.
  - Event payloads are reviewed for PII risk.
  - Analytics purpose and retention are documented.
- **Dependencies:** RS-045.

### RS-161 — Build guided first-run experience
- **Priority:** P1 | **Estimate:** M | **Labels:** `frontend`, `design`, `testing` | **Status:** Not started
- **Description:** Ask user goal and starting method; set a role-aware skeleton and show preview quickly.
- **Acceptance criteria:**
  - Student/fresher and experienced defaults differ appropriately.
  - Optional questions can be skipped.
  - The user can change goal and reorder sections later.
- **Dependencies:** RS-061, RS-070.

### RS-162 — Build demo fixture library
- **Priority:** P0 | **Estimate:** M | **Labels:** `testing`, `docs`, `design` | **Status:** Not started
- **Description:** Create synthetic resumes for fresher, technical, experienced, career switcher and creative examples.
- **Acceptance criteria:**
  - No real personal data is used.
  - Fixtures include short/long/multi-page/Unicode and optional-field cases.
  - Samples are clearly labelled as illustrative, not claims about real people.
- **Dependencies:** RS-030.

### RS-163 — Write developer README and local setup guide
- **Priority:** P0 | **Estimate:** M | **Labels:** `docs`, `ops` | **Status:** Not started
- **Description:** Document installation, configuration, database setup, test commands, export dependencies and deployment.
- **Acceptance criteria:**
  - New contributor can run the project from a clean checkout using the README.
  - Required/optional integrations are clear.
  - No real secrets appear in examples.
- **Dependencies:** RS-010, RS-015, RS-041.

### RS-164 — Write architecture, data, AI and export docs
- **Priority:** P1 | **Estimate:** M | **Labels:** `docs`, `data`, `ai`, `export` | **Status:** Not started
- **Description:** Maintain `docs/architecture.md`, `docs/data-model.md`, `docs/ai-safety.md`, `docs/export-testing.md` and `docs/security.md`.
- **Acceptance criteria:**
  - Docs reflect the actual implementation, not only proposed architecture.
  - Non-obvious decisions and limitations are recorded.
  - Export test procedure is reproducible.
- **Dependencies:** RS-004, RS-030, RS-080, RS-110.

### RS-165 — Add in-product help for ATS and AI limitations
- **Priority:** P1 | **Estimate:** S | **Labels:** `frontend`, `docs`, `design` | **Status:** Not started
- **Description:** Explain what each check does, why ATS parsing varies and why AI suggestions need review.
- **Acceptance criteria:**
  - Help is available near the relevant feature.
  - Copy contains no promise of passing any ATS or getting interviews.
  - Examples use synthetic information.
- **Dependencies:** RS-095, RS-103.

---

## EPIC 16 — Release validation and launch

### RS-170 — Run full fresher journey test
- **Priority:** P0 | **Estimate:** M | **Labels:** `testing`, `export`, `accessibility` | **Status:** Not started
- **Description:** Run start → create → edit → AI suggestion → readiness checks → save → export for a student/fresher fixture.
- **Acceptance criteria:**
  - Flow succeeds on supported desktop and mobile viewports.
  - Original text can be restored after AI suggestions.
  - PDF/DOCX outputs match expected content.
- **Dependencies:** Core MVP epics.

### RS-171 — Run full experienced-professional journey test
- **Priority:** P0 | **Estimate:** M | **Labels:** `testing`, `export` | **Status:** Not started
- **Description:** Test multiple roles, long experience, optional skills and multi-page export.
- **Acceptance criteria:**
  - No content is silently removed.
  - Date/title/company associations remain correct.
  - Multi-page documents are readable and editable.
- **Dependencies:** Core MVP epics.

### RS-172 — Run cross-user privacy and security tests
- **Priority:** P0 | **Estimate:** M | **Labels:** `security`, `testing` | **Status:** Not started
- **Description:** Validate authorization, RLS, public/private boundaries, deletion, secret handling and logging.
- **Acceptance criteria:**
  - Cross-user data access tests fail securely.
  - No release-blocking known secret or authorization issue remains.
  - Results are recorded in the release notes/checklist.
- **Dependencies:** RS-042, RS-043, RS-045, RS-150, RS-152.

### RS-173 — Run export regression suite across templates
- **Priority:** P0 | **Estimate:** L | **Labels:** `export`, `testing` | **Status:** Not started
- **Description:** Run PDF text/layout and DOCX structure tests across all launch templates and representative fixtures.
- **Acceptance criteria:**
  - Critical extraction/order/clipping problems block release.
  - Baseline changes are reviewed.
  - At least one A4 and one US Letter case passes where both are supported.
- **Dependencies:** RS-112, RS-113, RS-122.

### RS-174 — Conduct accessibility and responsive release review
- **Priority:** P1 | **Estimate:** M | **Labels:** `accessibility`, `testing` | **Status:** Not started
- **Description:** Review keyboard flow, contrast, error labels, mobile preview, zoom/reflow and reduced motion.
- **Acceptance criteria:**
  - No unresolved release-blocking accessibility defects.
  - Remaining known limitations are documented.
- **Dependencies:** RS-025, RS-026, RS-073.

### RS-175 — Finalize public launch privacy/terms/help pages
- **Priority:** P0 | **Estimate:** M | **Labels:** `security`, `docs`, `frontend` | **Status:** Not started
- **Description:** Publish accurate privacy, terms and help documentation matching actual data/provider behavior.
- **Acceptance criteria:**
  - AI provider/data disclosure is accurate.
  - Data export/delete procedure is explained.
  - Claims are reviewed; legal review is sought where appropriate.
- **Dependencies:** RS-043, RS-044, RS-154, RS-165.

### RS-176 — Create release notes and known-limitations page
- **Priority:** P1 | **Estimate:** S | **Labels:** `docs`, `ops` | **Status:** Not started
- **Description:** Document supported formats, templates, browsers, known limitations and deferred functionality.
- **Acceptance criteria:**
  - Does not advertise unimplemented V2/V3 capabilities.
  - Explains that readiness checks cannot guarantee employer ATS results.
- **Dependencies:** RS-170, RS-171, RS-173.

---

## Cross-cutting acceptance criteria

Every ticket that changes relevant behavior should be checked against these applicable items:

- **Data integrity:** changing templates never loses semantic content; master resumes and job copies remain separate.
- **AI truthfulness:** no fabricated metrics/outcomes; user can reject/undo; untrusted documents cannot override system rules.
- **Export quality:** validate actual PDF/DOCX files, not only UI buttons or browser preview.
- **ATS transparency:** describe observable checks and heuristics; do not claim universal compatibility.
- **Accessibility:** visible focus, keyboard operation, labels, status announcement, contrast and reduced motion where applicable.
- **Privacy/security:** owner authorization on server, RLS, no secrets in client bundle, minimal logging and clear retention behavior.
- **Reliability:** visible loading/error/retry state; no false “saved” state; bounded retries/timeouts.
- **Docs:** update README, relevant ADRs and `PLAN.md` when architecture/scope changes.

---

## Suggested implementation order

This is a dependency-aware sequence, not a fixed calendar:

1. **Define:** RS-001, RS-004, RS-005, RS-010–RS-015.
2. **Model:** RS-030–RS-036.
3. **Design/editor skeleton:** RS-020–RS-026, RS-050–RS-052.
4. **Persist safely:** RS-040–RS-045, RS-070–RS-071.
5. **Finish template families:** RS-053–RS-061, RS-033–RS-035, RS-074–RS-075.
6. **Prove export architecture early:** RS-110 and RS-120 should start as soon as shared render primitives exist; do not defer export testing until the end.
7. **Ship PDF/DOCX:** RS-111–RS-123, alongside readiness rules RS-100 and demo fixtures RS-162.
8. **Add AI carefully:** RS-080–RS-087, then job matching RS-090–RS-095.
9. **Harden:** RS-150–RS-155, RS-160–RS-165, RS-170–RS-176.
10. **Only then expand:** RS-130–RS-147 according to validated user need.

---

## Definition of Done

A task is Done only when:

- Acceptance criteria are met and reviewed.
- Tests cover its primary behavior and likely regressions.
- Loading, empty, error and recovery states are implemented as relevant.
- Type and runtime validation is present for untrusted inputs.
- Security and authorization are tested when private data is accessed.
- Accessibility has been checked for interactive UI.
- Documentation and example configuration are updated.
- No sensitive resume data or secrets are committed or logged unnecessarily.
- Required CI checks pass.
- Export changes are tested against real generated files and appropriate synthetic fixtures.
- Any limitation or deviation is recorded before closing the task.
