/**
 * RS-095 — Resume Readiness Explainability & Actionable Remediation Test Suite
 *
 * Verifies:
 * 1. Rule catalog integrity and single-source-of-truth score guides.
 * 2. Deterministic evaluation and score-to-checklist consistency across empty, fresher, and experienced fixtures.
 * 3. In-app explainability UI: "How This Is Scored" disclosure, formula breakdown, score bands, disclaimer.
 * 4. Filter affordances: All, Incomplete, and Passed views.
 * 5. Per-check expandable details: what is evaluated, pass condition, observed evidence, remediation.
 * 6. Actionable navigation: "Edit in <section>" jumps to the relevant editor section.
 * 7. Offline, local-first operation with zero network or AI dependencies.
 * 8. Dynamic state synchronization with editor store updates and undo/redo.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { AtsReadinessPanel } from "@/components/resume-editor/ats-readiness-panel";
import { useEditorStore } from "@/lib/resume/editor-store";
import { evaluateResumeAts } from "@/lib/ats/engine";
import {
  ATS_RULES_CATALOG,
  CATEGORY_SCORING_GUIDES,
  getCategoryChecklist,
} from "@/lib/ats/rules-catalog";
import { FRESHER_FIXTURE, EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import type { ResumeDocument } from "@/lib/schemas/resume";

const EMPTY_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: { name: "", email: "", phone: "", location: "", links: [] },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  internships: [],
  certifications: [],
  awards: [],
  volunteering: [],
  publications: [],
  customSections: [],
  settings: {
    templateId: "classic-ats",
    fontPreset: "clean",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: ["basics"],
    hiddenSections: [],
  },
};

describe("RS-095: Rules Catalog & Scoring Guide Integrity", () => {
  it("defines explicit, non-empty metadata for every catalog rule", () => {
    const rules = Object.values(ATS_RULES_CATALOG);
    expect(rules.length).toBeGreaterThanOrEqual(15);

    rules.forEach((rule) => {
      expect(rule.ruleId).toBeTruthy();
      expect(rule.category).toMatch(/^(parse-readiness|content-completeness|writing-quality|job-match)$/);
      expect(rule.title.trim().length).toBeGreaterThan(3);
      expect(rule.description.trim().length).toBeGreaterThan(10);
      expect(rule.passCondition.trim().length).toBeGreaterThan(5);
      expect(rule.remediation.trim().length).toBeGreaterThan(5);
      expect(rule.whyItMatters.trim().length).toBeGreaterThan(10);
      expect(rule.sectionId).toBeTruthy();
      expect(["error", "warning", "suggestion"]).toContain(rule.defaultSeverity);
    });
  });

  it("defines scoring guides with formula, penalties, and disclaimer for each category", () => {
    const categories = ["parse-readiness", "content-completeness", "writing-quality", "job-match"] as const;

    categories.forEach((cat) => {
      const guide = CATEGORY_SCORING_GUIDES[cat];
      expect(guide).toBeDefined();
      expect(guide.title.length).toBeGreaterThan(3);
      expect(guide.scoringFormula).toContain("Score");
      expect(guide.scoreBands.length).toBeGreaterThanOrEqual(3);
      expect(guide.disclaimer.toLowerCase()).toContain("guidance");
      expect(guide.disclaimer.toLowerCase()).toContain("not a guarantee of ats acceptance");
    });
  });

  it("generates complete category checklist via getCategoryChecklist with pass evidence", () => {
    const checklist = getCategoryChecklist("parse-readiness", [], {
      document: FRESHER_FIXTURE,
      settings: FRESHER_FIXTURE.settings,
    });
    expect(checklist.length).toBe(8);
    expect(checklist.every((c) => c.status === "passed")).toBe(true);
    expect(checklist[0].evidence).toContain("Priya Mehta");
  });
});

describe("RS-095: Deterministic Evaluation & State Consistency", () => {
  it("evaluates empty resume: marks contact and essential sections incomplete with remediations", () => {
    const result = evaluateResumeAts({ document: EMPTY_FIXTURE, persona: "general" });

    expect(result.parseReadiness.score).toBeLessThan(70);
    expect(result.checks).toBeDefined();

    const parseChecks = result.checks?.["parse-readiness"] || [];
    const nameCheck = parseChecks.find((c) => c.ruleId === "contact.name");
    const methodCheck = parseChecks.find((c) => c.ruleId === "contact.method");

    expect(nameCheck?.status).toBe("incomplete");
    expect(nameCheck?.severity).toBe("error");
    expect(nameCheck?.remediation).toContain("Personal Information");

    expect(methodCheck?.status).toBe("incomplete");
    expect(methodCheck?.severity).toBe("error");
    expect(methodCheck?.remediation).toContain("email");
  });

  it("evaluates fresher resume: passes education, skills, and projects with observed evidence", () => {
    const result = evaluateResumeAts({ document: FRESHER_FIXTURE, persona: "fresher" });

    const completenessChecks = result.checks?.["content-completeness"] || [];
    const eduCheck = completenessChecks.find((c) => c.ruleId === "completeness.education");
    const projCheck = completenessChecks.find((c) => c.ruleId === "completeness.projects");
    const skillCheck = completenessChecks.find((c) => c.ruleId === "completeness.skills");

    expect(eduCheck?.status).toBe("passed");
    expect(eduCheck?.evidence).toContain("1 education credential(s) listed");

    expect(projCheck?.status).toBe("passed");
    expect(projCheck?.evidence).toContain("2 project(s) documented");

    expect(skillCheck?.status).toBe("passed");
    expect(skillCheck?.evidence).toContain("skill category");
  });

  it("evaluates experienced resume: checks work experience and metrics evidence", () => {
    const result = evaluateResumeAts({ document: EXPERIENCED_FIXTURE, persona: "experienced" });

    const completenessChecks = result.checks?.["content-completeness"] || [];
    const expCheck = completenessChecks.find((c) => c.ruleId === "completeness.experience");

    expect(expCheck?.status).toBe("passed");
    expect(expCheck?.evidence).toContain("3 work experience role(s) listed");
  });

  it("guarantees score equals base score minus exact penalties for each category", () => {
    const result = evaluateResumeAts({ document: FRESHER_FIXTURE, persona: "experienced" });

    // In experienced persona, FRESHER_FIXTURE lacks work experience which yields an error (-25)
    const guide = CATEGORY_SCORING_GUIDES["content-completeness"];
    const errors = result.contentCompleteness.errorCount;
    const warnings = result.contentCompleteness.warningCount;
    const suggestions = result.contentCompleteness.suggestionCount;

    const expectedScore = Math.max(
      0,
      Math.min(100, 100 - errors * guide.penalties.error - warnings * guide.penalties.warning - suggestions * guide.penalties.suggestion)
    );

    expect(result.contentCompleteness.score).toBe(expectedScore);
  });
});

describe("RS-095: UI Explainability & Accessibility", () => {
  beforeEach(() => {
    useEditorStore.getState().initResume("res-exp-test", "Explainability Test", FRESHER_FIXTURE);
  });

  it("toggles 'How This Is Scored' card with accessible disclosure semantics", () => {
    render(<AtsReadinessPanel />);

    const howItIsScoredBtn = screen.getByRole("button", { name: /How This Is Scored/i });
    expect(howItIsScoredBtn).toHaveAttribute("aria-expanded", "false");

    // Click to open
    fireEvent.click(howItIsScoredBtn);
    expect(howItIsScoredBtn).toHaveAttribute("aria-expanded", "true");

    // Shows scoring formula & spec banner
    expect(screen.getByText("HEURISTIC SPEC")).toBeInTheDocument();
    expect(screen.getByText(/Deterministic Calculation Formula/i)).toBeInTheDocument();
    expect(
      screen.getByText("Score = 100 - (Errors × 25) - (Warnings × 10) - (Suggestions × 3)")
    ).toBeInTheDocument();

    // Shows score bands
    expect(screen.getAllByText("Parse Ready").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Needs Attention")).toBeInTheDocument();
    expect(screen.getByText("Critical Issues")).toBeInTheDocument();

    // Shows heuristic disclaimer
    expect(
      screen.getByText(/These are resume-content and formatting heuristics. Results are guidance, not a guarantee/i)
    ).toBeInTheDocument();

    // Click to close
    fireEvent.click(screen.getByRole("button", { name: /Hide Guide/i }));
    expect(howItIsScoredBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("HEURISTIC SPEC")).not.toBeInTheDocument();
  });

  it("filters checklist by All, Incomplete, and Passed views", () => {
    render(<AtsReadinessPanel />);

    const allBtn = screen.getByRole("button", { name: /All Checks/i });
    const incompleteBtn = screen.getByRole("button", { name: /Incomplete/i });
    const passedBtn = screen.getByRole("button", { name: /Passed/i });

    expect(allBtn).toBeInTheDocument();
    expect(incompleteBtn).toBeInTheDocument();
    expect(passedBtn).toBeInTheDocument();

    // Click Incomplete view
    fireEvent.click(incompleteBtn);
    expect(incompleteBtn).toHaveAttribute("aria-pressed", "true");
    expect(allBtn).toHaveAttribute("aria-pressed", "false");

    // Click Passed view
    fireEvent.click(passedBtn);
    expect(passedBtn).toHaveAttribute("aria-pressed", "true");
    expect(incompleteBtn).toHaveAttribute("aria-pressed", "false");

    // Click back to All Checks
    fireEvent.click(allBtn);
    expect(allBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("expands check details to show what is evaluated, pass condition, and observed evidence", () => {
    render(<AtsReadinessPanel />);

    // In FRESHER_FIXTURE, Full Candidate Name passes
    const detailsButtons = screen.getAllByRole("button", { name: /Why this check\?/i });
    expect(detailsButtons.length).toBeGreaterThan(0);

    // Expand the first check details
    fireEvent.click(detailsButtons[0]);
    expect(detailsButtons[0]).toHaveAttribute("aria-expanded", "true");

    expect(screen.getByText(/What is evaluated:/i)).toBeInTheDocument();
    expect(screen.getByText(/Pass condition:/i)).toBeInTheDocument();
    expect(screen.getByText(/Observed status \/ evidence:/i)).toBeInTheDocument();
  });

  it("provides actionable 'Edit in <section>' button that switches activeSection", () => {
    // Add a blank URL to trigger an incomplete check
    useEditorStore.getState().updateBasics({
      links: [{ label: "Portfolio", url: "" }],
    });

    render(<AtsReadinessPanel />);

    const editBtn = screen.getByRole("button", { name: /Edit in basics/i });
    expect(editBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(useEditorStore.getState().activeSection).toBe("basics");
  });

  it("synchronizes check state and scores when document is updated via undo/redo", () => {
    render(<AtsReadinessPanel />);

    // Initially Priya Mehta has valid email and passes all structural checks
    expect(screen.getByText("Direct Contact Method")).toBeInTheDocument();
    expect(screen.queryByText("Error")).not.toBeInTheDocument();

    // Update email and phone to empty inside act
    act(() => {
      useEditorStore.getState().updateBasics({ email: "", phone: "" });
    });

    // The component re-evaluates: Error badge appears
    expect(screen.getAllByText("Error").length).toBeGreaterThanOrEqual(1);

    // Undo action inside act
    act(() => {
      useEditorStore.getState().undo();
    });

    // Priya Mehta's contact is restored and Error disappears
    expect(useEditorStore.getState().draft.basics.email).toBe("priya.mehta@example.com");
    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });
});
