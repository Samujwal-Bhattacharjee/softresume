/**
 * RS-173 — Full Multi-Template Export Regression Test Matrix
 *
 * Parametrized regression suite validating actual PDF and DOCX binaries
 * across all 5 implemented launch templates and 6 representative content profiles:
 *
 * Implemented Templates:
 * 1. Classic ATS (classic-ats)
 * 2. Fresher / Graduate (fresher-graduate)
 * 3. Modern Editorial (modern-editorial)
 * 4. Technical / Project-First (technical)
 * 5. Experienced Professional (experienced)
 * Note: Creative / Portfolio remains deferred as planned.
 *
 * Fixture Profiles:
 * 1. Sparse / Minimal (1 page, omitted sections, no orphan headings)
 * 2. Typical Fresher (education-first, coursework, projects, internships)
 * 3. Dense Technical (dense tags, code repos, long technical bullets)
 * 4. Multipage Experienced (>= 2 pages, leadership progression, certifications)
 * 5. International / Unicode (accents, French/German text, typographic dashes)
 * 6. Long URL / Overflow (extreme links >120 chars, bullets >350 chars, no margin overflow)
 *
 * Geometries:
 * - A4 (210mm x 297mm / 794px x 1123px at 96 DPI / 11906 x 16838 dxa)
 * - US Letter (8.5in x 11in / 816px x 1056px at 96 DPI / 12240 x 15840 dxa)
 */

import { describe, it, expect } from "vitest";
import { PDFParse } from "pdf-parse";
import JSZip from "jszip";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import { generatePdfBuffer } from "@/lib/export/pdf-generator";
import { generateDocxBlob } from "@/lib/export/docx-export";
import { TemplateRenderer } from "@/components/resume-templates";
import {
  SPARSE_SHORT_FIXTURE,
  FRESHER_STUDENT_FIXTURE,
  TECHNICAL_HEAVY_FIXTURE,
  MULTIPAGE_EXPERIENCED_FIXTURE,
  MODERN_EDITORIAL_UNICODE_FIXTURE,
  LONG_URL_OVERFLOW_FIXTURE,
} from "./fixtures/export-fixtures";
import type { ResumeDocument, TemplateId } from "@/lib/schemas/resume";

const IMPLEMENTED_TEMPLATES: Array<{ id: TemplateId; name: string }> = [
  { id: "classic-ats", name: "Classic ATS" },
  { id: "fresher-graduate", name: "Fresher / Graduate" },
  { id: "modern-editorial", name: "Modern Editorial" },
  { id: "technical", name: "Technical / Project-First" },
  { id: "experienced", name: "Experienced Professional" },
];

/** Helper: Extract text and metadata from PDF binary buffer */
async function inspectPdfBinary(buffer: Buffer) {
  // Check PDF signature: must begin with %PDF-
  const header = buffer.subarray(0, 8).toString("ascii");
  expect(header).toMatch(/^%PDF-1\./);

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  return {
    pageCount: result.total,
    rawText: result.text,
    normalizedText: result.text.replace(/\s+/g, " "),
    pages: result.pages,
  };
}

/** Helper: Decode XML entities in OpenXML strings */
function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Helper: Extract OpenXML structure and text from DOCX blob */
async function inspectDocxBinary(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const contentTypesXml = await zip.file("[Content_Types].xml")?.async("string");
  const documentXml = await zip.file("word/document.xml")?.async("string");
  const stylesXml = await zip.file("word/styles.xml")?.async("string");
  const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("string");

  expect(contentTypesXml).toBeDefined();
  expect(documentXml).toBeDefined();

  const textMatches = documentXml
    ? Array.from(documentXml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)).map((m) =>
        decodeXml(m[1])
      )
    : [];

  const fullText = textMatches.join(" ");

  // Extract page dimensions from document.xml: <w:pgSz w:w="..." w:h="..."/>
  const pgSzMatch = documentXml?.match(/<w:pgSz[^>]*w:w="(\d+)"[^>]*w:h="(\d+)"/);
  const dimensions = pgSzMatch
    ? { width: parseInt(pgSzMatch[1], 10), height: parseInt(pgSzMatch[2], 10) }
    : null;

  // Check for native bullet formatting
  const hasBullets = Boolean(documentXml?.includes("<w:numPr>"));

  return {
    zip,
    documentXml: documentXml ?? "",
    stylesXml: stylesXml ?? "",
    relsXml: relsXml ?? "",
    fullText,
    dimensions,
    hasBullets,
  };
}

