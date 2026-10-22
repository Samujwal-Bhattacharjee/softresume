/**
 * RS-097 — JSON Resume Dialog UI and Two-Way Integration Tests
 */
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DataPrivacyDialog } from "@/components/data-privacy-dialog";
import { localAdapter } from "@/lib/resume/local-adapter";
import { useEditorStore } from "@/lib/resume/editor-store";
import { FRESHER_FIXTURE } from "@/lib/fixtures/resume-fixtures";

describe("RS-097: JSON Resume UI Actions in DataPrivacyDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    localAdapter.clearTombstones();
    useEditorStore.getState().initResume("test-cartridge", "Priya Test", FRESHER_FIXTURE);
  });

  it("renders export and import options in DataPrivacyDialog clearly separated from app backup", () => {
    render(<DataPrivacyDialog isOpen={true} onClose={() => {}} />);

    // Full app backup
    expect(screen.getByText(/1\. EXPORT FULL APP BACKUP/i)).toBeInTheDocument();
    // Standard JSON Resume export
    expect(screen.getByText(/2\. EXPORT ACTIVE RESUME \(JSON RESUME STD V1\.0\)/i)).toBeInTheDocument();
    // Standard JSON Resume import
    expect(screen.getByText(/3\. IMPORT STANDARD JSON RESUME \(V1\.0\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /EXPORT JSON RESUME ↓/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CHOOSE JSON RESUME…/i })).toBeInTheDocument();
  });

  it("previews parsed JSON Resume and imports as a new cartridge upon confirmation", async () => {
    const initialCount = localAdapter.listResumes().length;

    const sampleJsonResume = {
      $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      basics: {
        name: "Grace Hopper",
        label: "Rear Admiral & Computer Scientist",
        email: "grace.hopper@navy.mil",
        location: { city: "Arlington, VA" },
        summary: "Pioneered standards and early compiler development (A-0, COBOL).",
      },
      work: [
        {
          name: "United States Navy",
          position: "Director, Navy Programming Languages Group",
          startDate: "1943-12",
          endDate: "1986-08",
          highlights: ["Developed common compiler frameworks."],
        },
      ],
      education: [
        {
          institution: "Yale University",
          studyType: "Ph.D.",
          area: "Mathematics",
        },
      ],
      skills: [
        {
          name: "Systems",
          keywords: ["Compilers", "Assembly", "COBOL"],
        },
      ],
    };

    const file = new File([JSON.stringify(sampleJsonResume)], "grace_hopper.json", {
      type: "application/json",
    });

    render(<DataPrivacyDialog isOpen={true} onClose={() => {}} />);

    const fileInput = screen.getByLabelText(/Upload JSON Resume file/i) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Pre-flight confirmation preview should render
    await waitFor(() => {
      expect(screen.getByText(/PRE-FLIGHT VALIDATION: Grace Hopper/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/SCHEMA VALIDATED/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CONFIRM IMPORT AS NEW CARTRIDGE/i })).toBeInTheDocument();

    // Confirm import
    fireEvent.click(screen.getByRole("button", { name: /CONFIRM IMPORT AS NEW CARTRIDGE/i }));

    await waitFor(() => {
      expect(
        screen.getAllByText(/Successfully imported "Grace Hopper" as a new resume cartridge/i).length
      ).toBeGreaterThanOrEqual(1);
    });

    // Verify new cartridge was created in local storage
    const updatedList = localAdapter.listResumes();
    expect(updatedList.length).toBe(initialCount + 1);
    const importedRecord = updatedList.find((r) => r.title.includes("Grace Hopper"));
    expect(importedRecord).toBeDefined();

    const loaded = localAdapter.loadResume(importedRecord!.id);
    expect(loaded?.document.basics.name).toBe("Grace Hopper");
    expect(loaded?.document.experience[0].employer).toBe("United States Navy");
  });

  it("handles invalid or malformed JSON gracefully with accessible error messages", async () => {
    const badFile = new File(["{ malformed json"], "bad.json", { type: "application/json" });

    render(<DataPrivacyDialog isOpen={true} onClose={() => {}} />);

    const fileInput = screen.getByLabelText(/Upload JSON Resume file/i) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    await waitFor(() => {
      expect(screen.getAllByText(/Malformed JSON/i).length).toBeGreaterThanOrEqual(1);
    });

    // Preview should not be rendered
    expect(screen.queryByText(/PRE-FLIGHT VALIDATION/i)).not.toBeInTheDocument();
  });
});
