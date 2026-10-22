import { describe, it, expect } from "vitest";
import { evaluateResumeAts } from "@/lib/ats/engine";
import { EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import type { ResumeDocument } from "@/lib/schemas/resume";

describe("Writing Quality Checks (RS-102)", () => {
  it("detects inverted date ranges (start date after end date) as an objective warning", () => {
    const docWithInvertedDate: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      experience: [
        {
          ...EXPERIENCED_FIXTURE.experience[0],
          startDate: "2024-05",
          endDate: "2023-01",
          current: false,
        },
      ],
    };

    const result = evaluateResumeAts({ document: docWithInvertedDate });
    const invertedFinding = result.findings.find((f) => f.ruleId === "writing.date.inverted");

    expect(invertedFinding).toBeDefined();
    expect(invertedFinding?.severity).toBe("warning");
    expect(invertedFinding?.isSubjective).toBe(false);
    expect(invertedFinding?.sectionId).toBe("experience");
  });

  it("detects repeated bullet opening verbs (duplicate wording)", () => {
    const docWithRepeatedOpenings: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      experience: [
        {
          ...EXPERIENCED_FIXTURE.experience[0],
          bullets: [
            "Developed cloud architecture for distributed event streaming.",
            "Developed customer-facing analytics dashboard using Next.js.",
            "Developed automated load testing scripts in k6.",
          ],
        },
      ],
    };

    const result = evaluateResumeAts({ document: docWithRepeatedOpenings });
    const repeatedFinding = result.findings.find(
      (f) => f.ruleId === "writing.bullet.repeated_openings"
    );

    expect(repeatedFinding).toBeDefined();
    expect(repeatedFinding?.category).toBe("writing-quality");
    expect(repeatedFinding?.severity).toBe("suggestion");
    expect(repeatedFinding?.isSubjective).toBe(true);
    expect(repeatedFinding?.title).toContain("developed");
  });

  it("prompts for quantifiable evidence when a role has multiple bullets without any metrics", () => {
    const docWithoutMetrics: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      experience: [
        {
          ...EXPERIENCED_FIXTURE.experience[0],
          bullets: [
            "Maintained backend microservices and handled customer support requests.",
            "Collaborated with product designers to review mockups and attend scrum meetings.",
          ],
        },
      ],
    };

    const result = evaluateResumeAts({ document: docWithoutMetrics });
    const quantFinding = result.findings.find(
      (f) => f.ruleId === "writing.bullet.quantification_prompt"
    );

    expect(quantFinding).toBeDefined();
    expect(quantFinding?.category).toBe("writing-quality");
    expect(quantFinding?.severity).toBe("suggestion");
    expect(quantFinding?.isSubjective).toBe(true);
    expect(quantFinding?.whyItMatters).toContain("Quantifiable evidence");
  });

  it("detects inconsistent bullet punctuation when periods and non-periods are mixed", () => {
    const docWithMixedPunctuation: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      experience: [
        {
          ...EXPERIENCED_FIXTURE.experience[0],
          bullets: [
            "Architected low-latency microservices.",
            "Designed reactive user interfaces with React and Tailwind",
            "Implemented Redis caching layers.",
            "Orchestrated deployments across multiple AWS regions",
          ],
        },
      ],
    };

    const result = evaluateResumeAts({ document: docWithMixedPunctuation });
    const punctFinding = result.findings.find(
      (f) => f.ruleId === "writing.bullet.punctuation_inconsistent"
    );

    expect(punctFinding).toBeDefined();
    expect(punctFinding?.category).toBe("writing-quality");
    expect(punctFinding?.isSubjective).toBe(true);
  });

  it("distinguishes objective warnings from subjective writing guidance", () => {
    const doc: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      experience: [
        {
          ...EXPERIENCED_FIXTURE.experience[0],
          startDate: "2024-05",
          endDate: "2023-01",
          current: false,
          bullets: [
            "Responsible for helping with team agile coordination.", // passive
            "Rockstar coder delivering synergy across pipelines.", // buzzword
          ],
        },
      ],
    };

    const result = evaluateResumeAts({ document: doc });
    const writingFindings = result.findings.filter((f) => f.category === "writing-quality");

    const objective = writingFindings.filter((f) => f.isSubjective === false);
    const subjective = writingFindings.filter((f) => f.isSubjective === true);

    expect(objective.length).toBeGreaterThanOrEqual(1);
    expect(objective.some((f) => f.ruleId === "writing.date.inverted")).toBe(true);

    expect(subjective.length).toBeGreaterThanOrEqual(2);
    expect(subjective.some((f) => f.ruleId === "writing.bullet.passive")).toBe(true);
    expect(subjective.some((f) => f.ruleId === "writing.buzzword")).toBe(true);
  });

  it("calculates a separate writingQuality CategorySummary", () => {
    const result = evaluateResumeAts({ document: EXPERIENCED_FIXTURE });
    expect(result.writingQuality).toBeDefined();
    expect(typeof result.writingQuality.score).toBe("number");
    expect(result.writingQuality.score).toBeGreaterThanOrEqual(0);
    expect(result.writingQuality.score).toBeLessThanOrEqual(100);
  });
});
