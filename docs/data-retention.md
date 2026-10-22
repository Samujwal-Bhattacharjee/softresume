# SoftCV Studio — Data Deletion & Backup Retention Policy

**Document Reference:** `DOC-RETENTION-2026-V1`  
**Status:** Implemented & Verified (Sprint 06)  
**Ticket Reference:** RS-154  

---

## 1. Operating Mode & Scope

SoftCV Studio supports dual persistence modes:
1. **Local-First Standalone Mode:** All resume documents, contact details, tailored job copies, and section preferences are persisted **exclusively in client-side browser storage (`localStorage`)**.
2. **Authenticated Supabase Cloud Mode:** When signed into an account, documents and job targets are persisted in a hosted PostgreSQL database secured with Row-Level Security (`resumes`, `job_targets`).

The user retains complete custody in both modes:
- Local data is never silently wiped or merged without explicit user consent.
- Cloud deletions cleanly remove database records and cascade to associated job targets.

---

## 2. Retention Matrix Across All Tiers

| Data Tier / Asset | Storage Location | Retention Duration | User Deletion Mechanism | Residual Storage |
|---|---|---|---|---|
| **Local Resumes** | Browser `localStorage` (`softcv_resumes_*`) | Indefinite until deleted by user or browser storage is cleared | Dashboard Delete button or Data & Privacy "Purge Local Storage" | Immediately purged from memory & storage; tombstoned against autosave resurrection |
| **Local Job Targets** | Browser `localStorage` (`softcv_job_target_*`) | Retained alongside parent resume cartridge | Automatically purged upon local resume deletion or local storage purge | Immediately purged from origin storage |
| **Cloud Resumes** | Hosted Supabase PostgreSQL (`resumes` table) | Indefinite until deleted by candidate | Dashboard Delete button or Data & Privacy "Delete All Cloud Cartridges" | Immediate SQL row removal with RLS filter `auth.uid() = user_id` |
| **Cloud Job Targets** | Hosted Supabase PostgreSQL (`job_targets` table) | Retained alongside parent resume record | Cascades automatically via `ON DELETE CASCADE` foreign key when parent resume is deleted | Cleanly purged from PostgreSQL |
| **JSON Backups** | User's local file download (`softcv_backup_*.json`) | Managed entirely by the user on their file system | User deletes file from local computer | None in application storage |
| **AI Request Cache** | Ephemeral server RAM (within route request lifecycle) | 0 seconds (ephemeral; garbage collected after response) | N/A (not retained) | None |
| **Server Diagnostic Logs** | Server stdout / container stream | Standard cloud platform retention (typically 7–30 days) | Automated platform rollover | Contains only route metadata & status; **zero candidate PII** (RS-045) |
| **Upstream AI Provider** | Configured Provider (e.g. OpenAI API) | Subject to external provider's API retention policy (standard: 30 days for abuse monitoring; zero training on API data) | Governed by provider terms | Managed by host provider account settings |

---

## 3. Deletion Operations & Verification Procedure

### Single Resume Deletion
1. **Trigger:** Click the trash icon on any resume cartridge plate on the dashboard.
2. **Confirmation:** Requires confirming the prompt on the card ("CONFIRM?").
3. **Execution:**
   - **Local Mode:** Document key `softcv_resumes_${id}` and job target `softcv_job_target_${id}` are removed. `id` is removed from `softcv_resume_index` and added to session `tombstonedIds` to prevent resurrection from debounced autosave.
   - **Cloud Mode:** `supabaseAdapter.deleteResume(id)` issues `DELETE FROM resumes WHERE id = :id AND user_id = :uid`. Associated `job_targets` row is removed automatically via foreign key cascade (`ON DELETE CASCADE`).
4. **Verification:**
   - Reload page: document does not appear in rack.
   - Local: `localStorage` contains no key for that ID.
   - Cloud: PostgreSQL query with `user_id` returns 0 rows for that ID.

### Local Browser Storage Purge
1. **Trigger:** Open **DATA & PRIVACY** -> **PURGE LOCAL BROWSER STORAGE**.
2. **Confirmation:** Displays modal warning: "PERMANENT DESTRUCTION CONFIRMATION. This will purge all local browser cartridges."
3. **Execution:** Iterates all origin storage keys, deletes all keys matching `softcv_*`, leaving all other site keys untouched.
4. **Verification:** Local rack renders empty ("NO LOCAL CARTRIDGES DETECTED").

### Cloud Vault Cartridge Purge
1. **Trigger:** Open **DATA & PRIVACY** -> **DELETE ALL CLOUD CARTRIDGES** (only visible when authenticated).
2. **Confirmation:** Requires explicit confirmation: "PERMANENT CLOUD PURGE CONFIRMATION. This will remove all cloud resume cartridges and job targets from your Supabase account."
3. **Execution:** `supabaseAdapter.deleteAllData()` issues `DELETE FROM resumes WHERE user_id = :uid`.
4. **Verification:** Cloud rack renders empty. Local storage remains completely unaffected.

### Synthetic Demo Reset
1. **Trigger:** Open **DATA & PRIVACY**, select **RESET DEMO DATA**.
2. **Execution:** Purges local storage and re-seeds standard synthetic fixtures (`Priya Mehta` and `Marcus Vance`).
3. **Verification:** Dashboard renders exactly 2 cartridges with sample tags.
