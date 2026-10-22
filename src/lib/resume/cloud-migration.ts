/**
 * Local-to-Cloud Migration Framework (RS-041, RS-042, RS-063)
 *
 * Provides a deliberate, user-controlled workflow to move browser-local resumes
 * and job targets to an authenticated Supabase cloud account.
 *
 * Guarantees:
 * 1. Explicit user consent — never automatically uploads without user trigger.
 * 2. Pre-upload Zod validation — malformed local records are flagged and quarantined.
 * 3. Idempotent retries — detects existing cloud records by title to prevent duplicate cartridge spam.
 * 4. Zero silent deletion — local records are PRESERVED until the user explicitly confirms cleanup after review.
 * 5. Demo fixture exclusion — synthetic specimens (Priya Mehta / Rohan Kapoor) are excluded by default unless requested.
 * 6. Partial failure tolerance — reports per-item status and allows retrying failed items.
 */

import { localAdapter, type ResumeListItem } from "@/lib/resume/local-adapter";
import { localJobTargetAdapter } from "@/lib/resume/job-target-adapter";
import { ResumeDocumentSchema, type ResumeDocument } from "@/lib/schemas/resume";
import type { JobTarget } from "@/lib/schemas/job-target";
import type { SupabaseAdapter } from "@/lib/resume/supabase-adapter";

export interface MigrationCandidate {
  localId: string;
  title: string;
  templateId: string;
  isMaster: boolean;
  parentResumeId: string | null;
  updatedAt: string;
  document: ResumeDocument | null;
  jobTarget: JobTarget | null;
  isValid: boolean;
  validationError?: string;
  isDemoFixture: boolean;
}

export interface MigrationPlan {
  candidates: MigrationCandidate[];
  totalLocalCount: number;
  validUserCount: number;
  demoCount: number;
  invalidCount: number;
}

export interface MigrationItemResult {
  localId: string;
  title: string;
  success: boolean;
  cloudId?: string;
  skipped?: boolean;
  error?: string;
}

export interface MigrationBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: MigrationItemResult[];
}

/**
 * Checks whether a resume title indicates a synthetic demo fixture.
 */
export function isDemoFixtureTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes("demo") ||
    lower.includes("priya mehta") ||
    lower.includes("rohan kapoor") ||
    lower.includes("specimen")
  );
}

/**
 * Plans a migration from browser-local storage to cloud.
 * Inspects all local records, validates them, and categorizes demo vs user content.
 */
export function planLocalMigration(options: {
  includeDemo?: boolean;
} = {}): MigrationPlan {
  const localList = localAdapter.listResumes();
  const candidates: MigrationCandidate[] = [];

  let validUserCount = 0;
  let demoCount = 0;
  let invalidCount = 0;

  for (const item of localList) {
    const isDemo = isDemoFixtureTitle(item.title);
    if (isDemo) {
      demoCount++;
      if (!options.includeDemo) {
        continue;
      }
    }

    const loaded = localAdapter.loadResume(item.id);
    const jobTarget = localJobTargetAdapter.getJobTarget(item.id);

    if (!loaded) {
      invalidCount++;
      candidates.push({
        localId: item.id,
        title: item.title,
        templateId: item.templateId,
        isMaster: item.isMaster,
        parentResumeId: item.parentResumeId ?? null,
        updatedAt: item.updatedAt,
        document: null,
        jobTarget,
        isValid: false,
        validationError: "Cartridge document payload could not be loaded from local storage.",
        isDemoFixture: isDemo,
      });
      continue;
    }

    const parseResult = ResumeDocumentSchema.safeParse(loaded.document);
    if (!parseResult.success) {
      invalidCount++;
      candidates.push({
        localId: item.id,
        title: item.title,
        templateId: item.templateId,
        isMaster: item.isMaster,
        parentResumeId: item.parentResumeId ?? null,
        updatedAt: item.updatedAt,
        document: loaded.document,
        jobTarget,
        isValid: false,
        validationError: parseResult.error.issues[0]?.message ?? "Invalid resume schema shape",
        isDemoFixture: isDemo,
      });
    } else {
      validUserCount++;
      candidates.push({
        localId: item.id,
        title: item.title,
        templateId: item.templateId,
        isMaster: item.isMaster,
        parentResumeId: item.parentResumeId ?? null,
        updatedAt: item.updatedAt,
        document: parseResult.data,
        jobTarget,
        isValid: true,
        isDemoFixture: isDemo,
      });
    }
  }

  return {
    candidates,
    totalLocalCount: localList.length,
    validUserCount,
    demoCount,
    invalidCount,
  };
}

