import { describe, it, expect } from "vitest";
import {
  ResumeDocumentSchema,
  createEmptyResume,
} from "@/lib/schemas/resume";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";
import { migrateResumeDocument } from "@/lib/schemas/migrations";

describe("Resume Document Schema & Fixtures", () => {
  it("validates the Fresher fixture successfully", () => {
    const parsed = ResumeDocumentSchema.safeParse(FRESHER_FIXTURE);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.basics.name).toBe("Priya Mehta");
      expect(parsed.data.education.length).toBeGreaterThan(0);
      expect(parsed.data.projects.length).toBeGreaterThan(0);
    }
  });

  it("validates the Experienced fixture successfully", () => {
    const parsed = ResumeDocumentSchema.safeParse(EXPERIENCED_FIXTURE);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.basics.name).toBe("Rohan Kapoor");
      expect(parsed.data.experience.length).toBeGreaterThan(0);
    }
  });

  it("creates a valid empty resume", () => {
    const empty = createEmptyResume();
    const parsed = ResumeDocumentSchema.safeParse(empty);
    expect(parsed.success).toBe(true);
    expect(empty.schemaVersion).toBe(1);
    expect(empty.settings.templateId).toBe("classic-ats");
  });

  it("migrates a document correctly", () => {
    const raw = {
      ...FRESHER_FIXTURE,
      schemaVersion: 1,
    };
    const migrated = migrateResumeDocument(raw);
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.basics.name).toBe(FRESHER_FIXTURE.basics.name);
  });
});
