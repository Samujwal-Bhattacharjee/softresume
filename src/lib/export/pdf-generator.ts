/**
 * RS-111 — Reliable PDF Generation
 *
 * Generates vector PDF bytes from a ResumeDocument using server-side
 * React markup and headless Chromium via Playwright.
 * Preserves selectable text, reading order, and page dimensions.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server.edge";
import { chromium } from "@playwright/test";
import { TemplateRenderer } from "@/components/resume-templates";
import type { ResumeDocument, PresentationSettings } from "@/lib/schemas/resume";

export interface GeneratePdfOptions {
  overrideSettings?: Partial<PresentationSettings>;
}

export async function generatePdfBuffer(
  doc: ResumeDocument,
  options?: GeneratePdfOptions
): Promise<Buffer> {
  const settings: PresentationSettings = {
    ...doc.settings,
    ...options?.overrideSettings,
  };

  const isA4 = (settings.pageSize ?? "A4") === "A4";

  // Render static HTML from the template renderer
  const bodyMarkup = renderToStaticMarkup(
    React.createElement(TemplateRenderer, {
      document: doc,
      settings,
      isPrint: true,
    })
  );

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(doc.basics.name || "Resume")}</title>
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
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-page-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    .page-break-after {
      page-break-after: always !important;
      break-after: page !important;
    }
  </style>
</head>
<body>
  ${bodyMarkup}
</body>
</html>`;

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "load" });

    const pdfUint8 = await page.pdf({
      format: isA4 ? "A4" : "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    return Buffer.from(pdfUint8);
  } finally {
    await browser.close();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
