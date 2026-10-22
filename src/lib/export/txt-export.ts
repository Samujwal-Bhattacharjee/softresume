/**
 * RS-063 — Plain Text (TXT) Resume Exporter
 *
 * Produces a clean, formatted plain-text representation of the resume.
 * Useful for pasting into ATS application text areas and job boards.
 */

import type { ResumeDocument } from "@/lib/schemas/resume";
import { formatDateRange } from "@/lib/utils";

export function generatePlainTextResume(doc: ResumeDocument): string {
  const lines: string[] = [];

  // Header / Basics
  lines.push(doc.basics.name.toUpperCase());
  if (doc.basics.headline) lines.push(doc.basics.headline);

  const contactParts: string[] = [];
  if (doc.basics.email) contactParts.push(doc.basics.email);
  if (doc.basics.phone) contactParts.push(doc.basics.phone);
  if (doc.basics.location) contactParts.push(doc.basics.location);
  if (contactParts.length > 0) lines.push(contactParts.join(" | "));

  if (doc.basics.links && doc.basics.links.length > 0) {
    const linkParts = doc.basics.links.map((l) => `${l.label}: ${l.url}`);
    lines.push(linkParts.join(" | "));
  }
  lines.push("");

  // Summary
  if (doc.summary && !doc.settings.hiddenSections.includes("summary")) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("--------------------");
    lines.push(doc.summary);
    lines.push("");
  }

  // Follow section order
  const defaultOrder = [
    "experience",
    "education",
    "skills",
    "projects",
    "internships",
    "certifications",
    "awards",
    "volunteering",
    "publications",
  ];

  const order = doc.settings.sectionOrder && doc.settings.sectionOrder.length > 0
    ? [...doc.settings.sectionOrder]
    : [...defaultOrder];

  for (const s of defaultOrder) {
    if (!order.includes(s)) {
      order.push(s);
    }
  }

  if (doc.customSections && doc.customSections.length > 0) {
    for (const cs of doc.customSections) {
      if (!order.includes(cs.id)) {
        order.push(cs.id);
      }
    }
  }

  for (const section of order) {
    if (doc.settings.hiddenSections.includes(section)) continue;

    if (section === "experience" && doc.experience && doc.experience.length > 0) {
      lines.push("EXPERIENCE");
      lines.push("----------");
      for (const exp of doc.experience) {
        const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current);
        const loc = exp.location ? ` (${exp.location})` : "";
        lines.push(`${exp.role} - ${exp.employer}${loc}`);
        if (dateRange) lines.push(dateRange);
        for (const bullet of exp.bullets) {
          if (bullet.trim()) lines.push(`* ${bullet.trim()}`);
        }
        lines.push("");
      }
    }

    if (section === "education" && doc.education && doc.education.length > 0) {
      lines.push("EDUCATION");
      lines.push("---------");
      for (const edu of doc.education) {
        const dateRange = formatDateRange(edu.startDate, edu.endDate);
        const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
        lines.push(`${degreeStr} - ${edu.institution}`);
        if (dateRange) lines.push(dateRange);
        if (edu.grade) lines.push(`Grade: ${edu.grade}`);
        if (edu.coursework && edu.coursework.length > 0) {
          lines.push(`Coursework: ${edu.coursework.join(", ")}`);
        }
        lines.push("");
      }
    }

    if (section === "projects" && doc.projects && doc.projects.length > 0) {
      lines.push("PROJECTS");
      lines.push("--------");
      for (const proj of doc.projects) {
        lines.push(proj.name);
        if (proj.technologies && proj.technologies.length > 0) {
          lines.push(`Technologies: ${proj.technologies.join(", ")}`);
        }
        if (proj.url) lines.push(`Demo: ${proj.url}`);
        if (proj.repoUrl) lines.push(`Code: ${proj.repoUrl}`);
        for (const bullet of proj.bullets || []) {
          if (bullet.trim()) lines.push(`* ${bullet.trim()}`);
        }
        lines.push("");
      }
    }

    if (section === "skills" && doc.skills && doc.skills.length > 0) {
      lines.push("SKILLS");
      lines.push("------");
      for (const group of doc.skills) {
        lines.push(`${group.category}: ${group.items.join(", ")}`);
      }
      lines.push("");
    }

    if (section === "internships" && doc.internships && doc.internships.length > 0) {
      lines.push("INTERNSHIPS");
      lines.push("-----------");
      for (const intern of doc.internships) {
        const dateRange = formatDateRange(intern.startDate, intern.endDate, intern.current);
        const loc = intern.location ? ` (${intern.location})` : "";
        lines.push(`${intern.role} - ${intern.employer}${loc}`);
        if (dateRange) lines.push(dateRange);
        for (const bullet of intern.bullets) {
          if (bullet.trim()) lines.push(`* ${bullet.trim()}`);
        }
        lines.push("");
      }
    }

    if (section === "certifications" && doc.certifications && doc.certifications.length > 0) {
      lines.push("CERTIFICATIONS");
      lines.push("--------------");
      for (const cert of doc.certifications) {
        const dateStr = cert.date ? ` (${cert.date.slice(0, 7)})` : "";
        const issuerStr = cert.issuer ? ` - ${cert.issuer}` : "";
        lines.push(`${cert.name}${issuerStr}${dateStr}`);
      }
      lines.push("");
    }

    if (section === "awards" && doc.awards && doc.awards.length > 0) {
      lines.push("HONORS & AWARDS");
      lines.push("---------------");
      for (const award of doc.awards) {
        const dateStr = award.date ? ` (${award.date.slice(0, 7)})` : "";
        const issuerStr = award.issuer ? ` - ${award.issuer}` : "";
        lines.push(`${award.title}${issuerStr}${dateStr}`);
      }
      lines.push("");
    }

    if (section === "volunteering" && doc.volunteering && doc.volunteering.length > 0) {
      lines.push("VOLUNTEERING & COMMUNITY");
      lines.push("------------------------");
      for (const vol of doc.volunteering) {
        const dateRange = formatDateRange(vol.startDate, vol.endDate, vol.current);
        lines.push(`${vol.role} - ${vol.organization}`);
        if (dateRange) lines.push(dateRange);
        for (const bullet of vol.bullets || []) {
          if (bullet.trim()) lines.push(`* ${bullet.trim()}`);
        }
        lines.push("");
      }
    }

    if (section === "publications" && doc.publications && doc.publications.length > 0) {
      lines.push("PUBLICATIONS");
      lines.push("------------");
      for (const pub of doc.publications) {
        const venueStr = pub.venue ? ` - ${pub.venue}` : "";
        const dateStr = pub.date ? ` (${pub.date.slice(0, 7)})` : "";
        lines.push(`${pub.title}${venueStr}${dateStr}`);
        if (pub.authors) lines.push(`Authors: ${pub.authors}`);
        if (pub.description) lines.push(pub.description);
        lines.push("");
      }
    }

    const custom = doc.customSections?.find((c) => c.id === section);
    if (custom && custom.items && custom.items.length > 0) {
      lines.push(custom.title.toUpperCase());
      lines.push("-".repeat(Math.max(3, custom.title.length)));
      for (const item of custom.items) {
        const subStr = item.subtitle ? ` - ${item.subtitle}` : "";
        const dateStr = item.date ? ` (${item.date.slice(0, 7)})` : "";
        lines.push(`${item.title}${subStr}${dateStr}`);
        if (item.description) lines.push(item.description);
        for (const bullet of item.bullets || []) {
          if (bullet.trim()) lines.push(`* ${bullet.trim()}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n").trim() + "\n";
}
