/**
 * RS-054 — Fresher / Graduate Template
 *
 * Education, skills, and projects can lead.
 * Supports coursework, internships, student clubs, hackathons, and awards.
 * Still single-column and ATS-safe (conservative heading names).
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

export function FresherGraduateTemplate({
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

  // Accent color for this template (lavender-ish, WCAG AA verified > 5.8:1 contrast on white)
  const accent = settings.accentColor ?? "#6554c0";

  const pageStyle: React.CSSProperties = {
    fontFamily: fontConfig.bodyFont,
    fontSize: isPrint ? "11pt" : "11px",
    lineHeight,
    color: "#1a1a2e",
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
    <div className="resume-document" style={pageStyle} aria-label="Resume document">
      {/* ── Header ── */}
      <header style={{ borderBottom: `2px solid ${accent}`, paddingBottom: "0.5em", marginBottom: "0.6em" }}>
        <h1
          style={{
            fontSize: "1.65em",
            fontWeight: 700,
            margin: "0 0 0.1em 0",
            color: accent,
            letterSpacing: "-0.015em",
          }}
        >
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p style={{ margin: "0 0 0.3em 0", color: accent, fontWeight: 500 }}>
            {basics.headline}
          </p>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.2em 0.7em",
            fontSize: "0.87em",
            color: "#444",
          }}
        >
          {basics.email && <span>✉ {basics.email}</span>}
          {basics.phone && <span>☎ {basics.phone}</span>}
          {basics.location && <span>⌖ {basics.location}</span>}
          {basics.links.map((link, i) => (
            <span key={i}>
              <SafeLink url={link.url} label={link.label} style={{ color: accent }} />
            </span>
          ))}
        </div>
      </header>

      <main>
        {/* Summary */}
        {visibleSections.includes("summary") && summary && (
          <section aria-label="Summary">
            <SectionHeading style={{ color: accent }}>
              About
            </SectionHeading>
            <p style={{ margin: "0.2em 0 0 0" }}>{summary}</p>
          </section>
        )}

        {/* Education first in default fresher order */}
        {visibleSections.includes("education") && document.education.length > 0 && (
          <section aria-label="Education">
            <SectionHeading style={{ color: accent }}>Education</SectionHeading>
            {document.education.map((entry) => (
              <EducationItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {/* Skills */}
        {visibleSections.includes("skills") && document.skills.length > 0 && (
          <section aria-label="Skills">
            <SectionHeading style={{ color: accent }}>Skills</SectionHeading>
            <SkillsSection groups={document.skills} layout="grouped" />
          </section>
        )}

        {/* Projects */}
        {visibleSections.includes("projects") && document.projects.length > 0 && (
          <section aria-label="Projects">
            <SectionHeading style={{ color: accent }}>Projects</SectionHeading>
            {document.projects.map((entry) => (
              <ProjectItem key={entry.id} entry={entry} accentColor={accent} />
            ))}
          </section>
        )}

        {/* Internships */}
        {visibleSections.includes("internships") && document.internships.length > 0 && (
          <section aria-label="Internships">
            <SectionHeading style={{ color: accent }}>Internships</SectionHeading>
            {document.internships.map((entry) => (
              <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
            ))}
          </section>
        )}

        {/* Experience (if any) */}
        {visibleSections.includes("experience") && document.experience.length > 0 && (
          <section aria-label="Experience">
            <SectionHeading style={{ color: accent }}>Experience</SectionHeading>
            {document.experience.map((entry) => (
              <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
            ))}
          </section>
        )}

        {/* Awards */}
        {visibleSections.includes("awards") && document.awards.length > 0 && (
          <section aria-label="Awards &amp; Achievements">
            <SectionHeading style={{ color: accent }}>Awards &amp; Achievements</SectionHeading>
            {document.awards.map((entry) => (
              <AwardItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {/* Volunteering / Activities */}
        {visibleSections.includes("volunteering") && document.volunteering.length > 0 && (
          <section aria-label="Volunteering &amp; Leadership">
            <SectionHeading style={{ color: accent }}>Volunteering &amp; Leadership</SectionHeading>
            {document.volunteering.map((entry) => (
              <VolunteeringItem key={entry.id} entry={entry} />
            ))}
          </section>
        )}

        {/* Certifications */}
        {visibleSections.includes("certifications") &&
          document.certifications &&
          document.certifications.length > 0 && (
            <section aria-label="Certifications">
              <SectionHeading style={{ color: accent }}>Certifications</SectionHeading>
              {document.certifications.map((entry) => (
                <CertificationItem key={entry.id} entry={entry} />
              ))}
            </section>
          )}

        {/* Publications */}
        {visibleSections.includes("publications") &&
          document.publications &&
          document.publications.length > 0 && (
            <section aria-label="Publications">
              <SectionHeading style={{ color: accent }}>Publications &amp; Research</SectionHeading>
              {document.publications.map((entry) => (
                <PublicationItem key={entry.id} entry={entry} accentColor={accent} />
              ))}
            </section>
          )}

        {/* Custom sections */}
        {document.customSections &&
          document.customSections
            .filter((s) => !document.settings?.hiddenSections?.includes(s.id))
            .map((section) => (
              <CustomSectionBlock
                key={section.id}
                section={section}
                accentColor={accent}
              />
            ))}
      </main>
    </div>
  );
}
