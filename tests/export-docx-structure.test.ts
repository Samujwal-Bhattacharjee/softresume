import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { generateDocxBlob } from "@/lib/export/docx-export";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";
import type { ResumeDocument } from "@/lib/schemas/resume";

function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Helper to inspect the XML structure of a generated DOCX blob.
 */
async function unpackDocx(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const contentTypesXml = await zip.file("[Content_Types].xml")?.async("string");
  const documentXml = await zip.file("word/document.xml")?.async("string");
  const stylesXml = await zip.file("word/styles.xml")?.async("string");
  const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("string");

  // Extract all text content from <w:t> tags in order and decode XML entities
  const textMatches = documentXml
    ? Array.from(documentXml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)).map(m => decodeXml(m[1]))
    : [];
  const fullText = textMatches.join(" ");

  // Extract paragraphs
  const paragraphMatches = documentXml
    ? Array.from(documentXml.matchAll(/<w:p\b[^>]*>(.*?)<\/w:p>/g)).map(m => m[1])
    : [];

  return {
    zip,
    contentTypesXml,
    documentXml,
    stylesXml,
    relsXml,
    textMatches,
    fullText,
    paragraphMatches,
  };
}

describe("DOCX Structural and Content Order Validation (RS-120 / RS-122)", () => {
  it("generates a valid DOCX ZIP package with standard Word XML files", async () => {
    const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
    const { contentTypesXml, documentXml, stylesXml, relsXml } = await unpackDocx(blob);

    expect(contentTypesXml).toBeDefined();
    expect(contentTypesXml).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml");

    expect(documentXml).toBeDefined();
    expect(documentXml).toContain("<w:document");
    expect(documentXml).toContain("</w:document>");

    expect(stylesXml).toBeDefined();
    expect(relsXml).toBeDefined();
  });

  it("ensures candidate name and headline appear at the very top", async () => {
    const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
    const { textMatches } = await unpackDocx(blob);

    expect(textMatches.slice(0, 5).join(" ")).toContain("Rohan Kapoor");
    expect(textMatches.slice(0, 5).join(" ")).toContain("Senior Software Engineer");
  });

  it("extracts contact information including email, phone, location, and links", async () => {
    const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
    const { fullText } = await unpackDocx(blob);

    expect(fullText).toContain("r.kapoor@example.com");
    expect(fullText).toContain("+44 7700 900000");
    expect(fullText).toContain("London, UK");
    expect(fullText).toContain("github.com/example-rohan");
  });

  it("verifies section headings appear in the configured reading order for Experienced", async () => {
    const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
    const { fullText } = await unpackDocx(blob);

    const summaryPos = fullText.indexOf("PROFESSIONAL SUMMARY");
    const expPos = fullText.indexOf("WORK EXPERIENCE");
    const skillsPos = fullText.indexOf("SKILLS");
    const projPos = fullText.indexOf("PROJECTS");
    const eduPos = fullText.indexOf("EDUCATION");

    expect(summaryPos).toBeGreaterThan(-1);
    expect(expPos).toBeGreaterThan(summaryPos);
    expect(skillsPos).toBeGreaterThan(expPos);
    expect(projPos).toBeGreaterThan(skillsPos);
    expect(eduPos).toBeGreaterThan(projPos);
  });

  it("verifies section headings appear in education-first order for Fresher", async () => {
    const blob = await generateDocxBlob(FRESHER_FIXTURE);
    const { fullText } = await unpackDocx(blob);

    const summaryPos = fullText.indexOf("PROFESSIONAL SUMMARY");
    const eduPos = fullText.indexOf("EDUCATION");
    const skillsPos = fullText.indexOf("SKILLS");
    const projPos = fullText.indexOf("PROJECTS");
    const internPos = fullText.indexOf("INTERNSHIPS");

    expect(summaryPos).toBeGreaterThan(-1);
    expect(eduPos).toBeGreaterThan(summaryPos);
    expect(skillsPos).toBeGreaterThan(eduPos);
    expect(projPos).toBeGreaterThan(skillsPos);
    expect(internPos).toBeGreaterThan(projPos);
  });

  it("represents bullet points with native bullet formatting without duplication", async () => {
    const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
    const { documentXml, fullText } = await unpackDocx(blob);

    // Document contains bullet numbering properties <w:numPr>
    expect(documentXml).toContain("<w:numPr>");

    // Check specific bullet text is present exactly once
    const bulletText = "Led design and delivery of a multi-tenant data ingestion pipeline processing 4 TB/day using Kafka and Flink.";
    expect(fullText).toContain(bulletText);

    const occurrences = (fullText.match(new RegExp(bulletText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
    expect(occurrences).toBe(1);
  });

  it("survives Unicode and international characters without corruption", async () => {
    const unicodeFixture: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      basics: {
        ...EXPERIENCED_FIXTURE.basics,
        name: "Renée Müller",
        headline: "Ingénieur Système — Cloud & DevOps",
        location: "Zürich, Switzerland",
      },
    };

    const blob = await generateDocxBlob(unicodeFixture);
    const { fullText } = await unpackDocx(blob);

    expect(fullText).toContain("Renée Müller");
    expect(fullText).toContain("Ingénieur Système — Cloud & DevOps");
    expect(fullText).toContain("Zürich, Switzerland");
  });

  it("omits empty optional sections cleanly without empty heading blocks", async () => {
    const sparseFixture: ResumeDocument = {
      ...FRESHER_FIXTURE,
      summary: "",
      experience: [],
      internships: [],
      awards: [],
      volunteering: [],
      certifications: [],
    };

    const blob = await generateDocxBlob(sparseFixture);
    const { fullText } = await unpackDocx(blob);

    expect(fullText).not.toContain("PROFESSIONAL SUMMARY");
    expect(fullText).not.toContain("WORK EXPERIENCE");
    expect(fullText).not.toContain("INTERNSHIPS");
    expect(fullText).toContain("EDUCATION");
    expect(fullText).toContain("PROJECTS");
    expect(fullText).toContain("SKILLS");
  });

  it("honors A4 and US Letter page size settings in Word XML properties", async () => {
    const a4Doc: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      settings: { ...EXPERIENCED_FIXTURE.settings, pageSize: "A4" },
    };
    const a4Blob = await generateDocxBlob(a4Doc);
    const a4Unpacked = await unpackDocx(a4Blob);
    expect(a4Unpacked.documentXml).toContain('w:w="11906"');
    expect(a4Unpacked.documentXml).toContain('w:h="16838"');

    const letterDoc: ResumeDocument = {
      ...EXPERIENCED_FIXTURE,
      settings: { ...EXPERIENCED_FIXTURE.settings, pageSize: "US_LETTER" },
    };
    const letterBlob = await generateDocxBlob(letterDoc);
    const letterUnpacked = await unpackDocx(letterBlob);
    expect(letterUnpacked.documentXml).toContain('w:w="12240"');
    expect(letterUnpacked.documentXml).toContain('w:h="15840"');
  });

  it("does not mutate the source resume document object during export", async () => {
    const clone = JSON.parse(JSON.stringify(EXPERIENCED_FIXTURE));
    await generateDocxBlob(EXPERIENCED_FIXTURE);

    expect(EXPERIENCED_FIXTURE).toEqual(clone);
  });
});
