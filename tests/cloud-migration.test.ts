/**
 * Cloud Migration Unit Tests (RS-041, RS-042, RS-063)
 *
 * Verifies:
 * - Local-to-cloud migration planning
 * - Exclusion of demo fixtures by default
 * - Schema validation of local records before cloud write
 * - Idempotent upload (avoiding duplicate creation on retry)
 * - Job target migration and re-keying
 * - Non-destructive behavior (local records stay intact until explicit user purge)
 * - Safe handling of malformed records and Unicode strings
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  planLocalMigration,
  executeCloudMigration,
  purgeMigratedLocalRecords,
  isDemoFixtureTitle,
} from "@/lib/resume/cloud-migration";
import { localAdapter } from "@/lib/resume/local-adapter";
import { localJobTargetAdapter } from "@/lib/resume/job-target-adapter";
import { createEmptyResume, type ResumeDocument } from "@/lib/schemas/resume";
import type { JobTarget } from "@/lib/schemas/job-target";
import type { SupabaseAdapter } from "@/lib/resume/supabase-adapter";

describe("Cloud Migration Framework", () => {
  beforeEach(() => {
    localStorage.clear();
    localAdapter.clearTombstones();
  });

  describe("isDemoFixtureTitle", () => {
    it("identifies demo fixtures correctly", () => {
      expect(isDemoFixtureTitle("Priya Mehta — CS Graduate Demo")).toBe(true);
      expect(isDemoFixtureTitle("Rohan Kapoor — Senior Staff Engineer Demo")).toBe(true);
      expect(isDemoFixtureTitle("Specimen Cartridge")).toBe(true);
      expect(isDemoFixtureTitle("Jane Doe Software Engineer")).toBe(false);
      expect(isDemoFixtureTitle("Full Stack Dev 2026")).toBe(false);
    });
  });

  describe("planLocalMigration", () => {
    it("returns empty candidates when local storage is empty", () => {
      const plan = planLocalMigration();
      expect(plan.totalLocalCount).toBe(0);
      expect(plan.candidates).toEqual([]);
      expect(plan.validUserCount).toBe(0);
    });

    it("excludes demo fixtures by default but includes them when requested", () => {
      localAdapter.resetDemoData(); // Seeds Priya and Rohan demos
      localAdapter.createResume("My Real Resume", createEmptyResume(), { isMaster: true });

      const defaultPlan = planLocalMigration({ includeDemo: false });
      expect(defaultPlan.totalLocalCount).toBe(3);
      expect(defaultPlan.candidates.length).toBe(1);
      expect(defaultPlan.candidates[0].title).toBe("My Real Resume");
      expect(defaultPlan.demoCount).toBe(2);

      const allPlan = planLocalMigration({ includeDemo: true });
      expect(allPlan.candidates.length).toBe(3);
    });

    it("flags corrupted local documents as invalid without crashing", () => {
      const resume = localAdapter.createResume("Valid Resume", createEmptyResume(), { isMaster: true });
      // Deliberately corrupt document storage for this resume
      localStorage.setItem(`softcv_resumes_${resume.id}`, "CORRUPTED_NON_JSON_DATA{{{{");

      const plan = planLocalMigration({ includeDemo: false });
      expect(plan.candidates.length).toBe(1);
      expect(plan.candidates[0].isValid).toBe(false);
      expect(plan.invalidCount).toBe(1);
      expect(plan.validUserCount).toBe(0);
    });

    it("associates local job targets with candidate", () => {
      const resume = localAdapter.createResume("Targeted Resume", createEmptyResume(), { isMaster: true });
      localJobTargetAdapter.saveJobTarget({
        id: resume.id,
        resumeId: resume.id,
        roleTitle: "Staff Platform Engineer",
        company: "Retro Corp",
        jobDescription: "Kubernetes, Rust, Distributed Systems",
        requirements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const plan = planLocalMigration({ includeDemo: false });
      expect(plan.candidates[0].jobTarget).not.toBeNull();
      expect(plan.candidates[0].jobTarget?.roleTitle).toBe("Staff Platform Engineer");
    });
  });

  describe("executeCloudMigration", () => {
    function createMockCloudAdapter(): {
      adapter: SupabaseAdapter;
      cloudResumes: Array<{ id: string; title: string; document: ResumeDocument }>;
      jobTargets: Map<string, JobTarget>;
    } {
      const cloudResumes: Array<{ id: string; title: string; document: ResumeDocument }> = [];
      const jobTargets = new Map<string, JobTarget>();

      const adapter = {
        listResumes: vi.fn(async () =>
          cloudResumes.map((r) => ({
            id: r.id,
            title: r.title,
            updatedAt: new Date().toISOString(),
            templateId: "classic-ats",
            isMaster: true,
            parentResumeId: null,
          }))
        ),
        loadResume: vi.fn(async (id: string) => {
          const found = cloudResumes.find((r) => r.id === id);
          if (!found) return null;
          return {
            meta: {
              id: found.id,
              title: found.title,
              updatedAt: new Date().toISOString(),
              templateId: "classic-ats",
              isMaster: true,
              parentResumeId: null,
            },
            document: found.document,
          };
        }),
        createResume: vi.fn(async (title: string, document: ResumeDocument) => {
          const id = `cloud-${Math.random().toString(36).slice(2, 9)}`;
          cloudResumes.push({ id, title, document });
          return {
            id,
            title,
            updatedAt: new Date().toISOString(),
            templateId: document.settings?.templateId ?? "classic-ats",
            isMaster: true,
            parentResumeId: null,
          };
        }),
        saveResume: vi.fn(async () => {
          throw new Error("Not implemented in test");
        }),
        duplicateResume: vi.fn(async () => null),
        deleteResume: vi.fn(async () => {}),
        renameResume: vi.fn(async () => {}),
        getJobTarget: vi.fn(async (id: string) => jobTargets.get(id) ?? null),
        saveJobTarget: vi.fn(async (targetOrResumeId: JobTarget | string, maybeTarget?: JobTarget) => {
          const target = typeof targetOrResumeId === "string" ? maybeTarget! : targetOrResumeId;
          const resumeId = typeof targetOrResumeId === "string" ? targetOrResumeId : target.resumeId;
          jobTargets.set(resumeId, target);
        }),
        deleteJobTarget: vi.fn(async (id: string) => {
          jobTargets.delete(id);
        }),
        deleteAllData: vi.fn(async () => {}),
        clearTombstones: vi.fn(() => {}),
      } as unknown as SupabaseAdapter;

      return { adapter, cloudResumes, jobTargets };
    }

    it("migrates valid candidates to cloud and preserves local storage", async () => {
      const localResume = localAdapter.createResume("My Tokyo Resume", {
        ...createEmptyResume(),
        basics: {
          ...createEmptyResume().basics,
          name: "佐藤 健一 (Kenichi Sato)",
          location: "Tokyo, Japan 🇯🇵",
        },
      }, { isMaster: true });

      const plan = planLocalMigration();
      const mock = createMockCloudAdapter();

      const batchResult = await executeCloudMigration(plan.candidates, mock.adapter);

      expect(batchResult.total).toBe(1);
      expect(batchResult.succeeded).toBe(1);
      expect(batchResult.failed).toBe(0);
      expect(batchResult.results[0].success).toBe(true);
      expect(mock.cloudResumes.length).toBe(1);
      expect(mock.cloudResumes[0].title).toBe("My Tokyo Resume");
      expect(mock.cloudResumes[0].document.basics.name).toBe("佐藤 健一 (Kenichi Sato)");

      // Local storage must still be intact!
      const stillInLocal = localAdapter.loadResume(localResume.id);
      expect(stillInLocal).not.toBeNull();
      expect(stillInLocal?.meta.title).toBe("My Tokyo Resume");
    });

    it("is idempotent: skips duplicates when candidate title already exists in cloud", async () => {
      localAdapter.createResume("Existing Project", createEmptyResume(), { isMaster: true });
      const plan = planLocalMigration();
      const mock = createMockCloudAdapter();

      // Seed cloud with the same title
      await mock.adapter.createResume("Existing Project", createEmptyResume());

      const batchResult = await executeCloudMigration(plan.candidates, mock.adapter, {
        skipDuplicates: true,
      });

      expect(batchResult.total).toBe(1);
      expect(batchResult.succeeded).toBe(0);
      expect(batchResult.skipped).toBe(1);
      expect(mock.cloudResumes.length).toBe(1); // Did not add a duplicate!
    });

    it("associates job target with newly created cloud resume ID", async () => {
      const resume = localAdapter.createResume("Product Lead", createEmptyResume(), { isMaster: true });
      localJobTargetAdapter.saveJobTarget({
        id: resume.id,
        resumeId: resume.id,
        roleTitle: "Head of Product",
        company: "Nintendo Kyoto",
        jobDescription: "Console gaming platforms",
        requirements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const plan = planLocalMigration();
      const mock = createMockCloudAdapter();

      const batchResult = await executeCloudMigration(plan.candidates, mock.adapter);
      expect(batchResult.succeeded).toBe(1);

      const createdCloudId = batchResult.results[0].cloudId!;
      expect(mock.jobTargets.has(createdCloudId)).toBe(true);
      expect(mock.jobTargets.get(createdCloudId)?.company).toBe("Nintendo Kyoto");
    });

    it("tolerates partial failure without halting remaining migrations", async () => {
      localAdapter.createResume("First Resume", createEmptyResume(), { isMaster: true });
      localAdapter.createResume("Second Resume", createEmptyResume(), { isMaster: true });

      const plan = planLocalMigration();
      const mock = createMockCloudAdapter();

      // Make createResume fail on the first call, succeed on second
      let callCount = 0;
      vi.mocked(mock.adapter.createResume).mockImplementation(async (title) => {
        callCount++;
        if (callCount === 1) {
          throw new Error("Supabase 503 Service Unavailable");
        }
        return {
          id: "cloud-2",
          title,
          updatedAt: new Date().toISOString(),
          templateId: "classic-ats",
          isMaster: true,
          parentResumeId: null,
        };
      });

      const batchResult = await executeCloudMigration(plan.candidates, mock.adapter);

      expect(batchResult.total).toBe(2);
      expect(batchResult.failed).toBe(1);
      expect(batchResult.succeeded).toBe(1);
      expect(batchResult.results[0].error).toContain("Supabase 503");
      expect(batchResult.results[1].success).toBe(true);
    });
  });

  describe("purgeMigratedLocalRecords", () => {
    it("deletes only the specified local records upon user confirmation", () => {
      const r1 = localAdapter.createResume("Resume 1", createEmptyResume(), { isMaster: true });
      const r2 = localAdapter.createResume("Resume 2", createEmptyResume(), { isMaster: true });

      const result = purgeMigratedLocalRecords([r1.id]);
      expect(result.purgedCount).toBe(1);

      expect(localAdapter.loadResume(r1.id)).toBeNull();
      expect(localAdapter.loadResume(r2.id)).not.toBeNull();
    });
  });
});
