import { describe, it, expect } from "vitest";
import {
  ROLE_PRESET_IDS,
  ROLE_PRESETS,
  getAllRolePresets,
  getRolePreset,
  isRolePresetId,
} from "@/lib/coaching/presets";
import { SECTION_KEYS, createEmptyResume } from "@/lib/schemas/resume";
import { formatBulletImproverUserPrompt, formatSummaryHelperUserPrompt } from "@/lib/ai/prompts";

describe("Role-Specific Coaching Presets Registry (RS-093)", () => {
  it("1. registers all 11 required role coaching presets with unique IDs", () => {
    const expectedIds = [
      "software-engineer",
      "ai-ml-engineer",
      "cloud-devops",
      "data-scientist",
      "product-manager",
      "ui-ux-designer",
      "finance-consulting",
      "sales-cs",
      "research-academic",
      "creative-film",
      "general",
    ];

    expect(ROLE_PRESET_IDS).toHaveLength(11);
    expect([...ROLE_PRESET_IDS].sort()).toEqual([...expectedIds].sort());

    const allPresets = getAllRolePresets();
    expect(allPresets).toHaveLength(11);

    const ids = allPresets.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(11);
  });

  it("2. every preset defines complete, non-empty coaching structures", () => {
    for (const id of ROLE_PRESET_IDS) {
      const preset = ROLE_PRESETS[id];
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.shortDescription.length).toBeGreaterThan(10);
      expect(preset.suits.length).toBeGreaterThan(10);
      expect(preset.recommendedSectionOrder.length).toBeGreaterThanOrEqual(4);
      expect(preset.relevantSections.length).toBeGreaterThanOrEqual(2);
      expect(preset.evidenceExpectations.length).toBeGreaterThanOrEqual(3);
      expect(preset.commonToolsAndSkills.length).toBeGreaterThanOrEqual(5);

      // AI prompt guidance
      expect(preset.aiPromptGuidance.bulletFocus.length).toBeGreaterThan(20);
      expect(preset.aiPromptGuidance.summaryFocus.length).toBeGreaterThan(20);
      expect(preset.aiPromptGuidance.followUpProbes.length).toBeGreaterThanOrEqual(2);

      // Synthetic example bullet
      expect(preset.exampleSyntheticBullet.role.length).toBeGreaterThan(0);
      expect(preset.exampleSyntheticBullet.bullet.length).toBeGreaterThan(20);
      expect(preset.exampleSyntheticBullet.whyItWorks.length).toBeGreaterThan(20);

      // Completeness guidance
      expect(preset.completenessGuidance.mandatoryChecks.length).toBeGreaterThanOrEqual(2);
      expect(preset.completenessGuidance.optionalRecommendations.length).toBeGreaterThanOrEqual(1);

      // Fresher vs Experienced
      expect(preset.fresherVsExperienced.fresherTips.length).toBeGreaterThanOrEqual(1);
      expect(preset.fresherVsExperienced.experiencedTips.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("3. recommended section orders only reference recognized canonical section keys", () => {
    const validKeys = new Set<string>(SECTION_KEYS);

    for (const id of ROLE_PRESET_IDS) {
      const preset = ROLE_PRESETS[id];
      for (const section of preset.recommendedSectionOrder) {
        expect(validKeys.has(section)).toBe(true);
      }
    }
  });

  it("4. safely resolves unknown, empty, or null IDs to general preset", () => {
    expect(getRolePreset(null).id).toBe("general");
    expect(getRolePreset(undefined).id).toBe("general");
    expect(getRolePreset("non-existent-role").id).toBe("general");
    expect(getRolePreset("software-engineer").id).toBe("software-engineer");
  });

  it("5. validates isRolePresetId type guard", () => {
    expect(isRolePresetId("software-engineer")).toBe(true);
    expect(isRolePresetId("ai-ml-engineer")).toBe(true);
    expect(isRolePresetId("astronaut")).toBe(false);
  });

  it("6. selecting a preset never mutates resume candidate content or schema", () => {
    const originalDoc = createEmptyResume();
    originalDoc.basics.name = "Jane Candidate";
    originalDoc.summary = "Experienced architect.";
    originalDoc.experience = [
      {
        id: "exp-1",
        employer: "Tech Corp",
        role: "Engineer",
        bullets: ["Built real system."],
      },
    ];

    const copyBefore = JSON.parse(JSON.stringify(originalDoc));

    // Simulate applying recommended section order from Software Engineer preset
    const sePreset = getRolePreset("software-engineer");
    originalDoc.settings.sectionOrder = [...sePreset.recommendedSectionOrder];

    // Verify candidate identity, bullets, and employers are 100% untouched
    expect(originalDoc.basics.name).toBe(copyBefore.basics.name);
    expect(originalDoc.summary).toBe(copyBefore.summary);
    expect(originalDoc.experience).toEqual(copyBefore.experience);
    expect(originalDoc.schemaVersion).toBe(1);
  });

  it("7. formats bullet and summary prompts with role coaching guidance", () => {
    const sePreset = getRolePreset("software-engineer");

    const bulletPrompt = formatBulletImproverUserPrompt({
      bullet: "Improved website speed.",
      context: { role: "Frontend Dev", employer: "ShopNow" },
      targetRole: sePreset.name,
      roleCoachingGuidance: sePreset.aiPromptGuidance.bulletFocus,
      evidenceExpectations: sePreset.evidenceExpectations,
    });

    expect(bulletPrompt).toContain("Target Role: Software Engineer");
    expect(bulletPrompt).toContain("Role Coaching Focus:");
    expect(bulletPrompt).toContain("Evidence Expectations for this Role:");
    expect(bulletPrompt).toContain("<user_candidate_bullet>");
    expect(bulletPrompt).toContain("Improved website speed.");

    const summaryPrompt = formatSummaryHelperUserPrompt({
      targetRole: sePreset.name,
      roleCoachingGuidance: sePreset.aiPromptGuidance.summaryFocus,
      experience: [{ role: "Engineer", employer: "ShopNow", bullets: ["Worked on UI"] }],
      education: [],
      projects: [],
      skills: [],
      internships: [],
      certifications: [],
    });

    expect(summaryPrompt).toContain("Target Role: Software Engineer");
    expect(summaryPrompt).toContain("Role Coaching Focus:");
    expect(summaryPrompt).toContain("ShopNow");
  });
});
