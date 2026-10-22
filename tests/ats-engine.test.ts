import { describe, it, expect } from "vitest";
import { evaluateResumeAts } from "@/lib/ats/engine";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";
import { createEmptyResume, type ResumeDocument } from "@/lib/schemas/resume";

describe("Deterministic ATS Readiness Engine (RS-100 / RS-101)", () => {
  it("flags missing name and contact method on an empty resume", () => {
    const empty = createEmptyResume();
    const result = evaluateResumeAts({ document: empty });

    const ruleIds = result.findings.map((f) => f.ruleId);
    expect(ruleIds).toContain("contact.name.missing");
    expect(ruleIds).toContain("contact.method.missing");
    expect(result.parseReadiness.errorCount).toBeGreaterThanOrEqual(2);
    expect(result.parseReadiness.score).toBeLessThan(60);
  });

  it("validates valid Fresher fixture with high parse readiness", () => {
    const result = evaluateResumeAts({
      document: FRESHER_FIXTURE,
      persona: "fresher",
    });

    const errors = result.findings.filter((f) => f.severity === "error");
    expect(errors.length).toBe(0);
    expect(result.parseReadiness.score).toBeGreaterThanOrEqual(90);
    // Job match must not be analyzed without a job description
    expect(result.jobMatch.analyzed).toBe(false);
    expect(result.jobMatch.score).toBeUndefined();
  });

  it("validates valid Experienced fixture with high parse readiness", () => {
    const result = evaluateResumeAts({
      document: EXPERIENCED_FIXTURE,
      persona: "experienced",
    });

    const errors = result.findings.filter((f) => f.severity === "error");
    expect(errors.length).toBe(0);
    expect(result.parseReadiness.score).toBeGreaterThanOrEqual(90);
    expect(result.jobMatch.analyzed).toBe(false);
  });

  it("detects malformed email format", () => {
    const doc: ResumeDocument = {
      ...FRESHER_FIXTURE,
      basics: {
        ...FRESHER_FIXTURE.basics,
        email: "not-an-email",
      },
    };

    const result = evaluateResumeAts({ document: doc });
    const emailFinding = result.findings.find((f) => f.ruleId === "contact.email.invalid");
    expect(emailFinding).toBeDefined();
    expect(emailFinding?.severity).toBe("error");
    expect(emailFinding?.sectionId).toBe("basics");
  });

  it("detects empty link URLs and missing https protocol", () => {
    const doc: ResumeDocument = {
      ...FRESHER_FIXTURE,
      basics: {
        ...FRESHER_FIXTURE.basics,
        links: [
          { label: "Portfolio", url: "" },
          { label: "Blog", url: "myblog.com" },
        ],
      },
    };

    const result = evaluateResumeAts({ document: doc });
    const ruleIds = result.findings.map((f) => f.ruleId);
    expect(ruleIds).toContain("contact.link.empty_url");
    expect(ruleIds).toContain("contact.link.missing_protocol");
  });

  it("warns about unconventional section headings that risk parser confusion", () => {
    const doc: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      customSections: [
        {
          id: "cust-1",
          title: "My Journey",
          items: [{ id: "item-1", description: "Some text" }],
        },
      ],
    };

    const result = evaluateResumeAts({ document: doc });
    const headingFinding = result.findings.find(
      (f) => f.ruleId === "section.custom.unusual_heading"
    );
    expect(headingFinding).toBeDefined();
    expect(headingFinding?.severity).toBe("warning");
  });

  it("warns when expressive template layout is configured", () => {
    const result = evaluateResumeAts({
      document: EXPERIENCED_FIXTURE,
      settings: {
        ...EXPERIENCED_FIXTURE.settings,
        templateId: "creative",
      },
    });

    const expressiveFinding = result.findings.find(
      (f) => f.ruleId === "template.expressive_layout"
    );
    expect(expressiveFinding).toBeDefined();
    expect(expressiveFinding?.severity).toBe("warning");
  });

  it("adapts completeness checks to target persona (RS-101)", () => {
    // A resume with no formal experience but education and projects
    const docWithoutExp: ResumeDocument = {
      ...FRESHER_FIXTURE,
      experience: [],
    };

    // For fresher persona: no experience error
    const fresherResult = evaluateResumeAts({
      document: docWithoutExp,
      persona: "fresher",
    });
    expect(
      fresherResult.findings.some(
        (f) => f.ruleId === "completeness.experienced.experience_missing"
      )
    ).toBe(false);

    // For experienced persona: flags missing experience
    const expResult = evaluateResumeAts({
      document: docWithoutExp,
      persona: "experienced",
    });
    expect(
      expResult.findings.some(
        (f) => f.ruleId === "completeness.experienced.experience_missing"
      )
    ).toBe(true);
  });

  it("evaluates job match only when a job description is provided", () => {
    // 1. Without job description
    const noJdResult = evaluateResumeAts({ document: EXPERIENCED_FIXTURE });
    expect(noJdResult.jobMatch.analyzed).toBe(false);
    expect(noJdResult.jobMatch.score).toBeUndefined();
    expect(noJdResult.jobMatch.findings.length).toBe(0);

    // 2. With matching job description
    const matchingJd = `
      Seeking a Senior Software Engineer with strong background in TypeScript, Python,
      AWS, Kubernetes, Terraform, Docker, and distributed systems.
    `;
    const jdResult = evaluateResumeAts({
      document: EXPERIENCED_FIXTURE,
      jobDescription: matchingJd,
    });
    expect(jdResult.jobMatch.analyzed).toBe(true);
    expect(jdResult.jobMatch.score).toBeGreaterThanOrEqual(70);
    expect(jdResult.jobMatch.matchedKeywords).toContain("typescript");
    expect(jdResult.jobMatch.matchedKeywords).toContain("kubernetes");

    // 3. With non-matching job description
    const nonMatchingJd = `
      Looking for an Oncology Registered Nurse with acute care, chemotherapy infusion,
      and patient triage certification.
    `;
    const nonMatchResult = evaluateResumeAts({
      document: EXPERIENCED_FIXTURE,
      jobDescription: nonMatchingJd,
    });
    expect(nonMatchResult.jobMatch.analyzed).toBe(true);
    expect(nonMatchResult.jobMatch.score).toBeLessThan(30);
    expect(nonMatchResult.jobMatch.findings.length).toBeGreaterThan(0);
  });

  it("produces identical deterministic output across repeated runs", () => {
    const run1 = evaluateResumeAts({ document: FRESHER_FIXTURE, persona: "fresher" });
    const run2 = evaluateResumeAts({ document: FRESHER_FIXTURE, persona: "fresher" });

    expect(run1.findings.map((f) => f.ruleId)).toEqual(run2.findings.map((f) => f.ruleId));
    expect(run1.parseReadiness.score).toBe(run2.parseReadiness.score);
    expect(run1.contentCompleteness.score).toBe(run2.contentCompleteness.score);
  });
});
