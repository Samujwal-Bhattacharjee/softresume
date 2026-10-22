# SoftCV Studio — Hosted Supabase Staging Test Harness & Verification Guide

**Document Reference:** `DOC-TEST-SUPABASE-STAGING-V1`  
**Purpose:** Provides a repeatable, production-grade protocol for executing live cross-user isolation, Row-Level Security (RLS) enforcement, and cascade verification against a disposable hosted Supabase staging project or local Supabase Docker instance.  
**Related Backlog Ticket:** `RS-172` (Run cross-user privacy and security tests)  
**Execution Status (Sprint 09 Gate):** **BLOCKED**. Neither Docker, Supabase CLI, nor disposable staging credentials (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`) were configured in this development environment. Live Postgres RLS remains unverified against a real database instance, though full SQL suites, local adapter invariants, and client ownership guards are implemented and tested.

---

## 1. Security Architecture & Threat Boundaries

In authenticated cloud mode, SoftCV Studio relies on a two-tier defense-in-depth model:
1. **Tier 1 (Database Kernel):** PostgreSQL Row-Level Security (`USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)`). This guarantees that even if a client forges a request with a valid anon key and an arbitrary document ID, the database engine returns zero rows or rejects the write.
2. **Tier 2 (Application Layer):** `src/lib/resume/supabase-adapter.ts` enforces `assertOwnership(id, user_id)` before emitting queries and pre-validates all mutations against Zod (`ResumeDocumentSchema`).

### Environment Variable Classification

| Variable | Scope | Purpose | Security Rule |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Supabase project endpoint (e.g. `https://xyz.supabase.co`) | Publicly shareable |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public anonymous API key constrained by RLS | Publicly safe; RLS enforces row isolation |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEVER USED IN APP** | Administrative bypass key | **STRICTLY FORBIDDEN** in client, frontend, or adapter code |
| `AI_API_KEY` | Server Only | Secret token for OpenAI / LLM gateway | **STRICTLY CONFIDENTIAL**; never prefixed with `NEXT_PUBLIC_` |

---

## 2. Option A: Automated Local Stack Execution (Supabase CLI + Docker)

If your development machine has Docker and the Supabase CLI installed, run the automated pgTAP test suite:

```bash
# 1. Initialize local Supabase stack (if not already initialized)
npx supabase start

# 2. Apply initial migration
npx supabase db push

# 3. Execute the automated pgTAP RLS isolation test suite
npx supabase test db docs/supabase/tests/rls_isolation_tests.sql
```

### Expected Output:
```
ok 1 - Table public.resumes exists
ok 2 - Table public.job_targets exists
ok 3 - RLS is enabled on public.resumes
ok 4 - RLS is enabled on public.job_targets
ok 5 - Anon role cannot read any resumes
ok 6 - Anon role cannot insert resumes
ok 7 - Anon role cannot read any job targets
ok 8 - User A can select their own resume
ok 9 - User A can select their own job target
ok 10 - User B cannot select User A resume even with exact UUID
ok 11 - User B cannot select User A job target even with exact UUID
ok 12 - User B UPDATE on User A resume affects 0 rows due to RLS USING clause
ok 13 - User B cannot insert row claiming User A user_id (RLS WITH CHECK)
ok 14 - User B cannot attach job target to User A resume
ok 15 - Parent master deletion sets child parent_resume_id to NULL (ON DELETE SET NULL)
ok 16 - Deleting resume cascades to delete associated job target (ON DELETE CASCADE)
1..16
All tests successful.
```

---

## 3. Option B: Hosted Staging Verification Protocol (Two-Account Browser Context)

When Docker or the Supabase CLI is unavailable in the local execution container, run this live staged verification on a disposable Supabase cloud project.

