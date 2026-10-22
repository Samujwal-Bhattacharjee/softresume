/**
 * RS-051 — Shared Resume Rendering Primitives
 *
 * Semantic components used by all templates.
 * These produce correctly-ordered HTML text for PDF extraction.
 * NEVER render images in place of text.
 */
import React from "react";
import { formatDateRange } from "@/lib/utils";
import type {
  ResumeDocument,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  SkillGroup,
  InternshipEntry,
  CertificationEntry,
  AwardEntry,
  VolunteeringEntry,
  PublicationEntry,
  CustomSection,
} from "@/lib/schemas/resume";

// ─────────────────────────────────────────────
// Primitive: Bullet list
// ─────────────────────────────────────────────

export function BulletList({ bullets }: { bullets: string[] }) {
  if (!bullets || bullets.length === 0) return null;
  return (
    <ul
      style={{
        margin: "0.2em 0 0 0",
        paddingLeft: "1.1em",
        listStyleType: "disc",
      }}
    >
      {bullets.map((b, i) => (
        <li key={i} style={{ marginBottom: "0.15em", lineHeight: "1.4" }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Primitive: Date range
// ─────────────────────────────────────────────

export function DateRange({
  startDate,
  endDate,
  current,
  style,
}: {
  startDate?: string;
  endDate?: string;
  current?: boolean;
  style?: React.CSSProperties;
}) {
  const text = formatDateRange(startDate, endDate, current);
  if (!text) return null;
  return (
    <span style={{ whiteSpace: "nowrap", ...style }}>
      {text}
    </span>
  );
}

// ─────────────────────────────────────────────
// Primitive: Link (safe URL display)
// ─────────────────────────────────────────────

export function SafeLink({
  url,
  label,
  style,
}: {
  url: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  if (!url) return null;
  // Validate: only allow http/https/mailto
  let safeUrl = url;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      safeUrl = "#";
    }
  } catch {
    safeUrl = "#";
  }
  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "inherit",
        wordBreak: "break-all",
        ...style,
      }}
    >
      {label || url}
    </a>
  );
}

// ─────────────────────────────────────────────
// Primitive: Section heading
// ─────────────────────────────────────────────

export function SectionHeading({
  children,
  style,
  lineStyle,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ marginTop: "0.8em", marginBottom: "0.3em" }}>
      <h2
        style={{
          fontSize: "0.85em",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: 0,
          paddingBottom: "0.2em",
          ...style,
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "1px",
          background: "currentColor",
          opacity: 0.25,
          ...lineStyle,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Experience entry
// ─────────────────────────────────────────────

export function ExperienceItem({
  entry,
  accentColor,
}: {
  entry: ExperienceEntry | InternshipEntry;
  accentColor?: string;
}) {
  return (
    <div
      style={{ marginBottom: "0.6em" }}
      className="no-page-break"
    >
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
          <span style={{ fontWeight: 700 }}>{entry.role}</span>
          {entry.employer && (
            <>
              {" · "}
              <span style={{ fontWeight: 600, color: accentColor ?? "inherit" }}>
                {entry.employer}
              </span>
            </>
          )}
          {entry.location && (
            <span style={{ fontWeight: 400, opacity: 0.7 }}>
              {" "}
              · {entry.location}
              {entry.remote ? " (Remote)" : ""}
            </span>
          )}
        </div>
        <DateRange
          startDate={entry.startDate}
          endDate={entry.endDate}
          current={entry.current}
          style={{ fontSize: "0.88em", opacity: 0.7, flexShrink: 0 }}
        />
      </div>
      <BulletList bullets={entry.bullets} />
      {entry.description && !entry.bullets?.length && (
        <p style={{ margin: "0.2em 0 0 0", opacity: 0.8 }}>{entry.description}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Education entry
// ─────────────────────────────────────────────

export function EducationItem({ entry }: { entry: EducationEntry }) {
  return (
    <div style={{ marginBottom: "0.5em" }} className="no-page-break">
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
          <span style={{ fontWeight: 700 }}>{entry.institution}</span>
          {(entry.degree || entry.field) && (
            <span style={{ opacity: 0.8 }}>
              {" · "}
              {[entry.degree, entry.field].filter(Boolean).join(", ")}
            </span>
          )}
          {entry.location && (
            <span style={{ opacity: 0.65 }}> · {entry.location}</span>
          )}
        </div>
        <DateRange
          startDate={entry.startDate}
          endDate={entry.endDate}
          current={entry.current}
          style={{ fontSize: "0.88em", opacity: 0.7, flexShrink: 0 }}
        />
      </div>
      {entry.grade && (
        <p style={{ margin: "0.1em 0 0 0", opacity: 0.7, fontSize: "0.9em" }}>
          {entry.grade}
        </p>
      )}
      {entry.honors && (
        <p style={{ margin: "0.1em 0 0 0", opacity: 0.7, fontSize: "0.9em" }}>
          {entry.honors}
        </p>
      )}
      {entry.coursework && entry.coursework.length > 0 && (
        <p style={{ margin: "0.15em 0 0 0", opacity: 0.65, fontSize: "0.85em" }}>
          Relevant coursework: {entry.coursework.join(", ")}
        </p>
      )}
      {entry.details && (
        <p style={{ margin: "0.1em 0 0 0", opacity: 0.75, fontSize: "0.9em" }}>
          {entry.details}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Project entry
// ─────────────────────────────────────────────

export function ProjectItem({
  entry,
  accentColor,
}: {
  entry: ProjectEntry;
  accentColor?: string;
}) {
  return (
    <div style={{ marginBottom: "0.6em" }} className="no-page-break">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5em",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span style={{ fontWeight: 700, color: accentColor ?? "inherit" }}>
            {entry.url ? (
              <SafeLink url={entry.url} label={entry.name} />
            ) : (
              entry.name
            )}
          </span>
          {entry.technologies && entry.technologies.length > 0 && (
            <span style={{ opacity: 0.65, fontSize: "0.85em" }}>
              {" · "}
              {entry.technologies.join(", ")}
            </span>
          )}
        </div>
        <DateRange
          startDate={entry.startDate}
          endDate={entry.endDate}
          style={{ fontSize: "0.88em", opacity: 0.7, flexShrink: 0 }}
        />
      </div>
      {entry.description && !entry.bullets?.length && (
        <p style={{ margin: "0.15em 0 0 0", opacity: 0.8 }}>{entry.description}</p>
      )}
      {entry.bullets && entry.bullets.length > 0 && (
        <BulletList bullets={entry.bullets} />
      )}
      {entry.repoUrl && entry.repoUrl !== entry.url && (
        <p style={{ margin: "0.1em 0 0 0", fontSize: "0.85em", opacity: 0.65 }}>
          Repo: <SafeLink url={entry.repoUrl} />
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Skills
// ─────────────────────────────────────────────

export function SkillsSection({
  groups,
  layout = "inline",
}: {
  groups: SkillGroup[];
  layout?: "inline" | "grouped";
}) {
  if (!groups || groups.length === 0) return null;

  if (layout === "grouped") {
    return (
      <div>
        {groups.map((g) => (
          <div key={g.id} style={{ marginBottom: "0.3em" }}>
            {g.category && (
              <span style={{ fontWeight: 600, marginRight: "0.4em" }}>
                {g.category}:
              </span>
            )}
            <span style={{ opacity: 0.85 }}>{g.items.join(", ")}</span>
          </div>
        ))}
      </div>
    );
  }

  // Inline: all items in one paragraph
  const allItems = groups
    .map((g) =>
      g.category ? `${g.category}: ${g.items.join(", ")}` : g.items.join(", ")
    )
    .join(" · ");

  return <p style={{ margin: 0, opacity: 0.85 }}>{allItems}</p>;
}

// ─────────────────────────────────────────────
// Primitive: Certification item
// ─────────────────────────────────────────────

export function CertificationItem({ entry }: { entry: CertificationEntry }) {
  return (
    <div style={{ marginBottom: "0.35em" }}>
      <span style={{ fontWeight: 600 }}>{entry.name}</span>
      {entry.issuer && <span style={{ opacity: 0.75 }}> · {entry.issuer}</span>}
      {entry.date && (
        <span style={{ opacity: 0.75, marginLeft: "0.5em", fontSize: "0.9em" }}>
          ({entry.date.slice(0, 7)})
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Award item
// ─────────────────────────────────────────────

export function AwardItem({ entry }: { entry: AwardEntry }) {
  return (
    <div style={{ marginBottom: "0.35em" }}>
      <span style={{ fontWeight: 600 }}>{entry.title}</span>
      {entry.issuer && <span style={{ opacity: 0.75 }}> · {entry.issuer}</span>}
      {entry.date && (
        <span style={{ opacity: 0.75, marginLeft: "0.5em", fontSize: "0.9em" }}>
          ({entry.date.slice(0, 7)})
        </span>
      )}
      {entry.description && (
        <p style={{ margin: "0.1em 0 0 0", opacity: 0.75, fontSize: "0.9em" }}>
          {entry.description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Volunteering item
// ─────────────────────────────────────────────

export function VolunteeringItem({ entry }: { entry: VolunteeringEntry }) {
  return (
    <div style={{ marginBottom: "0.5em" }} className="no-page-break">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5em",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span style={{ fontWeight: 700 }}>{entry.organization}</span>
          {entry.role && <span style={{ opacity: 0.8 }}> · {entry.role}</span>}
        </div>
        <DateRange
          startDate={entry.startDate}
          endDate={entry.endDate}
          current={entry.current}
          style={{ fontSize: "0.88em", opacity: 0.7 }}
        />
      </div>
      {entry.bullets && entry.bullets.length > 0 && (
        <BulletList bullets={entry.bullets} />
      )}
      {entry.description && !entry.bullets?.length && (
        <p style={{ margin: "0.1em 0 0 0", opacity: 0.8 }}>{entry.description}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Publication item
// ─────────────────────────────────────────────

export function PublicationItem({
  entry,
  accentColor,
}: {
  entry: PublicationEntry;
  accentColor?: string;
}) {
  return (
    <div style={{ marginBottom: "0.4em" }} className="no-page-break">
      <span style={{ fontWeight: 600 }}>{entry.title}</span>
      {entry.venue && <span style={{ opacity: 0.75 }}> · {entry.venue}</span>}
      {entry.authors && (
        <span style={{ opacity: 0.65, fontSize: "0.9em" }}> · {entry.authors}</span>
      )}
      {entry.date && (
        <span style={{ opacity: 0.65, fontSize: "0.9em", marginLeft: "0.4em" }}>
          ({entry.date.slice(0, 7)})
        </span>
      )}
      {entry.description && (
        <p style={{ margin: "0.1em 0 0 0", opacity: 0.75, fontSize: "0.9em" }}>
          {entry.description}
        </p>
      )}
      {entry.url && (
        <div style={{ fontSize: "0.85em" }}>
          <SafeLink url={entry.url} style={{ color: accentColor }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Primitive: Custom section block
// ─────────────────────────────────────────────

export function CustomSectionBlock({
  section,
  accentColor,
}: {
  section: CustomSection;
  accentColor?: string;
}) {
  if (!section.items || section.items.length === 0) return null;
  return (
    <section aria-label={section.title} style={{ marginBottom: "0.8em" }}>
      <SectionHeading style={accentColor ? { color: accentColor } : undefined}>
        {section.title}
      </SectionHeading>
      {section.items.map((item) => (
        <div key={item.id} style={{ marginBottom: "0.4em" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.5em",
              flexWrap: "wrap",
            }}
          >
            <div>
              {item.title && <span style={{ fontWeight: 600 }}>{item.title}</span>}
              {item.subtitle && <span style={{ opacity: 0.75 }}> · {item.subtitle}</span>}
            </div>
            {item.date && (
              <span style={{ opacity: 0.7, fontSize: "0.88em" }}>
                {item.date.slice(0, 7)}
              </span>
            )}
          </div>
          {item.description && (
            <p style={{ margin: "0.1em 0 0 0", opacity: 0.8, fontSize: "0.92em" }}>
              {item.description}
            </p>
          )}
          {item.bullets && item.bullets.length > 0 && (
            <BulletList bullets={item.bullets} />
          )}
          {item.url && (
            <div style={{ fontSize: "0.85em" }}>
              <SafeLink url={item.url} style={{ color: accentColor }} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────
// Helper: get visible sections in order
// ─────────────────────────────────────────────

export function getVisibleSections(doc: ResumeDocument): string[] {
  const { sectionOrder, hiddenSections } = doc.settings;
  const hidden = new Set(hiddenSections);

  const defaultOrder = [
    "basics",
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "internships",
    "certifications",
    "awards",
    "volunteering",
    "publications",
  ];

  const baseOrder = sectionOrder && sectionOrder.length > 0 ? [...sectionOrder] : [...defaultOrder];

  for (const s of defaultOrder) {
    if (!baseOrder.includes(s)) {
      baseOrder.push(s);
    }
  }

  if (doc.customSections && doc.customSections.length > 0) {
    for (const cs of doc.customSections) {
      if (!baseOrder.includes(cs.id)) {
        baseOrder.push(cs.id);
      }
    }
  }

  return baseOrder.filter((s) => !hidden.has(s));
}

