/**
 * RS-062 — DOCX Resume Exporter
 *
 * Generates an editable Microsoft Word (.docx) document from ResumeDocument.
 * Adheres to standard ATS formatting: standard heading styles, table-free
 * linear paragraphs, standard bullet points.
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
} from "docx";
import type { ResumeDocument } from "@/lib/schemas/resume";
import { formatDateRange } from "@/lib/utils";

export async function generateDocxBlob(doc: ResumeDocument): Promise<Blob> {
  const children: Paragraph[] = [];

  // Title / Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: doc.basics.name,
          bold: true,
          size: 32, // 16pt
        }),
      ],
    })
  );

  // Headline
  if (doc.basics.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: doc.basics.headline,
            italics: true,
            size: 22,
          }),
        ],
      })
    );
  }

  // Contact line
  const contactParts: string[] = [];
  if (doc.basics.email) contactParts.push(doc.basics.email);
  if (doc.basics.phone) contactParts.push(doc.basics.phone);
  if (doc.basics.location) contactParts.push(doc.basics.location);
  if (doc.basics.links && doc.basics.links.length > 0) {
    for (const link of doc.basics.links) {
      contactParts.push(`${link.label}: ${link.url}`);
    }
  }

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: 19,
            color: "555555",
          }),
        ],
      })
    );
  }

  // Helper for section headings
  const addSectionHeading = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            color: "222222",
          }),
        ],
      })
    );
  };

  // Professional Summary
  if (doc.summary && !doc.settings.hiddenSections.includes("summary")) {
    addSectionHeading("Professional Summary");
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: doc.summary,
            size: 20,
          }),
        ],
      })
    );
  }

  // Section order
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
      addSectionHeading("Work Experience");
      for (const exp of doc.experience) {
        const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current);
        const loc = exp.location ? ` — ${exp.location}` : "";
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: `${exp.role} | ${exp.employer}${loc}`,
                bold: true,
                size: 21,
              }),
              ...(dateRange
                ? [
                    new TextRun({
                      text: `  (${dateRange})`,
                      italics: true,
                      size: 19,
                      color: "555555",
                    }),
                  ]
                : []),
            ],
          })
        );

        for (const bullet of exp.bullets) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  size: 20,
                }),
              ],
            })
          );
        }
      }
    }

    if (section === "education" && doc.education && doc.education.length > 0) {
      addSectionHeading("Education");
      for (const edu of doc.education) {
        const dateRange = formatDateRange(edu.startDate, edu.endDate);
        const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: `${degreeStr} — ${edu.institution}`,
                bold: true,
                size: 21,
              }),
              ...(dateRange
                ? [
                    new TextRun({
                      text: `  (${dateRange})`,
                      italics: true,
                      size: 19,
                      color: "555555",
                    }),
                  ]
                : []),
            ],
          })
        );
        if (edu.grade) {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `Grade / Score: ${edu.grade}`,
                  size: 19,
                }),
              ],
            })
          );
        }
        if (edu.coursework && edu.coursework.length > 0) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `Relevant Coursework: ${edu.coursework.join(", ")}`,
                  italics: true,
                  size: 19,
                  color: "444444",
                }),
              ],
            })
          );
        }
      }
    }

    if (section === "projects" && doc.projects && doc.projects.length > 0) {
      addSectionHeading("Projects");
      for (const proj of doc.projects) {
        const techStr = proj.technologies?.length
          ? ` [${proj.technologies.join(", ")}]`
          : "";
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: proj.name,
                bold: true,
                size: 21,
              }),
              new TextRun({
                text: techStr,
                italics: true,
                size: 19,
                color: "555555",
              }),
            ],
          })
        );

        for (const bullet of proj.bullets || []) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  size: 20,
                }),
              ],
            })
          );
        }
      }
    }

    if (section === "skills" && doc.skills && doc.skills.length > 0) {
      addSectionHeading("Skills");
      for (const group of doc.skills) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${group.category}: `,
                bold: true,
                size: 20,
              }),
              new TextRun({
                text: group.items.join(", "),
                size: 20,
              }),
            ],
          })
        );
      }
    }

    if (section === "internships" && doc.internships && doc.internships.length > 0) {
      addSectionHeading("Internships");
      for (const intern of doc.internships) {
        const dateRange = formatDateRange(intern.startDate, intern.endDate, intern.current);
        const loc = intern.location ? ` — ${intern.location}` : "";
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: `${intern.role} | ${intern.employer}${loc}`,
                bold: true,
                size: 21,
              }),
              ...(dateRange
                ? [
                    new TextRun({
                      text: `  (${dateRange})`,
                      italics: true,
                      size: 19,
                      color: "555555",
                    }),
                  ]
                : []),
            ],
          })
        );

        for (const bullet of intern.bullets) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  size: 20,
                }),
              ],
            })
          );
        }
      }
    }

    if (section === "certifications" && doc.certifications && doc.certifications.length > 0) {
      addSectionHeading("Certifications");
      for (const cert of doc.certifications) {
        const dateStr = cert.date ? ` (${cert.date.slice(0, 7)})` : "";
        const issuerStr = cert.issuer ? ` — ${cert.issuer}` : "";
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: cert.name, bold: true, size: 20 }),
              new TextRun({ text: `${issuerStr}${dateStr}`, size: 19, color: "555555" }),
            ],
          })
        );
      }
    }

    if (section === "awards" && doc.awards && doc.awards.length > 0) {
      addSectionHeading("Honors & Awards");
      for (const award of doc.awards) {
        const dateStr = award.date ? ` (${award.date.slice(0, 7)})` : "";
        const issuerStr = award.issuer ? ` — ${award.issuer}` : "";
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: award.title, bold: true, size: 20 }),
              new TextRun({ text: `${issuerStr}${dateStr}`, size: 19, color: "555555" }),
            ],
          })
        );
      }
    }

    if (section === "volunteering" && doc.volunteering && doc.volunteering.length > 0) {
      addSectionHeading("Volunteering & Community");
      for (const vol of doc.volunteering) {
        const dateRange = formatDateRange(vol.startDate, vol.endDate, vol.current);
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: `${vol.role} | ${vol.organization}`, bold: true, size: 20 }),
              ...(dateRange
                ? [new TextRun({ text: `  (${dateRange})`, italics: true, size: 19, color: "555555" })]
                : []),
            ],
          })
        );
        for (const bullet of vol.bullets || []) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [new TextRun({ text: bullet.trim(), size: 20 })],
            })
          );
        }
      }
    }

    if (section === "publications" && doc.publications && doc.publications.length > 0) {
      addSectionHeading("Publications");
      for (const pub of doc.publications) {
        const venueStr = pub.venue ? ` — ${pub.venue}` : "";
        const dateStr = pub.date ? ` (${pub.date.slice(0, 7)})` : "";
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: pub.title, bold: true, size: 20 }),
              new TextRun({ text: `${venueStr}${dateStr}`, size: 19, color: "555555" }),
            ],
          })
        );
        if (pub.description) {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [new TextRun({ text: pub.description, size: 19, color: "444444" })],
            })
          );
        }
      }
    }

    const custom = doc.customSections?.find((c) => c.id === section);
    if (custom && custom.items && custom.items.length > 0) {
      addSectionHeading(custom.title);
      for (const item of custom.items) {
        const subtitleStr = item.subtitle ? ` — ${item.subtitle}` : "";
        const dateStr = item.date ? ` (${item.date.slice(0, 7)})` : "";
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: item.title, bold: true, size: 20 }),
              new TextRun({ text: `${subtitleStr}${dateStr}`, size: 19, color: "555555" }),
            ],
          })
        );
        if (item.description) {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [new TextRun({ text: item.description, size: 19, color: "444444" })],
            })
          );
        }
        for (const bullet of item.bullets || []) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [new TextRun({ text: bullet.trim(), size: 20 })],
            })
          );
        }
      }
    }
  }

  const isA4 = (doc.settings?.pageSize ?? "A4") === "A4";
  const marginSize = doc.settings?.marginSize ?? "normal";
  const marginDxa = marginSize === "compact" ? 720 : marginSize === "spacious" ? 1440 : 1080;

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: isA4 ? 11906 : 12240,
              height: isA4 ? 16838 : 15840,
            },
            margin: {
              top: marginDxa,
              bottom: marginDxa,
              left: marginDxa,
              right: marginDxa,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(document);
}