/**
 * Migrates a batch of validated local candidates to the user's Supabase cloud account.
 * Supports idempotency: if a resume with the same title already exists in the cloud account,
 * it can be skipped or linked rather than creating duplicates.
 *
 * Crucial: Does NOT delete any local records.
 */
export async function executeCloudMigration(
  candidates: MigrationCandidate[],
  cloudAdapter: SupabaseAdapter,
  options: {
    skipDuplicates?: boolean;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<MigrationBatchResult> {
  const skipDuplicates = options.skipDuplicates ?? true;
  const results: MigrationItemResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  // Fetch current cloud resumes once for fast duplicate checking
  let existingCloudResumes: ResumeListItem[] = [];
  try {
    existingCloudResumes = await cloudAdapter.listResumes();
  } catch {
    existingCloudResumes = [];
  }

  const existingTitles = new Map<string, string>();
  for (const r of existingCloudResumes) {
    existingTitles.set(r.title.toLowerCase().trim(), r.id);
  }

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];

    if (!candidate.isValid || !candidate.document) {
      failed++;
      results.push({
        localId: candidate.localId,
        title: candidate.title,
        success: false,
        error: candidate.validationError ?? "Candidate failed pre-flight schema validation.",
      });
      options.onProgress?.(i + 1, candidates.length);
      continue;
    }

    const normalizedTitle = candidate.title.toLowerCase().trim();
    if (skipDuplicates && existingTitles.has(normalizedTitle)) {
      skipped++;
      results.push({
        localId: candidate.localId,
        title: candidate.title,
        success: true,
        cloudId: existingTitles.get(normalizedTitle),
        skipped: true,
      });
      options.onProgress?.(i + 1, candidates.length);
      continue;
    }

    try {
      // 1. Create the cloud resume
      const cloudMeta = await cloudAdapter.createResume(
        candidate.title,
        candidate.document,
        {
          isMaster: candidate.isMaster,
          parentResumeId: candidate.parentResumeId ?? undefined,
        }
      );

      // 2. Associate Job Target if present
      if (candidate.jobTarget) {
        await cloudAdapter.saveJobTarget({
          ...candidate.jobTarget,
          resumeId: cloudMeta.id,
        });
      }

      existingTitles.set(normalizedTitle, cloudMeta.id);
      succeeded++;
      results.push({
        localId: candidate.localId,
        title: candidate.title,
        success: true,
        cloudId: cloudMeta.id,
      });
    } catch (err) {
      failed++;
      results.push({
        localId: candidate.localId,
        title: candidate.title,
        success: false,
        error: err instanceof Error ? err.message : "Unknown cloud upload error",
      });
    }

    options.onProgress?.(i + 1, candidates.length);
  }

  return {
    total: candidates.length,
    succeeded,
    failed,
    skipped,
    results,
  };
}

/**
 * Cleans up local records only after explicit user confirmation following a verified migration.
 */
export function purgeMigratedLocalRecords(localIds: string[]): {
  purgedCount: number;
} {
  let purgedCount = 0;
  for (const id of localIds) {
    try {
      localAdapter.deleteResume(id);
      purgedCount++;
    } catch {
      // Ignore errors during individual item purge
    }
  }
  return { purgedCount };
}
