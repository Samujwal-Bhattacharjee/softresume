/**
 * Local persistence adapter (Demo Mode).
 *
 * When Supabase is not configured, resumes are stored in localStorage.
 * This is explicitly labelled "Demo Mode — data stored locally."
 * This module MUST NOT show a fake "Saved to cloud" state.
 *
 * The interface is designed so a Supabase adapter can be substituted
 * without changing any calling code.
 */

import {
  type ResumeDocument,
  ResumeDocumentSchema,
} from "@/lib/schemas/resume";
import { migrateResumeDocument } from "@/lib/schemas/migrations";
import { generateId } from "@/lib/utils";
import { localJobTargetAdapter } from "./job-target-adapter";
import { FRESHER_FIXTURE, EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import type { JobTarget } from "@/lib/schemas/job-target";

const STORAGE_KEY = "softcv_resumes";
const STORAGE_INDEX_KEY = "softcv_resume_index";

export interface ResumeListItem {
  id: string;
  title: string;
  updatedAt: string;
  templateId: string;
  isMaster: boolean;
  parentResumeId?: string | null;
  targetRole?: string | null;
  targetCompany?: string | null;
}

export interface SoftCVBackup {
  version: "1.0.0";
  schemaVersion: number;
  exportedAt: string;
  app: "SoftCV Studio";
  storageMode: "localStorage";
  totalResumes: number;
  resumes: Array<{
    meta: ResumeListItem;
    document: ResumeDocument;
    jobTarget?: JobTarget | null;
  }>;
}

// Track IDs deleted in this session to prevent race-condition resurrection by debounced autosave
const tombstonedIds = new Set<string>();

function readIndex(): ResumeListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_INDEX_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ResumeListItem[];
    // Enrich with targetRole & targetCompany from localJobTargetAdapter if absent
    return list.map((item) => {
      if (!item.isMaster && item.parentResumeId && (!item.targetRole || !item.targetCompany)) {
        const target = localJobTargetAdapter.getJobTarget(item.id);
        if (target) {
          return {
            ...item,
            targetRole: item.targetRole ?? target.roleTitle ?? null,
            targetCompany: item.targetCompany ?? target.company ?? null,
          };
        }
      }
      return item;
    });
  } catch {
    return [];
  }
}

function writeIndex(index: ResumeListItem[]): void {
  localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
}

function readDocument(id: string): ResumeDocument | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrateResumeDocument(parsed);
  } catch {
    return null;
  }
}

function writeDocument(id: string, doc: ResumeDocument): void {
  const validated = ResumeDocumentSchema.parse(doc);
  localStorage.setItem(`${STORAGE_KEY}_${id}`, JSON.stringify(validated));
}

// ─────────────────────────────────────────────
// Public adapter interface
// ─────────────────────────────────────────────

