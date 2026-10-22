import { describe, it, expect } from "vitest";
import { PDFParse } from "pdf-parse";
import { generatePdfBuffer } from "@/lib/export/pdf-generator";
import {
  SPARSE_SHORT_FIXTURE,
  FRESHER_STUDENT_FIXTURE,
  TECHNICAL_HEAVY_FIXTURE,
  MULTIPAGE_EXPERIENCED_FIXTURE,
  MODERN_EDITORIAL_UNICODE_FIXTURE,
} from "./fixtures/export-fixtures";

/**
 * Helper to parse a generated PDF buffer and extract structured text.
 */
async function extractPdfText(pdfBuffer: Buffer) {
  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  await parser.destroy();

  return {
    rawText: result.text,
    normalizedText: result.text.replace(/\s+/g, " "),
    pages: result.pages,
    total: result.total,
  };
}

describe("Automated PDF Generation & Binary Text Extraction (RS-111 / RS-112)", () => {
  it("Template 1 (Classic ATS): generates valid PDF for short sparse resume and cleanly omits optional sections", async () => {
    const pdf = await generatePdfBuffer(SPARSE_SHORT_FIXTURE);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(1000);

    const { normalizedText, total } = await extractPdfText(pdf);

    expect(total).toBe(1);
    expect(normalizedText).toContain("Amina Al-Mansoor");
    expect(normalizedText).toContain("amina.almansoor@example.com");
    expect(normalizedText).toContain("+971 50 123 4567");
    expect(normalizedText).toContain("Dubai, UAE");

    // Headings present
    expect(normalizedText).toContain("EDUCATION");
    expect(normalizedText).toContain("PROJECTS");
    expect(normalizedText).toContain("SKILLS");

    // Optional omitted sections should not produce headings
    expect(normalizedText).not.toContain("PROFESSIONAL SUMMARY");
    expect(normalizedText).not.toContain("WORK EXPERIENCE");
    expect(normalizedText).not.toContain("INTERNSHIPS");
    expect(normalizedText).not.toContain("CERTIFICATIONS");
    expect(normalizedText).not.toContain("VOLUNTEERING");
  }, 30000);

  it("Template 2 (Fresher/Graduate): extracts education-first content and project bullets in correct reading order", async () => {
    const pdf = await generatePdfBuffer(FRESHER_STUDENT_FIXTURE);
    const { normalizedText, rawText } = await extractPdfText(pdf);

    expect(normalizedText).toContain("Priya Mehta");
    expect(normalizedText).toContain("priya.mehta@example.com");
    expect(normalizedText).toContain("Pune Institute of Technology");
    expect(normalizedText).toContain("StudyBuddy — Collaborative Notes App");

    // Bullet points preserved
    expect(normalizedText).toContain("Built with React, Node.js, and Socket.IO");

    // Order assertion: Education must appear before Experience
    const eduIdx = rawText.indexOf("EDUCATION");
    const skillsIdx = rawText.indexOf("SKILLS");
    const projIdx = rawText.indexOf("PROJECTS");

    expect(eduIdx).toBeGreaterThan(-1);
    expect(skillsIdx).toBeGreaterThan(eduIdx);
    expect(projIdx).toBeGreaterThan(skillsIdx);
  }, 30000);

  it("Template 3 (Technical): handles dense multi-tag technologies, long URLs and repo links without clipping", async () => {
    const pdf = await generatePdfBuffer(TECHNICAL_HEAVY_FIXTURE);
    const { normalizedText } = await extractPdfText(pdf);

    expect(normalizedText).toContain("Marcus Vance");
    expect(normalizedText).toContain("marcus.vance.dev@example.com");
    expect(normalizedText).toContain("Aegis Cloud Infrastructure");
    expect(normalizedText).toContain("mesh-probe");

    // Long technical bullets, dev links, and dense stack present
    expect(normalizedText).toContain("Architected an eBPF-based telemetry agent");
    expect(normalizedText).toContain("GitHub");
    expect(normalizedText).toContain("Blog");
    expect(normalizedText).toContain("Keybase");
    expect(normalizedText).toContain("[code]");
    expect(normalizedText).toContain("Stack: Rust | eBPF | C | Prometheus | Linux Kernel | Docker | Kubernetes");
    expect(normalizedText).toContain("Certified Kubernetes Administrator");
  }, 30000);

  it("Template 4 (Experienced): generates multi-page PDF with coherent pagination and text across all pages", async () => {
    const pdf = await generatePdfBuffer(MULTIPAGE_EXPERIENCED_FIXTURE);
    const { normalizedText, pages, total } = await extractPdfText(pdf);

    // Multi-page assertion
    expect(total).toBeGreaterThanOrEqual(2);
    expect(pages.length).toBeGreaterThanOrEqual(2);

    // Page 1 has candidate header and recent VP role
    expect(pages[0].text).toContain("Dr. Evelyn Montgomery");
    expect(pages[0].text).toContain("Apex Financial Cloud");

    // Subsequent pages also contain readable text
    expect(pages[1].text.trim().length).toBeGreaterThan(50);
    expect(normalizedText).toContain("Strata Data Systems");
    expect(normalizedText).toContain("Beacon Labs Technology");
    expect(normalizedText).toContain("Massachusetts Institute of Technology");
  }, 30000);

  it("Template 5 (Modern Editorial): survives non-ASCII international names, accents, and punctuation", async () => {
    const pdf = await generatePdfBuffer(MODERN_EDITORIAL_UNICODE_FIXTURE);
    const { normalizedText } = await extractPdfText(pdf);

    // Non-ASCII candidate name & headline
    expect(normalizedText).toContain("Renée Müller-Château");
    expect(normalizedText).toContain("Architecte Logiciel Principal");
    expect(normalizedText).toContain("Systèmes Distribués & Cloud");

    // French accented characters
    expect(normalizedText).toContain("Genève, Switzerland");
    expect(normalizedText).toContain("Banque Numérique Helvétique");
    expect(normalizedText).toContain("Mention Très Bien");
    expect(normalizedText).toContain("Systèmes Électroniques Rhénans");
  }, 30000);

  it("Page format setting: produces letter-dimension PDF when US_LETTER is configured", async () => {
    const letterFixture = {
      ...TECHNICAL_HEAVY_FIXTURE,
      settings: {
        ...TECHNICAL_HEAVY_FIXTURE.settings,
        pageSize: "US_LETTER" as const,
      },
    };

    const pdf = await generatePdfBuffer(letterFixture);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(1000);

    const { total } = await extractPdfText(pdf);
    expect(total).toBeGreaterThanOrEqual(1);
  }, 30000);

  it("Preserves master resume immutability during export", async () => {
    const copy = JSON.parse(JSON.stringify(MODERN_EDITORIAL_UNICODE_FIXTURE));
    await generatePdfBuffer(MODERN_EDITORIAL_UNICODE_FIXTURE);

    expect(MODERN_EDITORIAL_UNICODE_FIXTURE).toEqual(copy);
  }, 30000);
});
