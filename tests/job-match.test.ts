import { describe, it, expect, beforeEach } from "vitest";
import {
  JobTargetSchema,
  createEmptyJobTarget,
  type RequirementItem,
} from "@/lib/schemas/job-target";
import { localJobTargetAdapter } from "@/lib/resume/job-target-adapter";
import {
  findRequirementEvidence,
  extractResumeEvidence,
  evaluateJobRequirementsCoverage,
} from "@/lib/ats/job-match";
import { evaluateResumeAts } from "@/lib/ats/engine";
import { EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";

describe("Job Target Data Model & Persistence (RS-090)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates and validates a standard job target", () => {
    const target = createEmptyJobTarget("test-resume-1");
    expect(target.resumeId).toBe("test-resume-1");
    expect(target.requirements).toEqual([]);

    const validated = JobTargetSchema.safeParse(target);
    expect(validated.success).toBe(true);
  });

  it("enforces max description bounds (10,000 chars) for memory safety", () => {
    const hugeDesc = "a".repeat(10001);
    const target = {
      ...createEmptyJobTarget("test-resume-1"),
      jobDescription: hugeDesc,
    };

    const validated = JobTargetSchema.safeParse(target);
    expect(validated.success).toBe(false);
  });

  it("persists and retrieves job targets locally with zero server retention", () => {
    const target = {
      ...createEmptyJobTarget("resume-123"),
      roleTitle: "Staff Backend Engineer",
      company: "Acme Corp",
      jobDescription: "Looking for a Go and Kubernetes specialist.",
      requirements: [
        {
          id: "req-1",
          text: "Go",
          type: "required" as const,
          sourcePhrase: "Go experience required",
          confidence: "high" as const,
          userAdded: false,
          userModified: false,
        },
      ],
    };

    localJobTargetAdapter.saveJobTarget(target);
    const loaded = localJobTargetAdapter.getJobTarget("resume-123");

    expect(loaded).toBeDefined();
    expect(loaded?.roleTitle).toBe("Staff Backend Engineer");
    expect(loaded?.company).toBe("Acme Corp");
    expect(loaded?.requirements.length).toBe(1);

    localJobTargetAdapter.deleteJobTarget("resume-123");
    expect(localJobTargetAdapter.getJobTarget("resume-123")).toBeNull();
  });
});

describe("Transparent Skill & Keyword Coverage Engine (RS-092)", () => {
  it("matches tech keywords using synonym map (e.g. k8s -> kubernetes, ts -> typescript)", () => {
    const evidence = extractResumeEvidence(EXPERIENCED_FIXTURE);

    // EXPERIENCED_FIXTURE has "Kubernetes" and "TypeScript" in skills / experience
    const k8sMatch = findRequirementEvidence("k8s", evidence);
    expect(k8sMatch.locations.length).toBeGreaterThan(0);
    expect(k8sMatch.isStrong).toBe(true);

    const tsMatch = findRequirementEvidence("ts", evidence);
    expect(tsMatch.locations.length).toBeGreaterThan(0);

    const nonExistentMatch = findRequirementEvidence("Fortran 77", evidence);
    expect(nonExistentMatch.locations.length).toBe(0);
  });

  it("distinguishes required vs preferred requirements and calculates separate scores", () => {
    const requirements: RequirementItem[] = [
      {
        id: "r1",
        text: "TypeScript",
        type: "required",
        sourcePhrase: "TypeScript required",
        confidence: "high",
        userAdded: false,
        userModified: false,
      },
      {
        id: "r2",
        text: "Kubernetes",
        type: "required",
        sourcePhrase: "Kubernetes required",
        confidence: "high",
        userAdded: false,
        userModified: false,
      },
      {
        id: "r3",
        text: "Erlang",
        type: "required", // Missing required
        sourcePhrase: "Erlang required",
        confidence: "high",
        userAdded: false,
        userModified: false,
      },
      {
        id: "r4",
        text: "Python", // Possessed preferred
        type: "preferred",
        sourcePhrase: "Python is a plus",
        confidence: "medium",
        userAdded: false,
        userModified: false,
      },
      {
        id: "r5",
        text: "COBOL", // Missing preferred
        type: "preferred",
        sourcePhrase: "COBOL nice to have",
        confidence: "low",
        userAdded: false,
        userModified: false,
      },
    ];

    const result = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, requirements);

    expect(result.analyzed).toBe(true);
    // 2 out of 3 required matched -> ~67%
    expect(result.requiredScore).toBe(67);
    // 1 out of 2 preferred matched -> 50%
    expect(result.preferredScore).toBe(50);
    // Matched items must have concrete evidence pointing to the resume
    expect(result.matchedRequirements?.length).toBeGreaterThanOrEqual(3);
    const tsMatched = result.matchedRequirements?.find((m) => m.requirementText === "TypeScript");
    expect(tsMatched).toBeDefined();
    expect(tsMatched?.evidenceLocations.length).toBeGreaterThan(0);

    // Missing requirements should be identified
    expect(result.missingRequirements?.some((m) => m.text === "Erlang")).toBe(true);
    expect(result.missingRequirements?.some((m) => m.text === "COBOL")).toBe(true);

    // Findings must distinguish required (warning) from preferred (suggestion)
    const reqFinding = result.findings.find((f) => f.ruleId === "job_match.required.missing");
    expect(reqFinding).toBeDefined();
    expect(reqFinding?.evidence).toContain("Erlang");

    const prefFinding = result.findings.find((f) => f.ruleId === "job_match.preferred.missing");
    expect(prefFinding).toBeDefined();
    expect(prefFinding?.evidence).toContain("COBOL");
  });

  it("integrates seamlessly into evaluateResumeAts with structured requirements", () => {
    const requirements: RequirementItem[] = [
      {
        id: "r1",
        text: "AWS",
        type: "required",
        sourcePhrase: "AWS proficiency",
        confidence: "high",
        userAdded: false,
        userModified: false,
      },
    ];

    const evalResult = evaluateResumeAts({
      document: EXPERIENCED_FIXTURE,
      requirements,
    });

    expect(evalResult.jobMatch.analyzed).toBe(true);
    expect(evalResult.jobMatch.matchedKeywords).toContain("AWS");
    expect(evalResult.jobMatch.score).toBe(100);
  });
});
