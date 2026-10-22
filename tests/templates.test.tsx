import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ClassicAtsTemplate } from "@/components/resume-templates/classic-ats";
import { FresherGraduateTemplate } from "@/components/resume-templates/fresher-graduate";
import { TemplateRenderer } from "@/components/resume-templates";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";

describe("Template Rendering & Compatibility (RS-050 / RS-052 / RS-054)", () => {
  it("renders Classic ATS template with Experienced fixture", () => {
    const { container } = render(
      <ClassicAtsTemplate
        document={EXPERIENCED_FIXTURE}
        settings={EXPERIENCED_FIXTURE.settings}
      />
    );

    // Name is rendered
    expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();
    // Headline is rendered
    expect(
      screen.getByText(/Senior Software Engineer · Full-Stack & Cloud/)
    ).toBeInTheDocument();
    // Contact email is rendered in document body
    expect(screen.getByText(/r\.kapoor@example\.com/)).toBeInTheDocument();
    // Experience employer is rendered
    expect(screen.getByText(/Nexora Systems/)).toBeInTheDocument();

    // Verify no semantic table abuse or SVG icons hiding text
    expect(container.querySelector("table")).toBeNull();
  });

  it("renders Classic ATS template with Fresher fixture without crashing", () => {
    render(
      <ClassicAtsTemplate
        document={FRESHER_FIXTURE}
        settings={FRESHER_FIXTURE.settings}
      />
    );

    expect(screen.getByText("Priya Mehta")).toBeInTheDocument();
    expect(screen.getByText(/Pune Institute of Technology/)).toBeInTheDocument();
  });

  it("renders Fresher/Graduate template with Fresher fixture", () => {
    render(
      <FresherGraduateTemplate
        document={FRESHER_FIXTURE}
        settings={FRESHER_FIXTURE.settings}
      />
    );

    expect(screen.getByText("Priya Mehta")).toBeInTheDocument();
    expect(screen.getByText(/StudyBuddy — Collaborative Notes App/)).toBeInTheDocument();
    expect(screen.getByText(/Data Structures & Algorithms/)).toBeInTheDocument();
  });

  it("renders Fresher/Graduate template with Experienced fixture", () => {
    render(
      <FresherGraduateTemplate
        document={EXPERIENCED_FIXTURE}
        settings={EXPERIENCED_FIXTURE.settings}
      />
    );

    expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();
    expect(screen.getByText(/Nexora Systems/)).toBeInTheDocument();
  });

  it("renders Modern Editorial template (RS-053) with distinct layout and styling", () => {
    const { container } = render(
      <TemplateRenderer
        document={EXPERIENCED_FIXTURE}
        settings={{ ...EXPERIENCED_FIXTURE.settings, templateId: "modern-editorial" }}
      />
    );

    expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();
    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(screen.getByText(/Nexora Systems/)).toBeInTheDocument();

    const editorialDoc = container.querySelector(".modern-editorial");
    expect(editorialDoc).not.toBeNull();
    expect(editorialDoc?.getAttribute("data-template")).toBe("modern-editorial");
  });

  it("renders Technical / Project-First template (RS-055) emphasizing projects and stack", () => {
    const { container } = render(
      <TemplateRenderer
        document={FRESHER_FIXTURE}
        settings={{ ...FRESHER_FIXTURE.settings, templateId: "technical" }}
      />
    );

    expect(screen.getByText("Priya Mehta")).toBeInTheDocument();
    expect(screen.getByText("Technical Projects")).toBeInTheDocument();
    expect(screen.getByText(/StudyBuddy — Collaborative Notes App/)).toBeInTheDocument();
    expect(screen.getAllByText(/React/).length).toBeGreaterThan(0);

    const techDoc = container.querySelector(".technical-template");
    expect(techDoc).not.toBeNull();
    expect(techDoc?.getAttribute("data-template")).toBe("technical");
  });

  it("renders Experienced Professional template (RS-056) with executive profile and leadership focus", () => {
    const { container } = render(
      <TemplateRenderer
        document={EXPERIENCED_FIXTURE}
        settings={{ ...EXPERIENCED_FIXTURE.settings, templateId: "experienced" }}
      />
    );

    expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();
    expect(screen.getByText("Executive Profile")).toBeInTheDocument();
    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(screen.getByText(/Nexora Systems/)).toBeInTheDocument();

    const expDoc = container.querySelector(".experienced-template");
    expect(expDoc).not.toBeNull();
    expect(expDoc?.getAttribute("data-template")).toBe("experienced");
  });

  it("omits empty sections cleanly across all templates", () => {
    // Document with no certifications, awards, volunteering, or publications
    const minimalDoc = {
      ...FRESHER_FIXTURE,
      certifications: [],
      awards: [],
      volunteering: [],
      publications: [],
    };

    render(
      <TemplateRenderer
        document={minimalDoc}
        settings={{ ...minimalDoc.settings, templateId: "modern-editorial" }}
      />
    );

    expect(screen.queryByText(/Certifications & Credentials/i)).toBeNull();
    expect(screen.queryByText(/Honors & Awards/i)).toBeNull();
    expect(screen.queryByText(/Leadership & Community/i)).toBeNull();
  });

  it("template switching across all implemented templates preserves canonical resume data", () => {
    const { rerender } = render(
      <TemplateRenderer
        document={EXPERIENCED_FIXTURE}
        settings={{ ...EXPERIENCED_FIXTURE.settings, templateId: "classic-ats" }}
      />
    );
    expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();

    const templateIds = ["modern-editorial", "technical", "experienced", "fresher-graduate"] as const;
    for (const tId of templateIds) {
      rerender(
        <TemplateRenderer
          document={EXPERIENCED_FIXTURE}
          settings={{ ...EXPERIENCED_FIXTURE.settings, templateId: tId }}
        />
      );
      expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();
      expect(screen.getByText(/Nexora Systems/)).toBeInTheDocument();
    }
  });
});
