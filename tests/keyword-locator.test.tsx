/**
 * RS-096 — Side-by-Side Keyword Evidence Locator Tests
 *
 * Verifies:
 * - Matched required terms expose verbatim evidence excerpts and source sections.
 * - Missing required terms are shown as missing without mutating or fabricating resume text.
 * - Preferred vs. required priorities render correctly with Console Chrome badges.
 * - Dynamic counts and filters (All / Evidenced / Missing / Priorities / Search Query) update reactively.
 * - Activation follows editor navigation (activeSection and locatorTarget) without mutating resume draft or history.
 * - Duplicate terms, empty JD, and punctuation/diacritics behave safely without throwing.
 * - No AI / network calls are executed during locator evaluation or rendering.
 * - Accessibility properties: semantic headings, aria-pressed, aria-expanded, aria-controls, visible labels.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { KeywordEvidenceLocator } from "@/components/resume-editor/keyword-evidence-locator";
import { useEditorStore } from "@/lib/resume/editor-store";
import { EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import { evaluateJobRequirementsCoverage } from "@/lib/ats/job-match";
import type { RequirementItem } from "@/lib/schemas/job-target";

describe("RS-096: Side-by-Side Keyword Evidence Locator", () => {
  beforeEach(() => {
    useEditorStore.getState().initResume("test-resume-id", "Test Cartridge", EXPERIENCED_FIXTURE);
    useEditorStore.getState().setLocatorTarget(null);
  });

  const testRequirements: RequirementItem[] = [
    {
      id: "req-ts",
      text: "TypeScript",
      type: "required",
      sourcePhrase: "Must have TypeScript expertise",
      confidence: "high",
      userAdded: false,
      userModified: false,
    },
    {
      id: "req-k8s",
      text: "Kubernetes",
      type: "required",
      sourcePhrase: "Kubernetes cluster administration",
      confidence: "high",
      userAdded: false,
      userModified: false,
    },
    {
      id: "req-rust",
      text: "Rust",
      type: "required", // Missing required in EXPERIENCED_FIXTURE
      sourcePhrase: "Rust systems programming",
      confidence: "medium",
      userAdded: false,
      userModified: false,
    },
    {
      id: "req-py",
      text: "Python",
      type: "preferred", // Evidenced preferred
      sourcePhrase: "Python is a plus",
      confidence: "medium",
      userAdded: false,
      userModified: false,
    },
    {
      id: "req-cobol",
      text: "COBOL",
      type: "preferred", // Missing preferred
      sourcePhrase: "COBOL legacy experience",
      confidence: "low",
      userAdded: false,
      userModified: false,
    },
  ];

  it("exposes real evidence excerpt and source section for matched required terms", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    // Check locator header
    expect(screen.getByText(/KEYWORD EVIDENCE LOCATOR/i)).toBeInTheDocument();

    // TypeScript must be in Evidenced column
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    // Kubernetes must be in Evidenced column
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();

    // Verifies excerpt citation is displayed
    const matchedEvidence = jobMatch.matchedRequirements?.find(
      (m) => m.requirementText === "TypeScript"
    );
    expect(matchedEvidence).toBeDefined();
    expect(matchedEvidence?.excerpt).toBeDefined();
    expect(matchedEvidence?.primarySection).toBeDefined();
  });

  it("shows missing required terms without fabricating or inserting resume content", () => {
    const initialDraft = JSON.parse(JSON.stringify(useEditorStore.getState().draft));
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);

    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    // Rust is missing required
    expect(screen.getByText("Rust")).toBeInTheDocument();
    // COBOL is missing preferred
    expect(screen.getByText("COBOL")).toBeInTheDocument();

    // Unmet qualifications statement
    expect(
      screen.getAllByText(/No verbatim or recognized synonym occurrences found across active draft/i).length
    ).toBeGreaterThanOrEqual(2);

    // Verify draft is completely unmutated
    expect(useEditorStore.getState().draft).toEqual(initialDraft);
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it("renders preferred vs. required priority badges correctly", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    // Badges must include exact priority text
    const requiredBadges = screen.getAllByText("required");
    const preferredBadges = screen.getAllByText("preferred");

    expect(requiredBadges.length).toBe(3); // TypeScript, Kubernetes, Rust
    expect(preferredBadges.length).toBe(2); // Python, COBOL
  });

  it("filters and counts update reactively when toggling status and priority filters", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    // Initial counts
    expect(screen.getByRole("button", { name: /ALL \(5\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /EVIDENCED \(3\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MISSING \(2\)/i })).toBeInTheDocument();

    // Click EVIDENCED filter
    fireEvent.click(screen.getByRole("button", { name: /EVIDENCED \(3\)/i }));

    // Evidenced terms are visible
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    // Missing terms should be filtered out
    expect(screen.queryByText("Rust")).not.toBeInTheDocument();
    expect(screen.queryByText("COBOL")).not.toBeInTheDocument();

    // Click MISSING filter
    fireEvent.click(screen.getByRole("button", { name: /MISSING \(2\)/i }));
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("COBOL")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();

    // Click ALL again
    fireEvent.click(screen.getByRole("button", { name: /ALL \(5\)/i }));

    // Priority filter: REQUIRED
    fireEvent.click(screen.getByRole("button", { name: /REQUIRED/i }));
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.queryByText("Python")).not.toBeInTheDocument();
    expect(screen.queryByText("COBOL")).not.toBeInTheDocument();
  });

  it("filters by keyword search text accurately", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    const searchInput = screen.getByLabelText(/Filter keywords by text/i);
    fireEvent.change(searchInput, { target: { value: "Kubern" } });

    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    expect(screen.queryByText("Rust")).not.toBeInTheDocument();
  });

  it("navigates to the correct editor section without mutating draft or undo history", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    const initialHistoryLength = useEditorStore.getState().history.length;
    const initialIsDirty = useEditorStore.getState().isDirty;

    // Locate action for TypeScript
    const locateButtons = screen.getAllByRole("button", { name: /Locate/i });
    expect(locateButtons.length).toBeGreaterThan(0);

    fireEvent.click(locateButtons[0]);

    // Active section is updated in editor store
    expect(useEditorStore.getState().activeSection).toBe("skills");
    expect(useEditorStore.getState().locatorTarget?.term).toBe("TypeScript");
    expect(useEditorStore.getState().locatorTarget?.source).toBe("matched");

    // History and dirty state must NOT be mutated
    expect(useEditorStore.getState().history.length).toBe(initialHistoryLength);
    expect(useEditorStore.getState().isDirty).toBe(initialIsDirty);
  });

  it("navigates to grounded suggested section for missing requirements", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    // Inspect action for Rust
    const inspectButton = screen.getByRole("button", { name: /Inspect skills section for Rust/i });
    expect(inspectButton).toBeInTheDocument();

    fireEvent.click(inspectButton);

    expect(useEditorStore.getState().activeSection).toBe("skills");
    expect(useEditorStore.getState().locatorTarget?.term).toBe("Rust");
    expect(useEditorStore.getState().locatorTarget?.source).toBe("missing");
  });

  it("handles duplicate terms, empty state, and special characters safely", () => {
    // Empty state
    const { unmount } = render(
      <KeywordEvidenceLocator
        jobMatch={{ analyzed: false, matchedKeywords: [], missingKeywords: [], findings: [] }}
        requirements={[]}
      />
    );
    expect(screen.getByText(/EVIDENCE LOCATOR STANDBY/i)).toBeInTheDocument();
    unmount();

    // Duplicate terms and punctuation
    const messyReqs: RequirementItem[] = [
      {
        id: "d1",
        text: "TypeScript",
        type: "required",
        sourcePhrase: "TypeScript",
        confidence: "high",
        userAdded: false,
        userModified: false,
      },
      {
        id: "d2",
        text: "TypeScript", // Duplicate term
        type: "preferred",
        sourcePhrase: "TypeScript again",
        confidence: "medium",
        userAdded: false,
        userModified: false,
      },
      {
        id: "d3",
        text: "C++ / C# & .NET", // Special regex punctuation
        type: "required",
        sourcePhrase: "C++ / C# & .NET",
        confidence: "low",
        userAdded: false,
        userModified: false,
      },
    ];

    expect(() => {
      const match = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, messyReqs);
      render(<KeywordEvidenceLocator jobMatch={match} requirements={messyReqs} />);
    }).not.toThrow();
  });

  it("operates strictly client-side without any network or AI calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);

    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    // Verify zero network requests
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("provides accessible disclosure for terms with multiple evidence occurrences", () => {
    // Kubernetes exists in multiple places in EXPERIENCED_FIXTURE
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    const disclosureButtons = screen.getAllByRole("button", {
      name: /View \d+ additional occurrence/i,
    });

    expect(disclosureButtons.length).toBeGreaterThan(0);
    const firstButton = disclosureButtons[0];
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  it("displays explicit truthfulness and ethical safeguard alert", () => {
    const jobMatch = evaluateJobRequirementsCoverage(EXPERIENCED_FIXTURE, testRequirements);
    render(<KeywordEvidenceLocator jobMatch={jobMatch} requirements={testRequirements} />);

    expect(
      screen.getByText(/Never fabricate unearned skills, credentials, or metrics/i)
    ).toBeInTheDocument();
  });
});