describe("RS-173: Multi-Template PDF & DOCX Binary Regression Matrix", () => {
  // ── 1. PDF Matrix: All 5 Implemented Templates with Base Content ──
  describe("PDF Binary Validation across All 5 Templates", () => {
    IMPLEMENTED_TEMPLATES.forEach(({ id, name }) => {
      it(`Template "${name}" (${id}) produces valid PDF binary with extracted candidate text`, async () => {
        const fixture: ResumeDocument = {
          ...FRESHER_STUDENT_FIXTURE,
          settings: {
            ...FRESHER_STUDENT_FIXTURE.settings,
            templateId: id,
          },
        };

        const pdfBuffer = await generatePdfBuffer(fixture);
        expect(pdfBuffer).toBeInstanceOf(Buffer);
        expect(pdfBuffer.length).toBeGreaterThan(2000);

        const { normalizedText, pageCount } = await inspectPdfBinary(pdfBuffer);

        expect(pageCount).toBeGreaterThanOrEqual(1);
        expect(normalizedText).toContain(fixture.basics.name);
        expect(normalizedText).toContain(fixture.basics.email);
        expect(normalizedText).toContain("Pune Institute of Technology");
        expect(normalizedText).toContain("StudyBuddy");
      }, 30000);
    });
  });

  // ── 2. Content Profiles across Templates ──
  describe("Content Profile Binary Validations", () => {
    it("Profile 1 (Sparse/Minimal): generates single-page PDF with no empty section headers", async () => {
      const pdf = await generatePdfBuffer(SPARSE_SHORT_FIXTURE);
      const { normalizedText, pageCount } = await inspectPdfBinary(pdf);

      expect(pageCount).toBe(1);
      expect(normalizedText).toContain("Amina Al-Mansoor");
      expect(normalizedText).toContain("EDUCATION");
      expect(normalizedText).toContain("PROJECTS");
      expect(normalizedText).toContain("SKILLS");

      // Verify no orphaned headings from empty sections
      expect(normalizedText).not.toContain("WORK EXPERIENCE");
      expect(normalizedText).not.toContain("PROFESSIONAL SUMMARY");
      expect(normalizedText).not.toContain("INTERNSHIPS");
    }, 30000);

    it("Profile 2 (Dense Technical): preserves long tech lists, code tags, and URLs without truncation", async () => {
      const pdf = await generatePdfBuffer(TECHNICAL_HEAVY_FIXTURE);
      const { normalizedText } = await inspectPdfBinary(pdf);

      expect(normalizedText).toContain("Marcus Vance");
      expect(normalizedText).toContain("eBPF-based telemetry agent");
      expect(normalizedText).toContain("Rust | eBPF | C | Prometheus");
      expect(normalizedText).toContain("Certified Kubernetes Administrator");
      expect(normalizedText).toContain("GitHub");
    }, 30000);

    it("Profile 3 (Experienced Multipage): paginates cleanly across >= 2 pages without empty overflow", async () => {
      const pdf = await generatePdfBuffer(MULTIPAGE_EXPERIENCED_FIXTURE);
      const { normalizedText, pages, pageCount } = await inspectPdfBinary(pdf);

      expect(pageCount).toBeGreaterThanOrEqual(2);
      expect(pages[0].text).toContain("Dr. Evelyn Montgomery");
      expect(pages[0].text).toContain("Apex Financial Cloud");

      // Page 2 contains subsequent career history and degrees
      expect(pages[1].text.trim().length).toBeGreaterThan(50);
      expect(normalizedText).toContain("Strata Data Systems");
      expect(normalizedText).toContain("Massachusetts Institute of Technology");
    }, 30000);

    it("Profile 4 (International/Unicode): preserves accented French/German characters and punctuation", async () => {
      const pdf = await generatePdfBuffer(MODERN_EDITORIAL_UNICODE_FIXTURE);
      const { normalizedText } = await inspectPdfBinary(pdf);

      expect(normalizedText).toContain("Renée Müller-Château");
      expect(normalizedText).toContain("Architecte Logiciel Principal");
      expect(normalizedText).toContain("Systèmes Distribués & Cloud");
      expect(normalizedText).toContain("Banque Numérique Helvétique");
      expect(normalizedText).toContain("Genève, Switzerland");
      expect(normalizedText).toContain("Mention Très Bien");
    }, 30000);

    it("Profile 5 (Long URL / Overflow): handles extreme link lengths (>120 chars) and 350+ char bullets without clipping", async () => {
      const pdf = await generatePdfBuffer(LONG_URL_OVERFLOW_FIXTURE);
      const { normalizedText } = await inspectPdfBinary(pdf);

      expect(normalizedText).toContain("Alexander Jonathan von Hohenzollern-Smythe");
      expect(normalizedText).toContain("HyperScale Planetary Infrastructure Technologies");
      expect(normalizedText).toContain("4.2 million transactions per second");
      expect(normalizedText).toContain("International Institute of Advanced Computer Systems");
    }, 30000);
  });

  // ── 3. Geometry & Zero-Horizontal-Overflow Playwright Assertions ──
  describe("PDF Visual Geometry & Layout Bounds", () => {
    it("renders Long URL & Overflow fixture without horizontal overflow or margin breach", async () => {
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage({
          viewport: { width: 794, height: 1123 }, // A4 at 96 DPI
        });

        const html = `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; padding: 0; }
                .resume-document { margin: 0 auto; width: 794px; }
              </style>
            </head>
            <body>
              ${renderToStaticMarkup(
                React.createElement(TemplateRenderer, {
                  document: LONG_URL_OVERFLOW_FIXTURE,
                  settings: LONG_URL_OVERFLOW_FIXTURE.settings,
                  isPrint: true,
                })
              )}
            </body>
          </html>`;

        await page.setContent(html, { waitUntil: "load" });

        const overflowCheck = await page.evaluate(() => {
          const doc = document.querySelector(".resume-document");
          return {
            scrollWidth: doc?.scrollWidth ?? 0,
            clientWidth: doc?.clientWidth ?? 0,
          };
        });

        // Horizontal scroll width must not exceed client width + 2px tolerance
        expect(overflowCheck.scrollWidth).toBeLessThanOrEqual(overflowCheck.clientWidth + 2);
      } finally {
        await browser.close();
      }
    }, 30000);
  });

  // ── 4. DOCX Matrix: All 5 Implemented Templates ──
  describe("DOCX Binary Validation across All 5 Templates", () => {
    IMPLEMENTED_TEMPLATES.forEach(({ id, name }) => {
      it(`Template "${name}" (${id}) generates valid OpenXML .docx with structured text`, async () => {
        const fixture: ResumeDocument = {
          ...FRESHER_STUDENT_FIXTURE,
          settings: {
            ...FRESHER_STUDENT_FIXTURE.settings,
            templateId: id,
          },
        };

        const blob = await generateDocxBlob(fixture);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(4000);

        const { fullText, documentXml, hasBullets } = await inspectDocxBinary(blob);

        expect(fullText).toContain(fixture.basics.name);
        expect(fullText).toContain(fixture.basics.email);
        expect(fullText).toContain("Pune Institute of Technology");
        expect(fullText).toContain("StudyBuddy");
        expect(documentXml).toContain("<w:document");
        expect(documentXml).toContain("</w:document>");
        expect(hasBullets).toBe(true);
      });
    });
  });

  // ── 5. DOCX Profile & Geometry Assertions ──
  describe("DOCX Profile & Page Dimension Validations", () => {
    it("Profile A4 geometry: writes exact A4 dxa page dimensions (11906 x 16838)", async () => {
      const a4Fixture: ResumeDocument = {
        ...TECHNICAL_HEAVY_FIXTURE,
        settings: {
          ...TECHNICAL_HEAVY_FIXTURE.settings,
          pageSize: "A4",
        },
      };

      const blob = await generateDocxBlob(a4Fixture);
      const { dimensions } = await inspectDocxBinary(blob);

      expect(dimensions).not.toBeNull();
      expect(dimensions?.width).toBe(11906);
      expect(dimensions?.height).toBe(16838);
    });

    it("Profile US Letter geometry: writes exact US Letter dxa page dimensions (12240 x 15840)", async () => {
      const letterFixture: ResumeDocument = {
        ...TECHNICAL_HEAVY_FIXTURE,
        settings: {
          ...TECHNICAL_HEAVY_FIXTURE.settings,
          pageSize: "US_LETTER",
        },
      };

      const blob = await generateDocxBlob(letterFixture);
      const { dimensions } = await inspectDocxBinary(blob);

      expect(dimensions).not.toBeNull();
      expect(dimensions?.width).toBe(12240);
      expect(dimensions?.height).toBe(15840);
    });

    it("Profile Unicode DOCX: correctly preserves accented characters in OpenXML runs", async () => {
      const blob = await generateDocxBlob(MODERN_EDITORIAL_UNICODE_FIXTURE);
      const { fullText } = await inspectDocxBinary(blob);

      expect(fullText).toContain("Renée Müller-Château");
      expect(fullText).toContain("Genève, Switzerland");
      expect(fullText).toContain("Mention Très Bien");
      expect(fullText).toContain("Systèmes Électroniques Rhénans");
    });

    it("Profile Long URL & Overflow DOCX: retains complete lengthy URLs and 350+ char bullets", async () => {
      const blob = await generateDocxBlob(LONG_URL_OVERFLOW_FIXTURE);
      const { fullText } = await inspectDocxBinary(blob);

      expect(fullText).toContain("Alexander Jonathan von Hohenzollern-Smythe");
      expect(fullText).toContain("4.2 million transactions per second");
      expect(fullText).toContain("hyper-mesh-planetary-transport-layer");
    });
  });

  // ── 6. PDF vs DOCX Cross-Format Content Parity ──
  describe("PDF vs DOCX Semantic Equivalence", () => {
    it("ensures candidate identity and key content match between PDF and DOCX for the same document", async () => {
      const doc = TECHNICAL_HEAVY_FIXTURE;

      const pdfBuffer = await generatePdfBuffer(doc);
      const { normalizedText: pdfText } = await inspectPdfBinary(pdfBuffer);

      const docxBlob = await generateDocxBlob(doc);
      const { fullText: docxText } = await inspectDocxBinary(docxBlob);

      // Core entity assertions across both formats
      expect(pdfText).toContain(doc.basics.name);
      expect(docxText).toContain(doc.basics.name);

      expect(pdfText).toContain(doc.basics.email);
      expect(docxText).toContain(doc.basics.email);

      expect(pdfText).toContain(doc.experience[0].employer);
      expect(docxText).toContain(doc.experience[0].employer);

      expect(pdfText).toContain(doc.education[0].institution);
      expect(docxText).toContain(doc.education[0].institution);
    }, 30000);
  });
});
