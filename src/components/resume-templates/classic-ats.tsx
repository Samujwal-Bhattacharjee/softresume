/**
 * RS-052 — Classic ATS Template
 *
 * Single-column, high-contrast, no decorative elements.
 * Designed for maximum ATS parsing compatibility.
 * Contact details always in document body (not headers/footers).
 * No text encoded only in icons, charts, or graphics.
 */
import React from "react";
import type { TemplateRenderProps } from "@/lib/resume/template-contract";
import {
  SectionHeading,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillsSection,
  CertificationItem,
  AwardItem,
  VolunteeringItem,
  PublicationItem,
  CustomSectionBlock,
  SafeLink,
  getVisibleSections,
} from "./primitives";
import { FONT_PRESET_CONFIG, PAGE_DIMENSIONS } from "@/lib/resume/template-contract";

export function ClassicATSTemplate({
  document,
  settings,
  isPrint = false,
  scale = 1,
}: TemplateRenderProps) {
  const { basics, summary } = document;
  const visibleSections = getVisibleSections(document);

  const fontConfig = FONT_PRESET_CONFIG[settings.fontPreset ?? "clean"];
  const pageDims = PAGE_DIMENSIONS[settings.pageSize ?? "A4"];
  const marginIn = settings.marginSize === "compact" ? 0.55 : settings.marginSize === "spacious" ? 0.8 : 0.65;
  const lineHeight = settings.lineSpacing ?? 1.15;

  // Document styles (applied to the page root)
  const pageStyle: React.CSSProperties = {
    fontFamily: fontConfig.bodyFont,
    fontSize: isPrint ? "11pt" : "11px",
    lineHeight,
    color: "#111111",
    background: "white",
    width: isPrint ? `${pageDims.width}mm` : `${pageDims.width * scale}px`,
    minHeight: isPrint ? `${pageDims.height}mm` : undefined,
    padding: isPrint
      ? `${marginIn}in`
      : `${marginIn * 96 * scale}px`,
    boxSizing: "border-box",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  };

  return (
    <div
      className="resume-document"
      style={pageStyle}
      aria-label="Resume document"
    >
      {/* ── Header / Contact ── */}
      <header style={{ marginBottom: "0.6em", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.7em",
            fontWeight: 700,
            margin: "0 0 0.15em 0",
            letterSpacing: "-0.01em",
          }}
        >
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p style={{ margin: "0 0 0.3em 0", opacity: 0.75, fontSize: "0.95em" }}>
            {basics.headline}
          </p>
        )}
        {/* Contact details — always in body, never in a header/footer/text box only */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.3em 0.8em",
            fontSize: "0.88em",
            opacity: 0.8,
          }}
        >
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.links.map((link, i) => (
            <SafeLink key={i} url={link.url} label={link.label} />
          ))}
        </div>
        {/* Divider */}
        <div
          style={{
            height: "1.5px",
            background: "#111111",
            margin: "0.6em 0 0 0",
          }}
        />
      </header>

      {/* ── Body sections in order ── */}
      <main>
        {visibleSections.includes("summary") && summary && (
          <section aria-label="Professional Summary">
            <SectionHeading>Summary</SectionHeading>
            <p style={{ margin: "0.2em 0 0 0" }}>{summary}</p>
          </section>
        )}

        {visibleSections.includes("experience") && document.experience.length > 0 && (
          <section aria-label="Experience">
            <SectionHeading>Experience</SectionHeading>
            {document.experience.map((entry) => (
              <ExperienceItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {visibleSections.includes("internships") && document.internships.length > 0 && (
          <section aria-label="Internships">
            <SectionHeading>Internships</SectionHeading>
            {document.internships.map((entry) => (
              <ExperienceItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {visibleSections.includes("education") && document.education.length > 0 && (
          <section aria-label="Education">
            <SectionHeading>Education</SectionHeading>
            {document.education.map((entry) => (
              <EducationItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {visibleSections.includes("projects") && document.projects.length > 0 && (
          <section aria-label="Projects">
            <SectionHeading>Projects</SectionHeading>
            {document.projects.map((entry) => (
              <ProjectItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {visibleSections.includes("skills") && document.skills.length > 0 && (
          <section aria-label="Skills">
            <SectionHeading>Skills</SectionHeading>
            <SkillsSection groups={document.skills} layout="grouped" />
          </section>
        )}

        {visibleSections.includes("certifications") &&
          document.certifications.length > 0 && (
            <section aria-label="Certifications">
              <SectionHeading>Certifications</SectionHeading>
              {document.certifications.map((entry) => (
                <CertificationItem key={entry.id} entry={entry} />
              ))}
            </section>
          )}

        {visibleSections.includes("awards") && document.awards.length > 0 && (
          <section aria-label="Awards">
            <SectionHeading>Awards</SectionHeading>
            {document.awards.map((entry) => (
              <AwardItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {visibleSections.includes("volunteering") &&
          document.volunteering &&
          document.volunteering.length > 0 && (
            <section aria-label="Volunteering">
              <SectionHeading>Volunteering</SectionHeading>
              {document.volunteering.map((entry) => (
                <VolunteeringItem key={entry.id} entry={entry} />
              ))}
            </section>
          )}

        {visibleSections.includes("publications") &&
          document.publications &&
          document.publications.length > 0 && (
            <section aria-label="Publications">
              <SectionHeading>Publications</SectionHeading>
              {document.publications.map((entry) => (
                <PublicationItem key={entry.id} entry={entry} />
              ))}
            </section>
          )}

        {/* Custom sections */}
        {document.customSections &&
          document.customSections
            .filter((s) => !document.settings?.hiddenSections?.includes(s.id))
            .map((section) => (
              <CustomSectionBlock key={section.id} section={section} />
            ))}
      </main>
    </div>
  );
}

export { ClassicATSTemplate as ClassicAtsTemplate };
