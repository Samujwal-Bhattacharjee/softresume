-- ─────────────────────────────────────────────────────────────────────────────
-- SoftCV Studio — Supabase Database & RLS Isolation Tests (RS-042 / RS-172)
--
-- pgTAP test file for local Supabase test runner (`supabase test db`).
-- Official Reference: https://supabase.com/docs/guides/local-development/testing/overview
--
-- This suite validates the database kernel authorization rules:
--   1. RLS is active on public.resumes and public.job_targets
--   2. Anonymous role cannot read or mutate records
--   3. Authenticated User A can manage User A's own records
--   4. Authenticated User B cannot SELECT, UPDATE, or DELETE User A's records
--   5. Authenticated User B cannot forge user_id = User A on INSERT (WITH CHECK)
--   6. Cross-user job target attachment is rejected
--   7. Foreign key cascades cleanly delete job_targets upon resume removal
--   8. Parent resume deletion preserves tailored variant (ON DELETE SET NULL)
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- Load pgTAP extension if available in test db
CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(16);

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Table Existence & RLS Activation
-- ─────────────────────────────────────────────────────────────────────────────
SELECT has_table('public', 'resumes', 'Table public.resumes exists');
SELECT has_table('public', 'job_targets', 'Table public.job_targets exists');

-- Check RLS is enabled on both tables
SELECT results_eq(
    $$ SELECT relrowsecurity FROM pg_class WHERE relname = 'resumes' AND relnamespace = 'public'::regnamespace $$,
    $$ VALUES (true) $$,
    'RLS is enabled on public.resumes'
);

SELECT results_eq(
    $$ SELECT relrowsecurity FROM pg_class WHERE relname = 'job_targets' AND relnamespace = 'public'::regnamespace $$,
    $$ VALUES (true) $$,
    'RLS is enabled on public.job_targets'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Mock Test Users Setup
-- ─────────────────────────────────────────────────────────────────────────────
-- Note: In Supabase, auth.users contains registered users.
-- We create two temporary fixture users if not already present.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111') THEN
        INSERT INTO auth.users (id, email, raw_user_meta_data)
        VALUES ('11111111-1111-1111-1111-111111111111', 'user_a@softcv.test', '{"role":"candidate"}'::jsonb);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222') THEN
        INSERT INTO auth.users (id, email, raw_user_meta_data)
        VALUES ('22222222-2222-2222-2222-222222222222', 'user_b@softcv.test', '{"role":"candidate"}'::jsonb);
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Anonymous Role Access Test
-- ─────────────────────────────────────────────────────────────────────────────
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" = '{"role": "anon"}';

SELECT is_empty(
    $$ SELECT * FROM public.resumes $$,
    'Anon role cannot read any resumes'
);

SELECT throws_ok(
    $$ INSERT INTO public.resumes (id, user_id, title, document) VALUES ('res-anon', '11111111-1111-1111-1111-111111111111', 'Hacked', '{}'::jsonb) $$,
    'new row violates row-level security policy for table "resumes"',
    'Anon role cannot insert resumes'
);

SELECT is_empty(
    $$ SELECT * FROM public.job_targets $$,
    'Anon role cannot read any job targets'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Authenticated User A Operations
-- ─────────────────────────────────────────────────────────────────────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- User A creates master resume
INSERT INTO public.resumes (id, user_id, title, document, is_master)
VALUES ('res-user-a-1', '11111111-1111-1111-1111-111111111111', 'User A Master Resume', '{"schemaVersion":1,"basics":{"name":"User A"}}'::jsonb, true);

-- User A attaches job target
INSERT INTO public.job_targets (id, resume_id, user_id, data)
VALUES ('res-user-a-1', 'res-user-a-1', '11111111-1111-1111-1111-111111111111', '{"targetRole":"Staff Engineer"}'::jsonb);

SELECT results_eq(
    $$ SELECT title FROM public.resumes WHERE id = 'res-user-a-1' $$,
    $$ VALUES ('User A Master Resume'::text) $$,
    'User A can select their own resume'
);

SELECT results_eq(
    $$ SELECT data->>'targetRole' FROM public.job_targets WHERE resume_id = 'res-user-a-1' $$,
    $$ VALUES ('Staff Engineer'::text) $$,
    'User A can select their own job target'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Authenticated User B Cross-User Isolation (IDOR Defense)
-- ─────────────────────────────────────────────────────────────────────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

SELECT is_empty(
    $$ SELECT * FROM public.resumes WHERE id = 'res-user-a-1' $$,
    'User B cannot select User A resume even with exact UUID'
);

SELECT is_empty(
    $$ SELECT * FROM public.job_targets WHERE resume_id = 'res-user-a-1' $$,
    'User B cannot select User A job target even with exact UUID'
);

-- User B attempts to overwrite User A's resume title
DO $$
DECLARE
    rows_affected int;
BEGIN
    UPDATE public.resumes SET title = 'Overwritten by User B' WHERE id = 'res-user-a-1';
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected > 0 THEN
        RAISE EXCEPTION 'SECURITY BREACH: User B modified User A resume';
    END IF;
END $$;

SELECT pass('User B UPDATE on User A resume affects 0 rows due to RLS USING clause');

-- User B attempts to forge User A's user_id on INSERT
SELECT throws_ok(
    $$ INSERT INTO public.resumes (id, user_id, title, document) VALUES ('res-forged', '11111111-1111-1111-1111-111111111111', 'Forged', '{}'::jsonb) $$,
    'new row violates row-level security policy for table "resumes"',
    'User B cannot insert row claiming User A user_id (RLS WITH CHECK)'
);

-- User B creates their own resume
INSERT INTO public.resumes (id, user_id, title, document, is_master)
VALUES ('res-user-b-1', '22222222-2222-2222-2222-222222222222', 'User B Resume', '{"schemaVersion":1,"basics":{"name":"User B"}}'::jsonb, true);

-- User B attempts to link their job target to User A's resume
SELECT throws_ok(
    $$ INSERT INTO public.job_targets (id, resume_id, user_id, data) VALUES ('res-user-a-1', 'res-user-a-1', '22222222-2222-2222-2222-222222222222', '{}'::jsonb) $$,
    'new row violates row-level security policy for table "job_targets"',
    'User B cannot attach job target to User A resume'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Foreign-Key Cascade & Lineage Tests
-- ─────────────────────────────────────────────────────────────────────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- Create tailored child variant
INSERT INTO public.resumes (id, user_id, title, document, is_master, parent_resume_id)
VALUES ('res-user-a-child', '11111111-1111-1111-1111-111111111111', 'Tailored Child', '{"schemaVersion":1,"basics":{"name":"User A"}}'::jsonb, false, 'res-user-a-1');

-- Delete parent master resume
DELETE FROM public.resumes WHERE id = 'res-user-a-1';

-- Verify child tailored variant survives with parent_resume_id = NULL
SELECT results_eq(
    $$ SELECT parent_resume_id FROM public.resumes WHERE id = 'res-user-a-child' $$,
    $$ VALUES (NULL::text) $$,
    'Parent master deletion sets child parent_resume_id to NULL (ON DELETE SET NULL)'
);

-- Verify User A's job target was deleted automatically via CASCADE
SELECT is_empty(
    $$ SELECT * FROM public.job_targets WHERE resume_id = 'res-user-a-1' $$,
    'Deleting resume cascades to delete associated job target (ON DELETE CASCADE)'
);

SELECT * FROM finish();

ROLLBACK;
