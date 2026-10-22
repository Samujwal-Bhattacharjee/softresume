/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RS-094 — Tailored Resume Branching, Master Immutability & Lineage Tests
 *
 * Validates:
 * 1. Deep cloning and complete memory independence between master and variants.
 * 2. Nested repeatable section isolation (bullets, skills, projects, custom sections).
 * 3. Master immutability: mutating variant leaves master byte-for-byte intact; mutating master does not mutate variant.
 * 4. Lineage persistence across reload (parentResumeId, targetRole, targetCompany).
 * 5. Atomic rollback if job target creation fails (no orphan half-created resumes).
 * 6. Deletion safety boundaries: deleting variant removes only variant + job target, leaving master intact.
 *    Deleting master does not delete child variants (sets parent to null or keeps child intact).
 * 7. Cloud adapter ownership enforcement: cross-user source resume cannot be cloned.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { localAdapter } from "@/lib/resume/local-adapter";
import { localJobTargetAdapter } from "@/lib/resume/job-target-adapter";
import { createSupabaseAdapter } from "@/lib/resume/supabase-adapter";
import type { ResumeDocument } from "@/lib/schemas/resume";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("RS-094: Job-Specific Resume Copy Workflow", () => {
  beforeEach(() => {
    localStorage.clear();
    localAdapter.clearTombstones();
  });

  describe("Local Adapter Tailoring & Deep Clone Isolation", () => {
    it("creates a tailored variant with explicit lineage and attached job target", () => {
      // 1. Create Master
      const masterMeta = localAdapter.createResume(
        "Samantha Lee — Principal Master",
        EXPERIENCED_FIXTURE,
        { isMaster: true }
      );
      expect(masterMeta.isMaster).toBe(true);
      expect(masterMeta.parentResumeId).toBeNull();

      // 2. Branch Tailored Copy
      const { meta: tailoredMeta, document: tailoredDoc, jobTarget } =
        localAdapter.createTailoredCopy(masterMeta.id, {
          roleTitle: "Staff Platform Engineer",
          company: "CloudScale Systems",
          jobDescription: "Looking for Kubernetes, Golang, and distributed cache experience.",
        });

      expect(tailoredMeta.id).not.toBe(masterMeta.id);
      expect(tailoredMeta.isMaster).toBe(false);
      expect(tailoredMeta.parentResumeId).toBe(masterMeta.id);
      expect(tailoredMeta.targetRole).toBe("Staff Platform Engineer");
      expect(tailoredMeta.targetCompany).toBe("CloudScale Systems");
      expect(tailoredMeta.title).toContain("Staff Platform Engineer");
      expect(tailoredMeta.title).toContain("CloudScale Systems");
      expect(tailoredDoc.basics.name).toBe(EXPERIENCED_FIXTURE.basics.name);

      // Verify Job Target
      expect(jobTarget.resumeId).toBe(tailoredMeta.id);
      expect(jobTarget.roleTitle).toBe("Staff Platform Engineer");
      expect(jobTarget.company).toBe("CloudScale Systems");
      expect(jobTarget.jobDescription).toContain("Kubernetes, Golang");

      // Verify Target is queryable via jobTargetAdapter
      const fetchedTarget = localJobTargetAdapter.getJobTarget(tailoredMeta.id);
      expect(fetchedTarget).not.toBeNull();
      expect(fetchedTarget?.roleTitle).toBe("Staff Platform Engineer");

      // Verify listResumes contains enriched metadata
      const list = localAdapter.listResumes();
      const variantInList = list.find((r) => r.id === tailoredMeta.id);
      expect(variantInList?.targetRole).toBe("Staff Platform Engineer");
      expect(variantInList?.targetCompany).toBe("CloudScale Systems");
      expect(variantInList?.parentResumeId).toBe(masterMeta.id);
    });

    it("guarantees master immutability when mutating deeply nested repeatable sections in variant", () => {
      const masterDoc: ResumeDocument = structuredClone(EXPERIENCED_FIXTURE);
      const originalRole = masterDoc.experience[0].role;
      const originalBullets = [...masterDoc.experience[0].bullets];
      const originalSkills = structuredClone(masterDoc.skills);

      const masterMeta = localAdapter.createResume("Master Resume", masterDoc, { isMaster: true });

      const { meta: variantMeta, document: variantDoc } = localAdapter.createTailoredCopy(
        masterMeta.id,
        {
          roleTitle: "Lead DevOps Specialist",
          company: "InfraCorp",
        }
      );

      // Deeply mutate the variant document
      variantDoc.basics.name = "Priya Mehta - Tailored Alias";
      variantDoc.experience[0].role = "Lead DevOps Engineer (Tailored Scope)";
      variantDoc.experience[0].bullets.push("Engineered zero-downtime canary deployment pipeline.");
      variantDoc.skills.push({
        id: "skill-custom",
        category: "Cloud & Orchestration",
        items: ["Terraform Enterprise", "ArgoCD", "Cilium"],
      });

      // Save variant
      localAdapter.saveResume(variantMeta.id, variantMeta.title, variantDoc);

      // Reload master from storage
      const masterReloaded = localAdapter.loadResume(masterMeta.id)!;

      // Master must remain 100% unaltered
      expect(masterReloaded.document.basics.name).toBe(masterDoc.basics.name);
      expect(masterReloaded.document.experience[0].role).toBe(originalRole);
      expect(masterReloaded.document.experience[0].bullets).toEqual(originalBullets);
      expect(masterReloaded.document.skills).toEqual(originalSkills);
      expect(masterReloaded.document.experience[0].bullets.length).toBe(originalBullets.length);

      // Mutating master later does NOT affect variant
      masterReloaded.document.basics.headline = "Modified Master Headline";
      localAdapter.saveResume(masterMeta.id, masterMeta.title, masterReloaded.document);

      const variantReloaded = localAdapter.loadResume(variantMeta.id)!;
      expect(variantReloaded.document.basics.headline).toBe(masterDoc.basics.headline);
      expect(variantReloaded.document.basics.headline).not.toBe("Modified Master Headline");
    });

    it("rolls back newly created resume if job target saving fails", () => {
      const masterMeta = localAdapter.createResume("Master", FRESHER_FIXTURE, { isMaster: true });

      // Mock saveJobTarget to simulate failure
      vi.spyOn(localJobTargetAdapter, "saveJobTarget").mockImplementation(() => {
        throw new Error("Disk quota exceeded in sector 7");
      });

      expect(() => {
        localAdapter.createTailoredCopy(masterMeta.id, {
          roleTitle: "Junior SRE",
        });
      }).toThrow(/Failed to initialize job target/);

      // Verify no orphan resume was left behind
      const list = localAdapter.listResumes();
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(masterMeta.id);

      // Master remains intact
      expect(localAdapter.loadResume(masterMeta.id)).not.toBeNull();

      // Restore mock
      vi.restoreAllMocks();
    });

    it("enforces safe deletion boundaries: deleting variant leaves master and siblings intact", () => {
      // 1. Master + 2 Variants
      const master = localAdapter.createResume("Master Resume", FRESHER_FIXTURE, { isMaster: true });
      const var1 = localAdapter.createTailoredCopy(master.id, { roleTitle: "Frontend Dev" });
      const var2 = localAdapter.createTailoredCopy(master.id, { roleTitle: "Backend Dev" });

      expect(localAdapter.listResumes().length).toBe(3);

      // 2. Delete Variant 1
      localAdapter.deleteResume(var1.meta.id);

      // Variant 1 is gone
      expect(localAdapter.loadResume(var1.meta.id)).toBeNull();
      expect(localJobTargetAdapter.getJobTarget(var1.meta.id)).toBeNull();

      // Master and Variant 2 remain intact
      expect(localAdapter.loadResume(master.id)).not.toBeNull();
      expect(localAdapter.loadResume(var2.meta.id)).not.toBeNull();
      expect(localJobTargetAdapter.getJobTarget(var2.meta.id)?.roleTitle).toBe("Backend Dev");

      const remainingList = localAdapter.listResumes();
      expect(new Set(remainingList.map((r) => r.id))).toEqual(new Set([master.id, var2.meta.id]));
    });

    it("deleting master leaves variants safely accessible", () => {
      const master = localAdapter.createResume("Master Resume", FRESHER_FIXTURE, { isMaster: true });
      const var1 = localAdapter.createTailoredCopy(master.id, { roleTitle: "Data Analyst" });

      // Delete master
      localAdapter.deleteResume(master.id);
      expect(localAdapter.loadResume(master.id)).toBeNull();

      // Variant is still loadable
      const loadedVar = localAdapter.loadResume(var1.meta.id);
      expect(loadedVar).not.toBeNull();
      expect(loadedVar?.meta.parentResumeId).toBe(master.id);
      expect(loadedVar?.document.basics.name).toBe(FRESHER_FIXTURE.basics.name);
    });
  });

  describe("Cloud Adapter Tailoring & Cross-User Security", () => {
    const USER_A = "user-auth-aaa";
    const USER_B = "user-auth-bbb";

    function mockClient() {
      const tables: Record<string, any[]> = {
        resumes: [],
        job_targets: [],
      };

      const client = {
        from: (table: string) => {
          const currentFilters: Array<(row: any) => boolean> = [];

          const query = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn((col: string, val: any) => {
              currentFilters.push((row) => row[col] === val);
              return query;
            }),
            order: vi.fn(() => query),
            single: vi.fn(async () => {
              const matched = (tables[table] || []).filter((r) =>
                currentFilters.every((f) => f(r))
              );
              if (matched.length === 0) {
                return { data: null, error: { message: "Row not found" } };
              }
              return { data: matched[0], error: null };
            }),
            insert: vi.fn(async (rows: any | any[]) => {
              const toInsert = Array.isArray(rows) ? rows : [rows];
              tables[table].push(...toInsert);
              return { error: null };
            }),
            update: vi.fn((vals: any) => ({
              eq: vi.fn((col: string, val: any) => {
                const row = tables[table].find((r) => r[col] === val);
                if (row) Object.assign(row, vals);
                return Promise.resolve({ error: null });
              }),
            })),
            delete: vi.fn(() => ({
              eq: vi.fn((col: string, val: any) => ({
                eq: vi.fn((col2: string, val2: any) => {
                  tables[table] = tables[table].filter(
                    (r) => !(r[col] === val && r[col2] === val2)
                  );
                  return Promise.resolve({ error: null });
                }),
              })),
            })),
            upsert: vi.fn(async (row: any) => {
              const existingIdx = tables[table].findIndex((r) => r.id === row.id);
              if (existingIdx >= 0) {
                tables[table][existingIdx] = row;
              } else {
                tables[table].push(row);
              }
              return { error: null };
            }),
            then: (resolve: any) => {
              const rows = (tables[table] || []).filter((r) =>
                currentFilters.every((f) => f(r))
              );
              resolve({ data: rows, error: null });
            },
          };
          return query;
        },
      } as unknown as SupabaseClient;

      return { client, tables };
    }

    it("creates a tailored copy via cloud adapter and associates job target", async () => {
      const { client, tables } = mockClient();
      const adapterA = createSupabaseAdapter(client, USER_A);

      // Create Master in cloud
      const master = await adapterA.createResume("Master Resume", FRESHER_FIXTURE, { isMaster: true });
      expect(master.id).toBeDefined();

      // Tailor for a specific job
      const tailored = await adapterA.createTailoredCopy(master.id, {
        roleTitle: "Cloud Architect",
        company: "VaporWare",
        jobDescription: "AWS, Kubernetes, Terraform",
      });

      expect(tailored.meta.isMaster).toBe(false);
      expect(tailored.meta.parentResumeId).toBe(master.id);
      expect(tailored.meta.targetRole).toBe("Cloud Architect");
      expect(tailored.jobTarget.roleTitle).toBe("Cloud Architect");

      // Verify row in database tables
      expect(tables.resumes.length).toBe(2);
      expect(tables.job_targets.length).toBe(1);
      expect(tables.job_targets[0].user_id).toBe(USER_A);
      expect(tables.job_targets[0].resume_id).toBe(tailored.meta.id);
    });

    it("rejects tailoring a source resume belonging to another user", async () => {
      const { client, tables } = mockClient();
      const adapterA = createSupabaseAdapter(client, USER_A);
      const adapterB = createSupabaseAdapter(client, USER_B);

      // User A creates a master
      const masterA = await adapterA.createResume("User A Master", FRESHER_FIXTURE, { isMaster: true });

      // User B attempts to branch from User A's master
      await expect(
        adapterB.createTailoredCopy(masterA.id, { roleTitle: "Hacker Role" })
      ).rejects.toThrow(/not found or unauthorized/);

      // No row created for User B
      expect(tables.resumes.filter((r) => r.user_id === USER_B).length).toBe(0);
    });
  });
});
