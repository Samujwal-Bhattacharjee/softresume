import { describe, it, expect, beforeEach } from "vitest";
import { localAdapter } from "@/lib/resume/local-adapter";
import { localJobTargetAdapter } from "@/lib/resume/job-target-adapter";
import { FRESHER_FIXTURE, EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import { sanitizeLogValue, formatSafeError } from "@/lib/logger";

describe("Data Controls & Privacy Subsystem (RS-043, RS-045, RS-154)", () => {
  beforeEach(() => {
    localStorage.clear();
    localAdapter.clearTombstones();
  });

  describe("JSON Backup Export (RS-043)", () => {
    it("exports schema-versioned backup with no secrets or session tokens", () => {
      // 1. Create two test resumes with job target
      const r1 = localAdapter.createResume("Priya Master", FRESHER_FIXTURE, { isMaster: true });
      const r2 = localAdapter.createResume("Marcus Tailored", EXPERIENCED_FIXTURE, { isMaster: false });

      const target1 = localJobTargetAdapter.createBlank(r1.id);
      target1.roleTitle = "Frontend Engineer";
      target1.company = "Acme Corp";
      target1.jobDescription = "Looking for a skilled frontend engineer proficient in React and TypeScript.";
      target1.requirements = [
        {
          id: "req-1",
          text: "React",
          type: "required",
          sourcePhrase: "React",
          confidence: "high",
          userAdded: false,
          userModified: false,
        },
      ];
      localJobTargetAdapter.saveJobTarget(target1);

      // 2. Export backup
      const backup = localAdapter.exportAllData();

      // 3. Verify format and schema version
      expect(backup.version).toBe("1.0.0");
      expect(backup.schemaVersion).toBe(1);
      expect(backup.app).toBe("SoftCV Studio");
      expect(backup.storageMode).toBe("localStorage");
      expect(backup.totalResumes).toBe(2);
      expect(backup.resumes.length).toBe(2);

      // Verify records
      const priya = backup.resumes.find((r) => r.meta.id === r1.id);
      expect(priya).toBeDefined();
      expect(priya?.document.basics.name).toBe("Priya Mehta");
      expect(priya?.jobTarget?.roleTitle).toBe("Frontend Engineer");

      const rohan = backup.resumes.find((r) => r.meta.id === r2.id);
      expect(rohan).toBeDefined();
      expect(rohan?.document.basics.name).toBe("Rohan Kapoor");

      // Verify no secrets or sensitive auth keys are present
      const serialized = JSON.stringify(backup);
      expect(serialized).not.toContain("password");
      expect(serialized).not.toContain("apiKey");
      expect(serialized).not.toContain("AI_API_KEY");
      expect(serialized).not.toContain("sessionToken");
    });
  });

  describe("Single Resume Deletion (RS-043, RS-154)", () => {
    it("deletes specified resume and its job target without affecting other resumes", () => {
      const r1 = localAdapter.createResume("Keep Me", FRESHER_FIXTURE);
      const r2 = localAdapter.createResume("Delete Me", EXPERIENCED_FIXTURE);

      const target2 = localJobTargetAdapter.createBlank(r2.id);
      target2.roleTitle = "Senior Engineer";
      target2.company = "BigCorp";
      target2.jobDescription = "Job text";
      localJobTargetAdapter.saveJobTarget(target2);

      expect(localAdapter.loadResume(r2.id)).not.toBeNull();
      expect(localJobTargetAdapter.getJobTarget(r2.id)).not.toBeNull();

      // Delete r2
      localAdapter.deleteResume(r2.id);

      // Verify r2 is gone
      expect(localAdapter.loadResume(r2.id)).toBeNull();
      expect(localJobTargetAdapter.getJobTarget(r2.id)).toBeNull();

      // Verify r1 remains intact
      expect(localAdapter.loadResume(r1.id)).not.toBeNull();
      const list = localAdapter.listResumes();
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(r1.id);
    });
  });

  describe("Purge All Local Data (RS-043, RS-154)", () => {
    it("clears all application-owned keys while preserving unrelated localStorage entries", () => {
      // Setup unrelated localStorage keys
      localStorage.setItem("unrelated_app_token", "secret-token-12345");
      localStorage.setItem("theme_preference", "dark");

      // Setup application data
      const r1 = localAdapter.createResume("Demo 1", FRESHER_FIXTURE);
      const target1 = localJobTargetAdapter.createBlank(r1.id);
      target1.roleTitle = "Dev";
      target1.company = "TestCo";
      target1.jobDescription = "Test JD";
      localJobTargetAdapter.saveJobTarget(target1);

      expect(localAdapter.listResumes().length).toBe(1);

      // Perform purge
      localAdapter.deleteAllData();

      // Verify application data is removed
      expect(localAdapter.listResumes().length).toBe(0);
      expect(localAdapter.loadResume(r1.id)).toBeNull();
      expect(localJobTargetAdapter.getJobTarget(r1.id)).toBeNull();

      // Verify unrelated keys are PRESERVED untouched
      expect(localStorage.getItem("unrelated_app_token")).toBe("secret-token-12345");
      expect(localStorage.getItem("theme_preference")).toBe("dark");
    });
  });

  describe("Autosave Resurrection Guard (Race Condition Prevention)", () => {
    it("prevents delayed debounced save from resurrecting a deleted resume", () => {
      const r1 = localAdapter.createResume("Volatile Resume", FRESHER_FIXTURE);
      expect(localAdapter.loadResume(r1.id)).not.toBeNull();

      // User deletes the resume
      localAdapter.deleteResume(r1.id);

      // Simulate a pending debounced autosave callback attempting to write back
      expect(() => {
        localAdapter.saveResume(r1.id, "Volatile Resume (Delayed Autosave)", FRESHER_FIXTURE);
      }).toThrow(/deleted/i);

      // Verify resume remains deleted
      expect(localAdapter.loadResume(r1.id)).toBeNull();
      expect(localAdapter.listResumes().length).toBe(0);
    });

    it("prevents debounced save after deleteAllData from resurrecting purged resumes", () => {
      const r1 = localAdapter.createResume("Purged Resume", FRESHER_FIXTURE);
      localAdapter.deleteAllData();

      expect(() => {
        localAdapter.saveResume(r1.id, "Purged Resume (Delayed Autosave)", FRESHER_FIXTURE);
      }).toThrow(/deleted/i);

      expect(localAdapter.loadResume(r1.id)).toBeNull();
    });
  });

  describe("Synthetic Demo Reset (RS-043, RS-162)", () => {
    it("resets local cartridges to standard synthetic sample fixtures", () => {
      // Put arbitrary data in
      localAdapter.createResume("Custom Scratch", FRESHER_FIXTURE);
      expect(localAdapter.listResumes().length).toBe(1);

      // Reset demo
      const seeded = localAdapter.resetDemoData();

      expect(seeded.length).toBe(2);
      const list = localAdapter.listResumes();
      expect(list.length).toBe(2);

      const titles = list.map((r) => r.title);
      expect(titles.some((t) => t.includes("Priya Mehta"))).toBe(true);
      expect(titles.some((t) => t.includes("Rohan Kapoor"))).toBe(true);
    });
  });

  describe("PII-Safe Logging & Error Sanitization (RS-045)", () => {
    it("scrubs candidate emails, phone numbers, and API keys from log metadata", () => {
      const sensitiveInput = {
        route: "/api/ai/improve-bullet",
        status: 500,
        candidateEmail: "candidate.test@example.com",
        phone: "+1 555 123 4567",
        apiKey: "sk-abcdef1234567890abcdef1234567890",
        nested: {
          jobDescription: "Confidential company description",
          safeCount: 42,
        },
      };

      const sanitized = sanitizeLogValue(sensitiveInput) as Record<string, unknown>;

      expect(sanitized.route).toBe("/api/ai/improve-bullet");
      expect(sanitized.status).toBe(500);
      expect(sanitized.candidateEmail).toBe("[REDACTED]");
      expect(sanitized.phone).toBe("[REDACTED]");
      expect(sanitized.apiKey).toBe("[REDACTED]");
      expect((sanitized.nested as Record<string, unknown>).jobDescription).toBe("[REDACTED]");
      expect((sanitized.nested as Record<string, unknown>).safeCount).toBe(42);
    });

    it("scrubs candidate email and bearer tokens embedded in error messages", () => {
      const rawError = new Error(
        "Failed request for priya.mehta@example.com using Bearer sk-secret1234567890abcdef"
      );

      const safeError = formatSafeError(rawError);
      expect(safeError.errorName).toBe("Error");
      expect(safeError.errorMessage).not.toContain("priya.mehta@example.com");
      expect(safeError.errorMessage).toContain("[REDACTED_EMAIL]");
    });
  });
});
