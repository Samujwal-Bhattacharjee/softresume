/**
 * RS-055 — Technical / Project-First Template
 *
 * Designed for software engineers, AI/ML researchers, cloud/DevOps, and data roles.
 * Prioritizes technical projects, stack competencies, contribution bullets, and verifiable repo links.
 * Single-column, semantic hierarchy ensuring full ATS parse-readiness.
 */
import React from "react";
import type { TemplateRenderProps } from "@/lib/resume/template-contract";
import {
  SectionHeading,
  ExperienceItem,
  EducationItem,
  BulletList,
  DateRange,
  SafeLink,
  VolunteeringItem,
  PublicationItem,
  CustomSectionBlock,
  getVisibleSections,
} from "./primitives";
import { FONT_PRESET_CONFIG, PAGE_DIMENSIONS } from "@/lib/resume/template-contract";
import type { ProjectEntry, SkillGroup } from "@/lib/schemas/resume";

export function TechnicalTemplate({
  document,
  settings,
  isPrint = false,
  scale = 1,
}: TemplateRenderProps) {
  const { basics, summary } = document;
  const rawSections = getVisibleSections(document);

  // By default for technical, prioritize skills and projects early unless user customized sectionOrder
  const hasCustomOrder = document.settings.sectionOrder && document.settings.sectionOrder.length > 0;
  const visibleSections = hasCustomOrder
    ? rawSections
    : [
        "basics",
        "summary",
        "skills",
        "projects",
        "experience",
        "education",
        "certifications",
        "awards",
        "internships",
        "volunteering",
        "publications",
        ...(document.customSections?.map((s) => s.id) ?? []),
      ].filter((s) => rawSections.includes(s));

  const fontPresetKey = settings.fontPreset === "editorial" ? "clean" : (settings.fontPreset ?? "clean");
  const fontConfig = FONT_PRESET_CONFIG[fontPresetKey] ?? FONT_PRESET_CONFIG.clean;
  const pageDims = PAGE_DIMENSIONS[settings.pageSize ?? "A4"];
  const marginIn = settings.marginSize === "compact" ? 0.55 : settings.marginSize === "spacious" ? 0.8 : 0.65;
  const lineHeight = settings.lineSpacing ?? 1.18;

  // Technical accent color: dark teal/cyan or custom accent
  const accent = settings.accentColor && settings.accentColor !== "#201E28"
    ? settings.accentColor
    : "#0F766E"; // rich teal

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
      className="resume-document technical-template"
      style={pageStyle}
      aria-label="Resume document"
      data-template="technical"
    >
      {/* ── Technical Header ── */}
      <header
        style={{
          borderBottom: `2px solid ${accent}`,
          paddingBottom: "0.5em",
          marginBottom: "0.7em",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "0.4em",
          }}
        >
          <h1
            style={{
              fontSize: "1.85em",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {basics.name || "Your Name"}
          </h1>
          {basics.headline && (
            <span
              style={{
                fontFamily: fontConfig.monoFont,
                fontSize: "0.9em",
                fontWeight: 600,
                color: accent,
              }}
            >
              {basics.headline}
            </span>
          )}
        </div>

        {/* Contact & Developer Links */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.2em 0.8em",
            marginTop: "0.4em",
            fontSize: "0.85em",
            color: "#475569",
          }}
        >
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>· {basics.phone}</span>}
          {basics.location && <span>· {basics.location}</span>}
          {basics.links && basics.links.map((link, i) => (
            <span key={i}>
              · <SafeLink
                url={link.url}
                label={link.label}
                style={{ color: accent, fontWeight: 600 }}
              />
            </span>
          ))}
        </div>
      </header>

      {/* ── Main Document ── */}
      <main>
        {visibleSections.map((sectionId) => {
          switch (sectionId) {
            case "summary":
              if (!summary) return null;
              return (
                <section key="summary" aria-label="Summary" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Technical Summary</SectionHeading>
                  <p style={{ margin: "0.2em 0 0 0", color: "#334155" }}>{summary}</p>
                </section>
              );

            case "skills":
              if (!document.skills || document.skills.length === 0) return null;
              return (
                <section key="skills" aria-label="Skills" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Technical Skills</SectionHeading>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3em", marginTop: "0.25em" }}>
                    {document.skills.map((group: SkillGroup) => (
                      <div key={group.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.3em" }}>
                        {group.category && (
                          <span style={{ fontWeight: 700, fontSize: "0.9em", color: "#1e293b", minWidth: "110px" }}>
                            {group.category}:
                          </span>
                        )}
                        <span style={{ color: "#334155", fontSize: "0.92em" }}>
                          {group.items.join(" · ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!document.projects || document.projects.length === 0) return null;
              return (
                <section key="projects" aria-label="Projects" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Technical Projects</SectionHeading>
                  {document.projects.map((proj: ProjectEntry) => (
                    <div key={proj.id} style={{ marginBottom: "0.65em" }} className="no-page-break">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: "0.5em",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, fontSize: "0.95em", color: "#0f172a" }}>
                            {proj.url ? <SafeLink url={proj.url} label={proj.name} style={{ color: accent }} /> : proj.name}
                          </span>
                          {proj.repoUrl && proj.repoUrl !== proj.url && (
                            <span style={{ fontSize: "0.82em", marginLeft: "0.5em" }}>
                              [<SafeLink url={proj.repoUrl} label="code" style={{ color: accent }} />]
                            </span>
                          )}
                        </div>
                        <DateRange
                          startDate={proj.startDate}
                          endDate={proj.endDate}
                          style={{ fontSize: "0.85em", color: "#64748b" }}
                        />
                      </div>

                      {/* Tech stack badge list */}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div
                          style={{
                            fontFamily: fontConfig.monoFont,
                            fontSize: "0.82em",
                            color: accent,
                            marginTop: "0.1em",
                            marginBottom: "0.2em",
                            fontWeight: 600,
                          }}
                        >
                          Stack: {proj.technologies.join(" | ")}
                        </div>
                      )}

                      {proj.description && !proj.bullets?.length && (
                        <p style={{ margin: "0.15em 0 0 0", color: "#334155", fontSize: "0.92em" }}>
                          {proj.description}
                        </p>
                      )}

                      {proj.bullets && proj.bullets.length > 0 && (
                        <BulletList bullets={proj.bullets} />
                      )}
                    </div>
                  ))}
                </section>
              );

            case "experience":
              if (!document.experience || document.experience.length === 0) return null;
              return (
                <section key="experience" aria-label="Experience" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Work Experience</SectionHeading>
                  {document.experience.map((entry) => (
                    <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "education":
              if (!document.education || document.education.length === 0) return null;
              return (
                <section key="education" aria-label="Education" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Education</SectionHeading>
                  {document.education.map((entry) => (
                    <EducationItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "certifications":
              if (!document.certifications || document.certifications.length === 0) return null;
              return (
                <section key="certifications" aria-label="Certifications" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Certifications</SectionHeading>
                  {document.certifications.map((entry) => (
                    <div key={entry.id} style={{ marginBottom: "0.3em", fontSize: "0.92em" }}>
                      <span style={{ fontWeight: 600 }}>{entry.name}</span>
                      {entry.issuer && <span style={{ color: "#64748b" }}> · {entry.issuer}</span>}
                      {entry.date && (
                        <span style={{ color: "#94a3b8", marginLeft: "0.4em", fontSize: "0.9em" }}>
                          ({entry.date.slice(0, 7)})
                        </span>
                      )}
                    </div>
                  ))}
                </section>
              );

            case "awards":
              if (!document.awards || document.awards.length === 0) return null;
              return (
                <section key="awards" aria-label="Awards" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Awards & Competitions</SectionHeading>
                  {document.awards.map((entry) => (
                    <div key={entry.id} style={{ marginBottom: "0.3em", fontSize: "0.92em" }}>
                      <span style={{ fontWeight: 600 }}>{entry.title}</span>
                      {entry.issuer && <span style={{ color: "#64748b" }}> · {entry.issuer}</span>}
                    </div>
                  ))}
                </section>
              );

            case "internships":
              if (!document.internships || document.internships.length === 0) return null;
              return (
                <section key="internships" aria-label="Internships" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Internships</SectionHeading>
                  {document.internships.map((entry) => (
                    <ExperienceItem key={entry.id} entry={entry} accentColor={accent} />
                  ))}
                </section>
              );

            case "volunteering":
              if (!document.volunteering || document.volunteering.length === 0) return null;
              return (
                <section key="volunteering" aria-label="Volunteering" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Volunteering &amp; Open Source</SectionHeading>
                  {document.volunteering.map((entry) => (
                    <VolunteeringItem key={entry.id} entry={entry} />
                  ))}
                </section>
              );

            case "publications":
              if (!document.publications || document.publications.length === 0) return null;
              return (
                <section key="publications" aria-label="Publications" style={{ marginBottom: "0.7em" }}>
                  <SectionHeading style={{ color: accent }}>Publications &amp; Talks</SectionHeading>
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
