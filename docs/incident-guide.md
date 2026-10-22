# SoftCV Studio — Production Operations & Security Incident Guide

**Document Reference:** `DOC-OPS-INCIDENT-2026-V1`  
**Status:** Implemented & Verified (Sprint 06)  
**Ticket Reference:** RS-155  

---

## 1. Monitoring & Observability Baseline

SoftCV Studio server endpoints log structured JSON in production mode via `src/lib/logger.ts`.

### Key Metrics to Monitor
1. **AI Route Errors (`/api/ai/*`):**
   - High volume of `503 NOT_CONFIGURED`: missing or unset provider key.
   - High volume of `429 RATE_LIMITED`: client rate limit exhaustion or abusive client behavior.
   - Elevated `504 TIMEOUT`: external provider degradation or network latency.
2. **PDF Compilation Failures (`/api/export/pdf`):**
   - HTTP 500 errors indicating headless Chromium crash, out-of-memory, or missing system font dependencies.
3. **Absence of PII:** Verify that automated error tracking filters out candidate emails, phone numbers, and raw resume text.

---

## 2. Incident Playbooks

### Playbook A: Provider Secret Compromise or Rotation
**Trigger:** `AI_API_KEY` was accidentally committed, logged, or flagged by secret detection tooling.

1. **Immediate Revocation:**
   - Log into external AI provider console (e.g. platform.openai.com).
   - Delete/revoke the compromised API key immediately.
2. **Issue New Key:**
   - Generate a fresh API key.
   - Update the production deployment environment variable (`AI_API_KEY`) in the hosting dashboard (e.g. Vercel, Railway, AWS ECS).
3. **Restart / Redeploy:**
   - Trigger a rolling restart of the server instances to pick up the new environment value.
4. **Post-Mortem & Audit:**
   - Inspect git commit history and server logs.
   - Run `git ls-files --stage .env*` to verify no secret files were tracked in git.

---

### Playbook B: External AI Provider Outage
**Trigger:** Elevated 504 timeouts or 500 provider errors reported by users.

1. **Verify Provider Health:** Check external status page (e.g. status.openai.com).
2. **Honest Degraded Experience:**
   - SoftCV Studio's server will automatically catch provider failures and return `isRetryable: true` with status 504 or 500.
   - The user is notified with an accessible in-app alert banner: "AI service is currently unresponsive. You can continue editing your resume manually or try again in a few minutes."
3. **Core Functionality Preserved:**
   - Local resume editing, template rendering, and exports remain 100% operational even when external AI is down.

---

### Playbook C: User Data Corruption / Malformed Local Record
**Trigger:** User reports a blank dashboard or error loading a specific cartridge due to manually edited or corrupted browser storage.

1. **Diagnostic Guidance for User:**
   - Open Developer Tools -> Application -> Local Storage.
   - Check if `softcv_resume_index` contains valid JSON.
2. **Recovery Steps:**
   - Open `/dashboard` and click **DATA & PRIVACY** -> **EXPORT JSON BACKUP** to capture whatever records are intact.
   - If a specific record is corrupt, clicking **DELETE** on that slot cleans up the record.
   - As a last resort, click **RESET DEMO DATA** or **PURGE ALL LOCAL DATA** to restore a clean slate.

---

### Playbook D: Production Rollback Procedure
**Trigger:** A newly deployed build introduces a regression in PDF export or template rendering.

1. **Instant Rollback:** Revert to previous deployment commit in hosting provider dashboard.
2. **Verification Checklist:**
   - `npm test`: 171 unit/component/journey tests passing across 21 test files.
   - `npm run test:a11y`: 9 Axe accessibility scans passing with 0 critical/serious violations.
   - `npm run typecheck`: clean compilation.
   - Verify export routes: download a sample PDF and Word document.

---

### Playbook E: Supabase Service Outage / Degraded Cloud Connectivity
**Trigger:** Elevated connection errors or network timeouts when communicating with Supabase Auth or PostgreSQL.

1. **Verify Provider Health:** Check Supabase Status Page (`status.supabase.com`).
2. **Resilient Local-First Fallback:**
   - If Supabase is unreachable or unconfigured, SoftCV Studio falls back seamlessly to Standalone Demo / Local-First mode.
   - The cartridge rack and editor display `LOCAL SYNC OK`.
   - All resume authoring, tailoring, ATS readiness checks, and PDF/DOCX exports remain 100% operational locally in the browser.
3. **Candidate Communication:**
   - The UI displays an alert banner informing the candidate that cloud sync is temporarily offline and changes are being preserved in local storage.

---

### Playbook F: Local-to-Cloud Migration Interruption & Recovery
**Trigger:** Network drops or browser tab closes midway through migrating local cartridges to cloud vault.

1. **Non-Destructive Safety Guarantee:**
   - `cloud-migration.ts` never deletes local records during migration. Local storage is retained unless the candidate explicitly checks "Purge local copies" after completion.
2. **Recovery Procedure:**
   - Reopen `/dashboard`. The system detects remaining local cartridges.
   - Click "MIGRATE TO CLOUD".
   - The migration engine applies title deduplication (`(Local Import)`) to prevent overwriting successfully inserted records.

---

### Playbook G: Supabase Key Compromise or Rotation
**Trigger:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` flagged in a public repository or suspect token activity observed.

1. **Assess Exposure:**
   - The Anon key has zero administrative rights; it is strictly restricted by PostgreSQL RLS (`auth.uid() = user_id`). An attacker possessing the anon key cannot read another user's documents without a stolen user session token.
2. **Rotate Anon Key:**
   - Generate a fresh API key in Supabase Dashboard -> Project Settings -> API.
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production environment settings.
   - Redeploy the application. Existing user sessions remain valid via cookie refresh tokens.
