import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AtsReadinessPanel } from "@/components/resume-editor/ats-readiness-panel";
import { useEditorStore } from "@/lib/resume/editor-store";
import { FRESHER_FIXTURE } from "@/lib/fixtures/resume-fixtures";

describe("ATS Readiness Panel Component (RS-103)", () => {
  beforeEach(() => {
    useEditorStore.getState().initResume("res-test", "Test Resume", FRESHER_FIXTURE);
  });

  it("renders the 3 main tabs: Parse Readiness, Completeness, and Job Match", () => {
    render(<AtsReadinessPanel />);

    expect(screen.getByText("Readiness & ATS Review")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Parse Readiness/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Completeness/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Writing Quality/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Job Match/i })).toBeInTheDocument();
  });

  it("shows honest empty state for Job Match when no description is provided", () => {
    render(<AtsReadinessPanel />);

    // Click on Job Match tab
    fireEvent.click(screen.getByRole("tab", { name: /Job Match/i }));

    expect(screen.getByText("No Job Description Added")).toBeInTheDocument();
    expect(
      screen.getByText(/Paste a job description above to inspect keyword overlap/i)
    ).toBeInTheDocument();
  });

  it("calculates keyword match when a job description is pasted", () => {
    render(<AtsReadinessPanel />);

    fireEvent.click(screen.getByRole("tab", { name: /Job Match/i }));

    // Open textarea and input JD text
    const textarea = screen.getByPlaceholderText(/Paste the target job description/i);
    fireEvent.change(textarea, {
      target: {
        value: "Looking for a Software Engineer with React, Node.js, TypeScript, and MongoDB experience.",
      },
    });

    // Should analyze and show alignment
    expect(screen.getByText(/Keyword Alignment:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Never fabricate unpossessed skills/i).length).toBeGreaterThan(0);
  });

  it("navigates to relevant section when a finding action is clicked", () => {
    // Add a malformed link to trigger a finding
    useEditorStore.getState().updateBasics({
      links: [{ label: "Broken", url: "" }],
    });

    render(<AtsReadinessPanel />);

    expect(screen.getByText("Blank Link URL")).toBeInTheDocument();

    const editBtn = screen.getByRole("button", { name: /Edit in basics/i });
    expect(editBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(useEditorStore.getState().activeSection).toBe("basics");
  });

  it("displays transparent ATS disclaimer", () => {
    render(<AtsReadinessPanel />);
    expect(screen.getByText(/ATS Assessment Transparency:/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot replicate proprietary employer applicant tracking algorithms/i)).toBeInTheDocument();
  });

  it("allows ignoring subjective writing quality suggestions (RS-102)", () => {
    // Add an experience entry with a passive bullet to trigger subjective guidance
    useEditorStore.getState().addExperience();
    const expId = useEditorStore.getState().draft.experience[0].id;
    useEditorStore.getState().updateExperience(expId, {
      role: "Backend Engineer",
      employer: "Acme Corp",
      bullets: ["Responsible for handling database maintenance."],
    });

    render(<AtsReadinessPanel />);

    // Click Writing Quality tab
    fireEvent.click(screen.getByRole("tab", { name: /Writing Quality/i }));

    expect(screen.getByText("Passive Bullet Phrasing")).toBeInTheDocument();
    expect(screen.getByText("Subjective Guidance")).toBeInTheDocument();

    // Click Ignore
    const ignoreBtn = screen.getByRole("button", { name: /Ignore/i });
    fireEvent.click(ignoreBtn);

    // Passive phrasing should now be hidden from main list
    expect(screen.queryByText("Passive Bullet Phrasing")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ignored \(1\)/i })).toBeInTheDocument();
  });

  it("allows adding and removing custom job requirements (RS-091)", () => {
    render(<AtsReadinessPanel />);

    fireEvent.click(screen.getByRole("tab", { name: /Job Match/i }));

    // Input a job description to initiate job target
    const textarea = screen.getByPlaceholderText(/Paste the target job description/i);
    fireEvent.change(textarea, {
      target: {
        value: "Looking for a Software Engineer with React, Node.js, TypeScript, and Docker experience.",
      },
    });

    // Add a custom requirement
    const addInput = screen.getByPlaceholderText(/Add custom required or preferred skill/i);
    fireEvent.change(addInput, { target: { value: "GraphQL API Design" } });

    const addBtn = screen.getByRole("button", { name: /Add/i });
    fireEvent.click(addBtn);

    expect(screen.getAllByText("GraphQL API Design").length).toBeGreaterThanOrEqual(1);
  });
});
