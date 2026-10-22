/**
 * Supabase (Cloud) Persistence Adapter (RS-041, RS-042)
 *
 * Implements the same PersistenceAdapter interface as local-adapter.ts so
 * that calling code in pages and editor components is identical regardless
 * of storage mode.
 *
 * This adapter:
 * - Requires an authenticated Supabase session.
 * - Uses Row Level Security — the database enforces owner checks; the adapter
 *   adds a redundant server-side userId guard to fail-safe if RLS is mis-configured.
 * - Never returns another user's data even if their ID is guessed.
 * - All mutations are validated against ResumeDocumentSchema before saving.
 *
 * SQL schema: see docs/supabase/migrations/001_initial.sql
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResumeListItem } from "@/lib/resume/local-adapter";
import type { ResumeDocument } from "@/lib/schemas/resume";
import { ResumeDocumentSchema } from "@/lib/schemas/resume";
import { migrateResumeDocument } from "@/lib/schemas/migrations";
import { generateId } from "@/lib/utils";
import type { JobTarget } from "@/lib/schemas/job-target";

// ─── Database row types ────────────────────────────────────────────────────

interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  is_master: boolean;
  parent_resume_id: string | null;
  document: ResumeDocument;
  updated_at: string;
}

interface JobTargetRow {
  id: string;
  resume_id: string;
  user_id: string;
  data: JobTarget;
  updated_at: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────

function rowToListItem(row: ResumeRow): ResumeListItem {
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
    templateId: row.template_id,
    isMaster: row.is_master,
    parentResumeId: row.parent_resume_id,
  };
}

// ─── Adapter factory ────────────────────────────────────────────────────────

export function createSupabaseAdapter(
  supabase: SupabaseClient,
  userId: string
) {
  if (!userId || typeof userId !== "string" || !userId.trim()) {
    throw new Error("createSupabaseAdapter requires a non-empty userId");
  }

  /** Verify the authenticated userId matches — belt-and-suspenders over RLS */
  function assertOwnership(row: { user_id: string }, id: string): void {
    if (row.user_id !== userId) {
      throw new Error(
        `Authorization failure: resume ${id} does not belong to user ${userId}`
      );
    }
  }

  return {
    // ── List ────────────────────────────────────────────────────────────────
    async listResumes(): Promise<ResumeListItem[]> {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, user_id, title, template_id, is_master, parent_resume_id, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw new Error(`listResumes failed: ${error.message}`);
      const list = (data as ResumeRow[]).map(rowToListItem);

      // Enrich tailored variants with target role and company from job_targets
      try {
        const { data: targetRows } = await supabase
          .from("job_targets")
          .select("resume_id, data")
          .eq("user_id", userId);

        if (targetRows && Array.isArray(targetRows)) {
          const targetMap = new Map<string, { roleTitle?: string; company?: string }>();
          for (const row of targetRows as { resume_id: string; data: JobTarget }[]) {
            if (row.data) {
              targetMap.set(row.resume_id, {
                roleTitle: row.data.roleTitle,
                company: row.data.company,
              });
            }
          }

          return list.map((item) => {
            const targetInfo = targetMap.get(item.id);
            if (targetInfo) {
              return {
                ...item,
                targetRole: targetInfo.roleTitle ?? null,
                targetCompany: targetInfo.company ?? null,
              };
            }
            return item;
          });
        }
      } catch {
        // Non-fatal if target lookup fails; return baseline list items
      }

      return list;
    },

    // ── Load ────────────────────────────────────────────────────────────────
    async loadResume(
      id: string
    ): Promise<{ meta: ResumeListItem; document: ResumeDocument } | null> {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId) // redundant RLS guard
        .single();

      if (error || !data) return null;
      const row = data as ResumeRow;
      assertOwnership(row, id);

      const document = migrateResumeDocument(row.document);
      return { meta: rowToListItem(row), document };
    },

    // ── Create ──────────────────────────────────────────────────────────────
    async createResume(
      title: string,
      document: ResumeDocument,
      options?: { isMaster?: boolean; parentResumeId?: string }
    ): Promise<ResumeListItem> {
      const validated = ResumeDocumentSchema.parse(document);
      const id = generateId();
      const now = new Date().toISOString();

      const row: ResumeRow = {
        id,
        user_id: userId,
        title,
        template_id: document.settings.templateId,
        is_master: options?.isMaster ?? true,
        parent_resume_id: options?.parentResumeId ?? null,
        document: validated,
        updated_at: now,
      };

      const { error } = await supabase.from("resumes").insert(row);
      if (error) throw new Error(`createResume failed: ${error.message}`);

      return rowToListItem(row);
    },

    // ── Save ────────────────────────────────────────────────────────────────
    async saveResume(
      id: string,
      title: string,
      document: ResumeDocument
    ): Promise<ResumeListItem> {
      const validated = ResumeDocumentSchema.parse(document);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("resumes")
        .update({
          title,
          template_id: document.settings.templateId,
          document: validated,
          updated_at: now,
        })
        .eq("id", id)
        .eq("user_id", userId) // redundant RLS guard
        .select()
        .single();

      if (error) throw new Error(`saveResume failed: ${error.message}`);
      return rowToListItem(data as ResumeRow);
    },

    // ── Duplicate ───────────────────────────────────────────────────────────
    async duplicateResume(
      id: string,
      newTitle: string,
      isMaster = false
    ): Promise<ResumeListItem | null> {
      const loaded = await this.loadResume(id);
      if (!loaded) return null;
      return this.createResume(newTitle, loaded.document, {
        isMaster,
        parentResumeId: id,
      });
    },

    // ── Tailored copy (RS-094) ──────────────────────────────────────────────
    async createTailoredCopy(
      sourceId: string,
      targetInput: {
        roleTitle: string;
        company?: string;
        jobDescription?: string;
        customTitle?: string;
      }
    ): Promise<{ meta: ResumeListItem; document: ResumeDocument; jobTarget: JobTarget }> {
      const loaded = await this.loadResume(sourceId);
      if (!loaded) {
        throw new Error(`Source cartridge "${sourceId}" not found or unauthorized.`);
      }

      const clonedDoc: ResumeDocument = structuredClone(loaded.document);
      const roleTitleTrimmed = targetInput.roleTitle.trim();
      const companyTrimmed = targetInput.company?.trim() ?? "";
      const generatedTitle =
        targetInput.customTitle?.trim() ||
        `${loaded.meta.title} — ${roleTitleTrimmed}${companyTrimmed ? ` (${companyTrimmed})` : ""}`;

      const meta = await this.createResume(generatedTitle, clonedDoc, {
        isMaster: false,
        parentResumeId: sourceId,
      });

      const target: JobTarget = {
        id: `job-target-${meta.id}`,
        resumeId: meta.id,
        roleTitle: roleTitleTrimmed,
        company: companyTrimmed,
        jobDescription: targetInput.jobDescription?.trim() ?? "",
        requirements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await this.saveJobTarget(target);
        return {
          meta: {
            ...meta,
            targetRole: roleTitleTrimmed,
            targetCompany: companyTrimmed,
          },
          document: clonedDoc,
          jobTarget: target,
        };
      } catch (err) {
        // Rollback created resume on job target failure
        await this.deleteResume(meta.id).catch(() => {});
        throw new Error(
          `Failed to initialize cloud job target: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    },

    // ── Delete ──────────────────────────────────────────────────────────────
    async deleteResume(id: string): Promise<void> {
      // Delete job target first (FK cascade may handle this, but be explicit)
      await supabase
        .from("job_targets")
        .delete()
        .eq("resume_id", id)
        .eq("user_id", userId);

      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw new Error(`deleteResume failed: ${error.message}`);
    },

    // ── Rename ──────────────────────────────────────────────────────────────
    async renameResume(id: string, newTitle: string): Promise<void> {
      const { error } = await supabase
        .from("resumes")
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw new Error(`renameResume failed: ${error.message}`);
    },

    // ── Job target ──────────────────────────────────────────────────────────
    async getJobTarget(resumeId: string): Promise<JobTarget | null> {
      const { data, error } = await supabase
        .from("job_targets")
        .select("data")
        .eq("resume_id", resumeId)
        .eq("user_id", userId)
        .single();

      if (error || !data) return null;
      return (data as JobTargetRow).data;
    },

    async saveJobTarget(
      targetOrResumeId: JobTarget | string,
      maybeTarget?: JobTarget
    ): Promise<void> {
      const target = typeof targetOrResumeId === "string" ? maybeTarget! : targetOrResumeId;
      const resumeId = typeof targetOrResumeId === "string" ? targetOrResumeId : target.resumeId;
      const now = new Date().toISOString();
      const { error } = await supabase.from("job_targets").upsert({
        id: resumeId, // use resume ID as stable PK for job target
        resume_id: resumeId,
        user_id: userId,
        data: target,
        updated_at: now,
      });

      if (error) throw new Error(`saveJobTarget failed: ${error.message}`);
    },

    async deleteJobTarget(resumeId: string): Promise<void> {
      await supabase
        .from("job_targets")
        .delete()
        .eq("resume_id", resumeId)
        .eq("user_id", userId);
    },

    // ── Bulk delete (GDPR/data controls) ───────────────────────────────────
    async deleteAllData(): Promise<void> {
      // job_targets first; resumes table may have FK
      await supabase.from("job_targets").delete().eq("user_id", userId);
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("user_id", userId);
      if (error) throw new Error(`deleteAllData failed: ${error.message}`);
    },

    /** Stub — clearTombstones is local-adapter-specific, no-op for cloud */
    clearTombstones(): void {
      // no-op — cloud adapter relies on optimistic concurrency via Supabase
    },
  };
}

export type SupabaseAdapter = ReturnType<typeof createSupabaseAdapter>;
