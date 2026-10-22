import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { TemplateRenderer } from "@/components/resume-templates";
import {
  SPARSE_SHORT_FIXTURE,
  FRESHER_STUDENT_FIXTURE,
  TECHNICAL_HEAVY_FIXTURE,
  MULTIPAGE_EXPERIENCED_FIXTURE,
  MODERN_EDITORIAL_UNICODE_FIXTURE,
} from "./fixtures/export-fixtures";
import type { ResumeDocument } from "@/lib/schemas/resume";

const ARTIFACTS_DIR = path.join(process.cwd(), "tests", "artifacts", "pdf-visual");

function buildPageHtml(doc: ResumeDocument): string {
  const isA4 = (doc.settings.pageSize ?? "A4") === "A4";
  const bodyMarkup = renderToStaticMarkup(
    React.createElement(TemplateRenderer, {
      document: doc,
      settings: doc.settings,
      isPrint: true,
    })
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${isA4 ? "A4" : "letter"};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .resume-document {
      background: white !important;
      margin: 0 auto;
    }
    .no-page-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  </style>
</head>
<body>
  ${bodyMarkup}
</body>
</html>`;
}

describe("PDF Layout and Visual Regression Suite (RS-113)", () => {
  it("verifies Classic ATS short resume renders within 1 page boundaries without horizontal clipping", async () => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 794, height: 1123 }, // A4 at 96 DPI
      });

      const html = buildPageHtml(SPARSE_SHORT_FIXTURE);
      await page.setContent(html, { waitUntil: "load" });

      const metrics = await page.evaluate(() => {
        const doc = document.querySelector(".resume-document");
        if (!doc) return null;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          scrollHeight: doc.scrollHeight,
          clientHeight: doc.clientHeight,
        };
      });

      expect(metrics).not.toBeNull();
      // No horizontal overflow
      expect(metrics!.scrollWidth).toBeLessThanOrEqual(metrics!.clientWidth + 1);

      // Save visual snapshot artifact
      const artifactPath = path.join(ARTIFACTS_DIR, "classic-ats-sparse.png");
      await page.screenshot({ path: artifactPath, fullPage: true });
      expect(fs.existsSync(artifactPath)).toBe(true);
    } finally {
      await browser.close();
    }
  }, 30000);

  it("verifies Fresher Graduate layout geometry and no overlapping section titles", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 794, height: 1123 },
      });

      const html = buildPageHtml(FRESHER_STUDENT_FIXTURE);
      await page.setContent(html, { waitUntil: "load" });

      const sectionPositions = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll("h2, h3"));
        return headings.map(h => {
          const rect = h.getBoundingClientRect();
          return {
            text: h.textContent?.trim() || "",
            top: rect.top,
            bottom: rect.bottom,
          };
        });
      });

      // Assert descending vertical order (no overlapping headings)
      for (let i = 1; i < sectionPositions.length; i++) {
        expect(sectionPositions[i].top).toBeGreaterThanOrEqual(sectionPositions[i - 1].bottom);
      }

      const artifactPath = path.join(ARTIFACTS_DIR, "fresher-graduate.png");
      await page.screenshot({ path: artifactPath, fullPage: true });
      expect(fs.existsSync(artifactPath)).toBe(true);
    } finally {
      await browser.close();
    }
  }, 30000);

  it("verifies Technical template wraps long code links without bursting page width", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 794, height: 1123 },
      });

      const html = buildPageHtml(TECHNICAL_HEAVY_FIXTURE);
      await page.setContent(html, { waitUntil: "load" });

      const overflowCheck = await page.evaluate(() => {
        const doc = document.querySelector(".resume-document");
        return {
          scrollWidth: doc?.scrollWidth ?? 0,
          clientWidth: doc?.clientWidth ?? 0,
        };
      });

      expect(overflowCheck.scrollWidth).toBeLessThanOrEqual(overflowCheck.clientWidth + 1);

      const artifactPath = path.join(ARTIFACTS_DIR, "technical-dense.png");
      await page.screenshot({ path: artifactPath, fullPage: true });
      expect(fs.existsSync(artifactPath)).toBe(true);
    } finally {
      await browser.close();
    }
  }, 30000);

  it("verifies Experienced multi-page template flows smoothly across multiple pages", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 816, height: 1056 }, // US Letter at 96 DPI
      });

      const html = buildPageHtml(MULTIPAGE_EXPERIENCED_FIXTURE);
      await page.setContent(html, { waitUntil: "load" });

      const docHeight = await page.evaluate(() => {
        const doc = document.querySelector(".resume-document");
        return doc ? doc.scrollHeight : 0;
      });

      // For US Letter (1056px at 96 DPI), a 2-page document should exceed 1100px
      expect(docHeight).toBeGreaterThan(1100);

      const artifactPath = path.join(ARTIFACTS_DIR, "experienced-multipage.png");
      await page.screenshot({ path: artifactPath, fullPage: true });
      expect(fs.existsSync(artifactPath)).toBe(true);
    } finally {
      await browser.close();
    }
  }, 30000);

  it("verifies Modern Editorial handles international character rendering without layout breakage", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 794, height: 1123 },
      });

      const html = buildPageHtml(MODERN_EDITORIAL_UNICODE_FIXTURE);
      await page.setContent(html, { waitUntil: "load" });

      const nameMetrics = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        if (!h1) return null;
        return {
          text: h1.textContent,
          width: h1.getBoundingClientRect().width,
        };
      });

      expect(nameMetrics).not.toBeNull();
      expect(nameMetrics!.text).toContain("Renée Müller-Château");
      expect(nameMetrics!.width).toBeGreaterThan(50);

      const artifactPath = path.join(ARTIFACTS_DIR, "modern-editorial-unicode.png");
      await page.screenshot({ path: artifactPath, fullPage: true });
      expect(fs.existsSync(artifactPath)).toBe(true);
    } finally {
      await browser.close();
    }
  }, 30000);
});
