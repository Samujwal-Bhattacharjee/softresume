/**
 * RS-053 — Modern Editorial Template
 *
 * Refined typography, understated accent color, and crisp dividers.
 * Single-column, ATS-safe hierarchy tailored for product, operations,
 * design, and experienced business generalists.
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
  SafeLink,
  getVisibleSections,
} from "./primitives";
import { FONT_PRESET_CONFIG, PAGE_DIMENSIONS } from "@/lib/resume/template-contract";

export function ModernEditorialTemplate({
  document,
  settings,
  isPrint = false,
  scale = 1,
}: TemplateRenderProps) {
  const { basics, summary } = document;
  const visibleSections = getVisibleSections(document);

  const fontPresetKey = settings.fontPreset === "clean" ? "editorial" : (settings.fontPreset ?? "editorial");
  const fontConfig = FONT_PRESET_CONFIG[fontPresetKey] ?? FONT_PRESET_CONFIG.editorial;
  const pageDims = PAGE_DIMENSIONS[settings.pageSize ?? "A4"];
  const marginIn = settings.marginSize === "compact" ? 0.55 : settings.marginSize === "spacious" ? 0.8 : 0.65;
  const lineHeight = settings.lineSpacing ?? 1.2;

  // Editorial accent: default to warm slate/ink
  const accent = settings.accentColor && settings.accentColor !== "#201E28"
    ? settings.accentColor
    : "#2A3B4C";

  const pageStyle: React.CSSProperties = {
    fontFamily: fontConfig.bodyFont,
    fontSize: isPrint ? "10.5pt" : "11px",
    lineHeight,
    color: "#1e2229",
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
      className="resume-document modern-editorial"
      style={pageStyle}
      aria-label="Resume document"
      data-template="modern-editorial"
    >
      {/* ── Editorial Header ── */}
      <header
        style={{
          borderBottom: `1.5px solid ${accent}`,
          paddingBottom: "0.7em",
          marginBottom: "0.8em",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "0.5em",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: fontConfig.headingFont,
                fontSize: "1.9em",
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 0.15em 0",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {basics.name || "Your Name"}
            </h1>
            {basics.headline && (
              <p
                style={{
                  margin: 0,
                  fontSize: "1em",
                  fontWeight: 500,
                  color: accent,
                  letterSpacing: "0.01em",
                }}
              >
                {basics.headline}
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.2em",
              fontSize: "0.85em",
              color: "#4b5563",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em 0.6em", justifyContent: "flex-end" }}>
              {basics.email && <span>{basics.email}</span>}
              {basics.phone && <span>· {basics.phone}</span>}
              {basics.location && <span>· {basics.location}</span>}
            </div>
            {basics.links && basics.links.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em 0.6em", justifyContent: "flex-end" }}>
                {basics.links.map((link, i) => (
                  <span key={i}>
                    {i > 0 && "· "}
                    <SafeLink
                      url={link.url}
                      label={link.label}
                      style={{ color: accent, textDecoration: "none", fontWeight: 500 }}
                    />
                  </span>
                ))}
              </div>
            )}
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
                <section key="summary" aria-label="Summary" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Executive Summary
                  </SectionHeading>
                  <p style={{ margin: "0.3em 0 0 0", color: "#374151", lineHeight: 1.5 }}>
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              if (!document.experience || document.experience.length === 0) return null;
              return (
                <section key="experience" aria-label="Experience" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Professional Experience
                  </SectionHeading>
                  {document.experience.map((entry) => (
                    <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "education":
              if (!document.education || document.education.length === 0) return null;
              return (
                <section key="education" aria-label="Education" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Education
                  </SectionHeading>
                  {document.education.map((entry) => (
                    <EducationItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "projects":
              if (!document.projects || document.projects.length === 0) return null;
              return (
                <section key="projects" aria-label="Projects" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Key Projects & Initiatives
                  </SectionHeading>
                  {document.projects.map((entry) => (
                    <ProjectItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "skills":
              if (!document.skills || document.skills.length === 0) return null;
              return (
                <section key="skills" aria-label="Skills" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Core Competencies & Skills
                  </SectionHeading>
                  <SkillsSection groups={document.skills} layout="grouped" />
                </section>
              );

            case "internships":
              if (!document.internships || document.internships.length === 0) return null;
              return (
                <section key="internships" aria-label="Internships" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Internships
                  </SectionHeading>
                  {document.internships.map((entry) => (
                    <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "certifications":
              if (!document.certifications || document.certifications.length === 0) return null;
              return (
                <section key="certifications" aria-label="Certifications" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Certifications & Credentials
                  </SectionHeading>
                  {document.certifications.map((entry) => (
                    <CertificationItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "awards":
              if (!document.awards || document.awards.length === 0) return null;
              return (
                <section key="awards" aria-label="Awards" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Honors & Awards
                  </SectionHeading>
                  {document.awards.map((entry) => (
                    <AwardItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "volunteering":
              if (!document.volunteering || document.volunteering.length === 0) return null;
              return (
                <section key="volunteering" aria-label="Volunteering" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Leadership & Community
                  </SectionHeading>
                  {document.volunteering.map((entry) => (
                    <VolunteeringItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "publications":
              if (!document.publications || document.publications.length === 0) return null;
              return (
                <section key="publications" aria-label="Publications" style={{ marginBottom: "0.8em" }}>
                  <SectionHeading
                    style={{ color: accent, letterSpacing: "0.1em" }}
                    lineStyle={{ background: accent, opacity: 0.2 }}
                  >
                    Publications
                  </SectionHeading>
                  {document.publications.map((entry) => (
                    <div key={entry.id} style={{ marginBottom: "0.4em" }}>
                      <span style={{ fontWeight: 600 }}>{entry.title}</span>
                      {entry.venue && <span style={{ opacity: 0.75 }}> · {entry.venue}</span>}
                      {entry.authors && <span style={{ opacity: 0.65, fontSize: "0.9em" }}> · {entry.authors}</span>}
                      {entry.date && (
                        <span style={{ opacity: 0.65, fontSize: "0.9em", marginLeft: "0.4em" }}>
                          ({entry.date.slice(0, 7)})
                        </span>
                      )}
                      {entry.url && (
                        <div style={{ fontSize: "0.85em" }}>
                          <SafeLink url={entry.url} style={{ color: accent }} />
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              );

            default:
              // Custom sections
              if (document.customSections && Array.isArray(document.customSections)) {
                const custom = document.customSections.find((c) => c.id === sectionId);
                if (custom && custom.items && custom.items.length > 0) {
                  return (
                    <section key={sectionId} aria-label={custom.title} style={{ marginBottom: "0.8em" }}>
                      <SectionHeading
                        style={{ color: accent, letterSpacing: "0.1em" }}
                        lineStyle={{ background: accent, opacity: 0.2 }}
                      >
                        {custom.title}
                      </SectionHeading>
                      {custom.items.map((item) => (
                        <div key={item.id} style={{ marginBottom: "0.4em" }}>
                          {item.title && <span style={{ fontWeight: 600 }}>{item.title}</span>}
                          {item.subtitle && <span style={{ opacity: 0.75 }}> · {item.subtitle}</span>}
                          {item.description && <p style={{ margin: "0.1em 0 0 0", opacity: 0.85 }}>{item.description}</p>}
                        </div>
                      ))}
                    </section>
                  );
                }
              }
              return null;
          }
        })}
      </main>
    </div>
  );
}