### Step 1: Provision Disposable Supabase Project
1. Log into [supabase.com](https://supabase.com) and create a free disposable project (e.g., `softcv-staging-2026`).
2. Navigate to **Project Settings** -> **API**.
3. Note your `Project URL` and `anon public` key.
4. Open the SQL Editor in Supabase Dashboard and paste the entire contents of [`docs/supabase/migrations/001_initial.sql`](docs/supabase/migrations/001_initial.sql). Click **Run**.
5. Verify that `resumes` and `job_targets` tables are created with `RLS Enabled` badges.

### Step 2: Configure Staging Environment
In your local repository root, create or update `.env.local` (ensure it remains untracked in git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Start the application:
```bash
npm run dev
```

### Step 3: Register Two Test Candidate Accounts
1. Open **Browser 1 (Chrome Incognito)**:
   - Navigate to `http://localhost:3000/auth/signup`.
   - Register **User Alpha**: `alpha.candidate@softcv.test` (password: `TestAlpha123!`).
   - Confirm email or disable email confirmations in Supabase Dashboard Auth settings.
2. Open **Browser 2 (Firefox Private or Edge InPrivate)**:
   - Navigate to `http://localhost:3000/auth/signup`.
   - Register **User Beta**: `beta.candidate@softcv.test` (password: `TestBeta123!`).

---

## 4. Execution Steps & Verification Checklist

### Test Scenario 1: Master Cartridge Creation & Storage Isolation
- [ ] In Browser 1 (User Alpha), open `/dashboard`.
- [ ] Click **NEW RESUME** -> choose "Technical / Project-First" -> title it `"Alpha Core Architecture"`.
- [ ] Add 2 technical experience entries and click **ATS READINESS** -> attach a Job Target for `"Lead Infrastructure Engineer"`.
- [ ] Wait for status bar to indicate `CLOUD SYNC OK`. Note the resume ID from the URL (`/resume/[alphaId]/edit`).
- [ ] Switch to Browser 2 (User Beta) on `/dashboard`.
- [ ] **Verification:** User Beta's cartridge rack must display `NO CARTRIDGES DETECTED`. Zero cartridges from User Alpha may appear.

### Test Scenario 2: Active Cross-User Tampering via Browser Console
In Browser 2 (User Beta), open Developer Tools -> Console and execute the following commands using the client-side Supabase singleton:

```javascript
// Test 2A: Unauthorized Read
const { data: readData, error: readError } = await window.supabase
  .from('resumes')
  .select('*')
  .eq('id', '<ALPHA_RESUME_ID>');
console.log('Read Result:', readData); 
// EXPECTED: readData is [] (empty array, 0 rows returned)

// Test 2B: Unauthorized Write / Mutation
const { data: updateData, error: updateError } = await window.supabase
  .from('resumes')
  .update({ title: 'Hacked by Beta' })
  .eq('id', '<ALPHA_RESUME_ID>');
console.log('Update Error:', updateError);
// EXPECTED: 0 rows affected; Alpha's resume title is untouched

// Test 2C: Unauthorized Deletion
const { data: deleteData, error: deleteError } = await window.supabase
  .from('resumes')
  .delete()
  .eq('id', '<ALPHA_RESUME_ID>');
console.log('Delete Error:', deleteError);
// EXPECTED: 0 rows affected; Alpha's resume remains in database

// Test 2D: Unauthorized Forged Ownership Insert
const { error: insertError } = await window.supabase
  .from('resumes')
  .insert({
    id: 'forged-uuid-999',
    user_id: '<ALPHA_USER_ID>',
    title: 'Forged Document',
    document: { schemaVersion: 1, basics: { name: 'Forged' } }
  });
console.log('Insert Error:', insertError?.message);
// EXPECTED: Fails with "new row violates row-level security policy for table 'resumes'"
```

- [ ] **Verification:** All four tampering attempts in Test 2 fail securely.

### Test Scenario 3: Foreign-Key Cascade & Lineage Preservation
- [ ] In Browser 1 (User Alpha), duplicate `"Alpha Core Architecture"` to create a tailored child copy `"Alpha AWS Specialist"`.
- [ ] Verify both master and tailored copy exist in User Alpha's rack.
- [ ] Delete the master cartridge `"Alpha Core Architecture"`.
- [ ] **Verification:**
  1. The tailored copy `"Alpha AWS Specialist"` survives with `parent_resume_id = null`.
  2. The job target associated with the deleted master cartridge is purged automatically via database cascade (`ON DELETE CASCADE`).

---

## 5. Teardown & Clean Slate

After completing verification:
1. Log into Supabase Dashboard -> **Project Settings** -> **General** -> **Delete Project**.
2. Remove `.env.local` or revert to unconfigured demo mode.
3. Confirm `git status` shows zero tracked secret files.
