# ADR-006: Role-Specific Coaching Presets, Bounded Edit History, and Next.js 16 Proxy Migration

**Status:** Accepted  
**Date:** 2026-10-22  
**Context:** Antigravity Sprint 08 — SoftCV Studio  
**Decision Drivers:**
- Candidate guidance must be domain-relevant without hallucinating unevidenced skills or modifying the canonical resume schema.
- Accidental edits, deletions, and accepted AI revisions must be immediately reversible without unbounded memory growth.
- Next.js 16 deprecates the `middleware.ts` naming convention in favor of `proxy.ts`.
- Supabase cross-user Row-Level Security (RLS) requires deterministic verification without compromising credentials.

---

## 1. Role Coaching Presets Registry (`RS-093`)

### Context
Resume candidates apply across vastly different disciplines (systems software engineers, AI/ML practitioners, SREs, product managers, designers, bankers, sales executives, academics, and career switchers). Standard generic advice ("use action verbs") is insufficient, yet creating bespoke resume schemas per role would fracture exports, ATS checks, and migrations.

### Decision
We implemented a typed, data-driven preset registry in `src/lib/coaching/presets.ts` defining 11 distinct role profiles:
1. `software-engineer`
2. `ai-ml-engineer`
3. `cloud-devops`
4. `data-scientist`
5. `product-manager`
6. `ui-ux-designer`
7. `finance-consulting`
8. `sales-cs`
9. `research-academic`
10. `creative-film`
11. `general` (fallback)

**Invariants:**
- **Zero Schema Mutation:** Presets alter recommended section ordering (`settings.sectionOrder`), AI writing prompts, and evidence expectations. They NEVER alter or inject fabricated claims into the canonical `ResumeDocument` schema.
- **Preview & Reversibility:** Selecting a preset compares current vs recommended section order. Candidates must explicitly confirm applying the new order, and the reordering is completely undoable via editor history.

---

## 2. Bounded Undo/Redo & State Recovery (`RS-072`)

### Context
Candidates need immediate recovery from accidental text deletions, item removals, or unsatisfactory AI suggestions. However, unbounded state history in React stores can cause memory leaks during long drafting sessions.

### Decision
We integrated a bounded history ring into `useEditorStore` in `src/lib/resume/editor-store.ts`:
- **Bounded Capacity:** Maximum 30 discrete snapshot states (`MAX_HISTORY = 30`). Oldest snapshots are safely shifted out when capacity is exceeded.
- **Keystroke Grouping:** Continuous text typing within a 600ms window (`GROUPING_WINDOW_MS = 600`) updates the current snapshot in place, preventing a single word from consuming multiple history steps.
- **AI Reversibility:** Accepting an AI suggestion (`replaceDraft`) pushes a discrete snapshot, allowing candidates to immediately click "Undo" to restore their previous text. Rejecting an AI suggestion makes zero state changes.
- **Scope & Concurrency Isolation:** History is strictly scoped to the active cartridge. Calling `initResume` resets history to a single snapshot of the newly opened document, preventing cross-cartridge data leakage.
- **Tombstone Independence:** Editor history cannot resurrect a permanently purged cartridge from the dashboard or privacy dialog; local storage tombstoning takes precedence.

---

## 3. Next.js 16 Middleware-to-Proxy Convention Migration

### Context
Next.js 16 emits a deprecation notice during build:
`The "middleware" file convention is deprecated. Please use "proxy" instead.`

### Decision
- Renamed `src/middleware.ts` to `src/proxy.ts`.
- Renamed the exported handler from `export async function middleware` to `export async function proxy`.
- Ensured single active convention by removing the legacy file.
- Preserved `@supabase/ssr` cookie refresh mechanics and route protection guards.
- Verified Next.js 16 Turbopack production build compiles with zero deprecation warnings.

---

## 4. Supabase Database Isolation & RLS Test Strategy (`RS-172`)

### Context
Unit test mocks verify TypeScript contracts, but do not execute PostgreSQL kernel Row-Level Security. In the current development container, Docker and the Supabase CLI are not installed.

### Decision
- Authored a complete pgTAP SQL test suite (`docs/supabase/tests/rls_isolation_tests.sql`) for local execution via `supabase test db`.
- Authored a comprehensive staging test harness guide (`docs/supabase-staging-test.md`) covering two-account cross-browser verification.
- Enforced hard invariant tests (`tests/cloud-invariants.test.ts`) covering demo fallback and failed cloud save error preservation.
- Kept `RS-172` honestly marked as **Blocked** pending provisioned staging environment credentials.
