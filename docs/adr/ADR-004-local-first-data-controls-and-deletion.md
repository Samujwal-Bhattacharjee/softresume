# ADR-004: Local-First Data Controls, Deletion Lifecycle, and PII Scrubbing

**Status:** Accepted  
**Date:** 2026-10-22  
**Deciders:** Full-Stack & Security Engineering Team  
**Related Backlog Items:** RS-043, RS-044, RS-045, RS-154, RS-172  

---

## Context

SoftCV Studio currently persists resumes in standalone, demo-ready local storage (`localStorage`) without an active multi-tenant cloud database or server-side authentication (Supabase auth).

In this architectural configuration:
1. Users need standard data sovereignty controls: downloading their data (JSON backup export) and deleting their data.
2. In single-page web applications with debounced autosave, deleting a record creates a potential race condition: a pending debounced timer can trigger after deletion and resurrect the discarded document back into storage.
3. Server route logging must not leak candidate PII (names, emails, phones, resume bullets, job descriptions) into production logs.
4. The product must not falsely claim multi-user cross-account security or database encryption when running on browser `localStorage`.

---

## Decision

1. **Scoped Local-First Namespace:**
   - All application storage keys are prefixed with `softcv_` (`softcv_resumes_*`, `softcv_resume_index`, `softcv_job_target_*`).
   - A global purge (`deleteAllData`) iterates and removes strictly `softcv_*` keys, guaranteeing that unrelated site data or tokens from other applications sharing the origin are never touched.

2. **Autosave Race Prevention via Tombstoning:**
   - When `deleteResume(id)` or `deleteAllData()` is executed, deleted IDs are registered in a session `tombstonedIds` Set.
   - Any late-firing debounced `saveResume(id)` call checks `tombstonedIds.has(id)` and throws immediately, aborting the write and preventing document resurrection.
   - The editor component calls `debounce.cancel()` on unmount.

3. **Schema-Versioned JSON Backup:**
   - `localAdapter.exportAllData()` exports a validated JSON structure with version metadata (`version: "1.0.0"`, `schemaVersion: 1`, `storageMode: "localStorage"`), excluding any internal credentials or session state.

4. **PII-Safe Structured Logging (RS-045):**
   - Implemented centralized `logger` in `src/lib/logger.ts`.
   - Scrubbing filters out email addresses, phone numbers, and API keys via regex.
   - Sensitive payload keys (`jobDescription`, `resume`, `bullet`, `apiKey`, `password`, `email`, `phone`) are blacklisted and replaced with `[REDACTED]`.

5. **Honest Cloud Security Boundary (RS-172):**
   - Cross-user RLS tests are formally marked **Blocked** pending cloud auth (`RS-040`–`RS-042`).
   - The UI and public policy pages honestly disclose local browser storage constraints and disclaim cross-user encryption.

---

## Consequences

- **Positive:** Full compliance with privacy best practices; zero candidate PII in server telemetry; 100% deterministic deletion without autosave resurrection; clear upgrade path to cloud storage without rewriting core persistence interfaces.
- **Negative:** Users who switch browsers or clear browser history lose locally stored documents unless they have exported a JSON backup.
