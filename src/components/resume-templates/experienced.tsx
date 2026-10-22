/**
 * RS-056 — Experienced Professional Template
 *
 * Tailored for senior engineers, tech leads, managers, and directors.
 * Places primary emphasis on career progression, leadership scope, and measurable business impact.
 * Designed to cleanly handle multi-page layouts with robust page-break behavior.
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

export function ExperiencedTemplate({
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
  const lineHeight = settings.lineSpacing ?? 1.16;

  // Executive navy/slate tone
  const accent = settings.accentColor && settings.accentColor !== "#201E28"
    ? settings.accentColor
    : "#1E3A8A"; // deep executive blue

  const pageStyle: React.CSSProperties = {
    fontFamily: fontConfig.bodyFont,
    fontSize: isPrint ? "10.5pt" : "11px",
    lineHeight,
    color: "#0f172a",
    background: "#ffffff",
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
      className="resume-document experienced-template"
      style={pageStyle}
      aria-label="Resume document"
      data-template="experienced"
    >
      {/* ── Executive Header ── */}
      <header
        style={{
          borderBottom: `2.5px solid ${accent}`,
          paddingBottom: "0.6em",
          marginBottom: "0.8em",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h1
            style={{
              fontSize: "2em",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 0.1em 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {basics.name || "Your Name"}
          </h1>
          {basics.headline && (
            <p
              style={{
                margin: "0 0 0.4em 0",
                fontSize: "1.05em",
                fontWeight: 600,
                color: accent,
                letterSpacing: "0.01em",
              }}
            >
              {basics.headline}
            </p>
          )}

          {/* Contact Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.3em 0.8em",
              fontSize: "0.86em",
              color: "#475569",
            }}
          >
            {basics.email && <span>{basics.email}</span>}
            {basics.phone && <span>· {basics.phone}</span>}
            {basics.location && <span>· {basics.location}</span>}
            {basics.links && basics.links.map((link, i) => (
              <span key={i}>
                · <SafeLink url={link.url} label={link.label} style={{ color: accent, fontWeight: 600 }} />
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Document Body ── */}
      <main>
        {visibleSections.map((sectionId) => {
          switch (sectionId) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" aria-label="Executive Profile" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Executive Profile</SectionHeading>
                  <p style={{ margin: "0.25em 0 0 0", color: "#334155", lineHeight: 1.45 }}>
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              if (!document.experience || document.experience.length === 0) return null;
              return (
                <section key="experience" aria-label="Professional Experience" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Professional Experience</SectionHeading>
                  {document.experience.map((entry) => (
                    <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "skills":
              if (!document.skills || document.skills.length === 0) return null;
              return (
                <section key="skills" aria-label="Core Competencies" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Core Competencies & Expertise</SectionHeading>
                  <SkillsSection groups={document.skills} layout="grouped" />
                </section>
              );

            case "projects":
              if (!document.projects || document.projects.length === 0) return null;
              return (
                <section key="projects" aria-label="Strategic Initiatives" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Key Initiatives & Projects</SectionHeading>
                  {document.projects.map((entry) => (
                    <ProjectItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "education":
              if (!document.education || document.education.length === 0) return null;
              return (
                <section key="education" aria-label="Education" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Education & Credentials</SectionHeading>
                  {document.education.map((entry) => (
                    <EducationItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "certifications":
              if (!document.certifications || document.certifications.length === 0) return null;
              return (
                <section key="certifications" aria-label="Certifications" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Certifications & Licensures</SectionHeading>
                  {document.certifications.map((entry) => (
                    <CertificationItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "awards":
              if (!document.awards || document.awards.length === 0) return null;
              return (
                <section key="awards" aria-label="Honors & Leadership" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Honors & Industry Recognition</SectionHeading>
                  {document.awards.map((entry) => (
                    <AwardItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "volunteering":
              if (!document.volunteering || document.volunteering.length === 0) return null;
              return (
                <section key="volunteering" aria-label="Board & Community" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Advisory & Board Service</SectionHeading>
                  {document.volunteering.map((entry) => (
                    <VolunteeringItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "publications":
              if (!document.publications || document.publications.length === 0) return null;
              return (
                <section key="publications" aria-label="Publications" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading style={{ color: accent }}>Publications &amp; Thought Leadership</SectionHeading>
                  {document.publications.map((entry) => (
                    <PublicationItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            default: {
              const custom = document.customSections?.find((c) => c.id === sectionId);
              if (custom && custom.items && custom.items.length > 0) {
                return (
                  <CustomSectionBlock
                    key={custom.id}
                    section={custom}
                    accentColor={accent}
                  />
                );
              }
              return null;
            }
          }
        })}
      </main>
    </div>
  );
}
