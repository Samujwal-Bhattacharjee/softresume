-- ─────────────────────────────────────────────────────────────────────────────
-- SoftCV Studio — Initial Database Migration (RS-041, RS-042)
-- Migration: 001_initial
-- Created: 2025-01-01
--
-- Tables:
--   resumes      — Resume documents with owner tracking
--   job_targets  — Per-resume job description / tailoring targets
--
-- All tables use Row Level Security (RLS) enforced in Postgres.
-- Server-side adapter also performs redundant user_id checks.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (already available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- resumes
-- Stores one row per resume document. The `document` column holds the full
-- JSON resume following the canonical ResumeDocument schema (schemaVersion ≥ 1).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id               TEXT        PRIMARY KEY,
    user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title            TEXT        NOT NULL DEFAULT 'Untitled Resume',
    template_id      TEXT        NOT NULL DEFAULT 'classic-ats',
    is_master        BOOLEAN     NOT NULL DEFAULT TRUE,
    parent_resume_id TEXT        REFERENCES resumes(id) ON DELETE SET NULL,
    document         JSONB       NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries: list all resumes for a user ordered by recency
CREATE INDEX IF NOT EXISTS idx_resumes_user_updated
    ON resumes (user_id, updated_at DESC);

-- Index for parent lineage lookups (tailored copies referencing master)
CREATE INDEX IF NOT EXISTS idx_resumes_parent
    ON resumes (parent_resume_id)
    WHERE parent_resume_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- job_targets
-- One optional job target per resume. Stores the raw JD and structured fields
-- the user has set for ATS tailoring of a specific resume copy.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_targets (
    id          TEXT        PRIMARY KEY,      -- mirrors resume_id for stable PK
    resume_id   TEXT        NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data        JSONB       NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_targets_user
    ON job_targets (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Automatically update updated_at on any row change
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER job_targets_updated_at
    BEFORE UPDATE ON job_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RS-042)
-- Every policy checks auth.uid() = user_id so that no SQL query from a client
-- can ever return or modify another user's data, even with a crafted ID.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE resumes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_targets  ENABLE ROW LEVEL SECURITY;

-- resumes: owners can SELECT, INSERT, UPDATE, DELETE their own rows only
CREATE POLICY "resumes: owner read"
    ON resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "resumes: owner insert"
    ON resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resumes: owner update"
    ON resumes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resumes: owner delete"
    ON resumes FOR DELETE
    USING (auth.uid() = user_id);

-- job_targets: owners can SELECT, INSERT, UPDATE, DELETE their own rows only
CREATE POLICY "job_targets: owner read"
    ON job_targets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "job_targets: owner insert"
    ON job_targets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "job_targets: owner update"
    ON job_targets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "job_targets: owner delete"
    ON job_targets FOR DELETE
    USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- END: 001_initial
-- ─────────────────────────────────────────────────────────────────────────────