export const localAdapter = {
  /** List all resumes for the current user (local only) */
  listResumes(): ResumeListItem[] {
    return readIndex().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  /** Load a single resume by ID */
  loadResume(id: string): { meta: ResumeListItem; document: ResumeDocument } | null {
    if (tombstonedIds.has(id)) return null;
    const index = readIndex();
    const meta = index.find((r) => r.id === id);
    if (!meta) return null;
    const document = readDocument(id);
    if (!document) return null;
    return { meta, document };
  },

  /** Create a new resume */
  createResume(
    title: string,
    document: ResumeDocument,
    options?: {
      isMaster?: boolean;
      parentResumeId?: string | null;
      targetRole?: string | null;
      targetCompany?: string | null;
    }
  ): ResumeListItem {
    const id = generateId();
    const now = new Date().toISOString();
    const meta: ResumeListItem = {
      id,
      title,
      updatedAt: now,
      templateId: document.settings.templateId,
      isMaster: options?.isMaster ?? true,
      parentResumeId: options?.parentResumeId ?? null,
      targetRole: options?.targetRole ?? null,
      targetCompany: options?.targetCompany ?? null,
    };
    tombstonedIds.delete(id);
    writeDocument(id, document);
    const index = readIndex();
    writeIndex([meta, ...index]);
    return meta;
  },

  /**
   * Save (update) an existing resume.
   * Guarded against resurrecting deleted records from pending debounced autosaves.
   */
  saveResume(
    id: string,
    title: string,
    document: ResumeDocument
  ): ResumeListItem {
    if (tombstonedIds.has(id)) {
      throw new Error(`Cannot save resume "${id}": Cartridge was deleted.`);
    }

    const index = readIndex();
    const existingIdx = index.findIndex((r) => r.id === id);

    const now = new Date().toISOString();
    const meta: ResumeListItem = {
      id,
      title,
      updatedAt: now,
      templateId: document.settings.templateId,
      isMaster: existingIdx >= 0 ? index[existingIdx].isMaster : true,
      parentResumeId: existingIdx >= 0 ? index[existingIdx].parentResumeId ?? null : null,
      targetRole: existingIdx >= 0 ? index[existingIdx].targetRole ?? null : null,
      targetCompany: existingIdx >= 0 ? index[existingIdx].targetCompany ?? null : null,
    };

    writeDocument(id, document);
    if (existingIdx >= 0) {
      index[existingIdx] = meta;
    } else {
      index.unshift(meta);
    }
    writeIndex(index);
    return meta;
  },

  /** Duplicate a resume (creates independent copy) */
  duplicateResume(
    id: string,
    newTitle: string,
    isMaster = false
  ): ResumeListItem | null {
    const loaded = this.loadResume(id);
    if (!loaded) return null;
    const clonedDoc: ResumeDocument = structuredClone(loaded.document);
    const sourceTarget = this.getJobTarget(id);
    const meta = this.createResume(newTitle, clonedDoc, {
      isMaster,
      parentResumeId: isMaster ? null : id,
      targetRole: sourceTarget?.roleTitle ?? null,
      targetCompany: sourceTarget?.company ?? null,
    });
    if (sourceTarget) {
      this.saveJobTarget({
        ...structuredClone(sourceTarget),
        id: `job-target-${meta.id}`,
        resumeId: meta.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return meta;
  },

  /**
   * Create an independent tailored copy associated with a job target (RS-094).
   * Performs deep clone to guarantee master immutability and no shared references.
   * Atomic rollback if job target persistence fails.
   */
  createTailoredCopy(
    sourceId: string,
    targetInput: {
      roleTitle: string;
      company?: string;
      jobDescription?: string;
      customTitle?: string;
    }
  ): { meta: ResumeListItem; document: ResumeDocument; jobTarget: JobTarget } {
    const loaded = this.loadResume(sourceId);
    if (!loaded) {
      throw new Error(`Source cartridge "${sourceId}" not found in local sectors.`);
    }

    // 100% deep clone: zero shared memory references
    const clonedDoc: ResumeDocument = structuredClone(loaded.document);

    const roleTitleTrimmed = targetInput.roleTitle.trim();
    const companyTrimmed = targetInput.company?.trim() ?? "";
    const generatedTitle =
      targetInput.customTitle?.trim() ||
      `${loaded.meta.title} — ${roleTitleTrimmed}${companyTrimmed ? ` (${companyTrimmed})` : ""}`;

    const meta = this.createResume(generatedTitle, clonedDoc, {
      isMaster: false,
      parentResumeId: sourceId,
      targetRole: roleTitleTrimmed,
      targetCompany: companyTrimmed,
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
      const savedTarget = this.saveJobTarget(target);
      return { meta, document: clonedDoc, jobTarget: savedTarget };
    } catch (err) {
      // Rollback newly created resume if target initialization fails
      this.deleteResume(meta.id);
      throw new Error(
        `Failed to initialize job target for tailored copy: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  },

  /** Delete a single resume and its associated job target */
  deleteResume(id: string): void {
    tombstonedIds.add(id);
    const index = readIndex().filter((r) => r.id !== id);
    writeIndex(index);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${STORAGE_KEY}_${id}`);
      localJobTargetAdapter.deleteJobTarget(id);
    }
  },

  /** Rename a resume */
  renameResume(id: string, newTitle: string): void {
    const index = readIndex();
    const meta = index.find((r) => r.id === id);
    if (meta) {
      meta.title = newTitle;
      writeIndex(index);
    }
  },

  /**
   * Export all local resumes and job targets as a schema-versioned JSON backup (RS-043).
   * Validated against ResumeDocumentSchema and excludes secrets/session tokens.
   */
  exportAllData(): SoftCVBackup {
    const index = readIndex();
    const resumes: SoftCVBackup["resumes"] = [];

    for (const item of index) {
      if (tombstonedIds.has(item.id)) continue;
      const doc = readDocument(item.id);
      if (doc) {
        const validatedDoc = ResumeDocumentSchema.parse(doc);
        const jobTarget = localJobTargetAdapter.getJobTarget(item.id);
        resumes.push({
          meta: item,
          document: validatedDoc,
          jobTarget: jobTarget ?? undefined,
        });
      }
    }

    return {
      version: "1.0.0",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      app: "SoftCV Studio",
      storageMode: "localStorage",
      totalResumes: resumes.length,
      resumes,
    };
  },

  /**
   * Permanently delete all application-owned data (RS-043, RS-154).
   * Strictly deletes only `softcv_*` keys from localStorage, leaving unrelated
   * site data and other origins completely untouched.
   */
  deleteAllData(): void {
    if (typeof window === "undefined") return;
    const index = readIndex();
    for (const item of index) {
      tombstonedIds.add(item.id);
    }

    const appKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("softcv_")) {
        appKeys.push(key);
      }
    }

    for (const key of appKeys) {
      localStorage.removeItem(key);
    }
  },

  /**
   * Reset synthetic sample/demo data (RS-043, RS-162).
   * Replaces existing demo data with fresh synthetic demo cartridges.
   */
  resetDemoData(): ResumeListItem[] {
    // Clear existing app data
    this.deleteAllData();

    // Create fresh synthetic sample cartridges
    const fresher = this.createResume(
      "Priya Mehta — CS Graduate Demo",
      FRESHER_FIXTURE,
      { isMaster: true }
    );
    const experienced = this.createResume(
      "Rohan Kapoor — Senior Staff Engineer Demo",
      EXPERIENCED_FIXTURE,
      { isMaster: true }
    );

    return [fresher, experienced];
  },

  /** Job Target management (RS-090) */
  getJobTarget(resumeId: string): JobTarget | null {
    return localJobTargetAdapter.getJobTarget(resumeId);
  },

  saveJobTarget(
    targetOrResumeId: JobTarget | string,
    maybeTarget?: JobTarget
  ): JobTarget {
    const target = typeof targetOrResumeId === "string" ? maybeTarget! : targetOrResumeId;
    return localJobTargetAdapter.saveJobTarget(target);
  },

  deleteJobTarget(resumeId: string): void {
    localJobTargetAdapter.deleteJobTarget(resumeId);
  },

  /** Reset internal tombstone state (primarily for tests) */
  clearTombstones(): void {
    tombstonedIds.clear();
  },
} as const;

export type PersistenceAdapter = typeof localAdapter;
