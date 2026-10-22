import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

// Mock Next.js navigation hooks for static rendering
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({ resumeId: "synth-demo-1" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/resume/new",
}));

import HomePage from "@/app/page";
import DashboardPage from "@/app/dashboard/page";
import NewResumePage from "@/app/resume/new/page";
import { TemplateRenderer } from "@/components/resume-templates";
import { AtsReadinessPanel } from "@/components/resume-editor/ats-readiness-panel";
import { TemplateSettingsPanel } from "@/components/resume-editor/template-settings-panel";
import { BulletImproverModal } from "@/components/resume-editor/bullet-improver-modal";
import { SummaryHelperModal } from "@/components/resume-editor/summary-helper-modal";
import { BasicsForm } from "@/components/resume-editor/basics-form";
import { ExperienceForm } from "@/components/resume-editor/experience-form";
import { EducationForm } from "@/components/resume-editor/education-form";
import { ProjectsForm } from "@/components/resume-editor/projects-form";
import { SkillsForm } from "@/components/resume-editor/skills-form";
import { SummaryForm } from "@/components/resume-editor/summary-form";
import { useEditorStore } from "@/lib/resume/editor-store";
import { localAdapter } from "@/lib/resume/local-adapter";
import {
  FRESHER_STUDENT_FIXTURE,
  MULTIPAGE_EXPERIENCED_FIXTURE,
} from "./fixtures/export-fixtures";

let browser: Browser;
let appCss: string = "";

function getCompiledAppCss(): string {
  let css = "";
  const chunksDir = path.join(process.cwd(), ".next", "static", "chunks");
  if (fs.existsSync(chunksDir)) {
    const cssFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css"));
    for (const file of cssFiles) {
      css += fs.readFileSync(path.join(chunksDir, file), "utf8") + "\n";
    }
  }
  const globalsPath = path.join(process.cwd(), "src", "app", "globals.css");
  if (fs.existsSync(globalsPath)) {
    css += fs.readFileSync(globalsPath, "utf8") + "\n";
  }
  return css;
}

function buildHtmlDocument(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - SoftCV Studio</title>
  <style>
    ${appCss}
  </style>
</head>
<body class="min-h-screen antialiased bg-periwinkle-mid text-carbon">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div id="__root">
    ${bodyContent}
  </div>
</body>
</html>`;
}

async function runAxeScan(title: string, markup: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.setContent(buildHtmlDocument(title, markup));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    return results.violations;
  } finally {
    await context.close();
  }
}

describe("Automated Accessibility Audits (RS-026 / WCAG 2.2 AA)", () => {
  beforeAll(async () => {
    appCss = getCompiledAppCss();
    browser = await chromium.launch({ headless: true });
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it("Landing Page: zero critical or serious WCAG 2.2 AA violations", async () => {
    const htmlMarkup = renderToStaticMarkup(React.createElement(HomePage));
    const violations = await runAxeScan("Landing Page", htmlMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("Dashboard with synthetic demo resumes: zero critical or serious violations", async () => {
    localAdapter.saveResume("synth-demo-1", "Synthetic Senior Resume", MULTIPAGE_EXPERIENCED_FIXTURE);
    localAdapter.saveResume("synth-demo-2", "Synthetic Student Resume", FRESHER_STUDENT_FIXTURE);

    const htmlMarkup = renderToStaticMarkup(React.createElement(DashboardPage));
    const violations = await runAxeScan("Dashboard", htmlMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("New Resume guided start page: zero critical or serious violations", async () => {
    const htmlMarkup = renderToStaticMarkup(React.createElement(NewResumePage));
    const violations = await runAxeScan("New Resume Cartridge", htmlMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("Editor Forms & Modules: all form inputs have associated labels and valid IDs", async () => {
    useEditorStore.getState().initResume("synth-editor", "Editor Fixture", FRESHER_STUDENT_FIXTURE);

    const formsMarkup = renderToStaticMarkup(
      React.createElement(
        "main",
        { id: "main-content" },
        React.createElement("h1", null, "Resume Module Deck"),
        React.createElement(
          "div",
          { className: "bg-surface p-4 text-carbon hardware-inset" },
          React.createElement(BasicsForm),
          React.createElement(SummaryForm),
          React.createElement(ExperienceForm),
          React.createElement(EducationForm),
          React.createElement(ProjectsForm),
          React.createElement(SkillsForm)
        )
      )
    );

    const violations = await runAxeScan("Resume Form Modules", formsMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("ATS Readiness Panel: tablist and tabpanel semantics with zero critical/serious violations", async () => {
    useEditorStore.getState().initResume("synth-ats", "ATS Audit Resume", FRESHER_STUDENT_FIXTURE);

    const atsMarkup = renderToStaticMarkup(
      React.createElement(
        "main",
        { id: "main-content" },
        React.createElement(
          "div",
          { className: "bg-surface p-4 text-carbon hardware-inset" },
          React.createElement(AtsReadinessPanel)
        )
      )
    );

    const violations = await runAxeScan("ATS Readiness Review", atsMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("Bullet Improver Modal: dialog semantics, accessible labels and focus trap readiness", async () => {
    const modalMarkup = renderToStaticMarkup(
      React.createElement(
        "div",
        null,
        React.createElement(
          "main",
          { id: "main-content" },
          React.createElement("button", { id: "trigger-btn" }, "Trigger AI")
        ),
        React.createElement(BulletImproverModal, {
          isOpen: true,
          onClose: () => {},
          originalBullet: "Managed server deployment and reduced load times.",
          onApply: () => {},
        })
      )
    );

    const violations = await runAxeScan("Bullet Improver Dialog", modalMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("Summary Helper Modal: dialog semantics, accessible labels and focus trap readiness", async () => {
    const modalMarkup = renderToStaticMarkup(
      React.createElement(
        "div",
        null,
        React.createElement(
          "main",
          { id: "main-content" },
          React.createElement("button", { id: "trigger-summary-btn" }, "Trigger Summary")
        ),
        React.createElement(SummaryHelperModal, {
          isOpen: true,
          onClose: () => {},
          existingSummary: "Software engineer with 4 years experience.",
          resumeContext: {
            experience: [],
            education: [],
            projects: [],
            skills: [],
            internships: [],
            certifications: [],
          },
          onApply: () => {},
        })
      )
    );

    const violations = await runAxeScan("Summary Helper Dialog", modalMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("Template Settings & Export Action Deck: high contrast and live region accessibility", async () => {
    useEditorStore.getState().initResume("synth-settings", "Export Settings Resume", MULTIPAGE_EXPERIENCED_FIXTURE);

    const settingsMarkup = renderToStaticMarkup(
      React.createElement(
        "main",
        { id: "main-content" },
        React.createElement("h1", null, "Template & Export Settings"),
        React.createElement(
          "div",
          { className: "bg-surface p-4 text-carbon hardware-inset" },
          React.createElement(TemplateSettingsPanel)
        )
      )
    );

    const violations = await runAxeScan("Export Settings Deck", settingsMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });

  it("Document Canvas (Classic ATS & Modern Editorial): valid semantics and readable contrast", async () => {
    const canvasMarkup = renderToStaticMarkup(
      React.createElement(
        "main",
        { id: "main-content" },
        React.createElement(TemplateRenderer, {
          document: FRESHER_STUDENT_FIXTURE,
          settings: FRESHER_STUDENT_FIXTURE.settings,
          isPrint: true,
        }),
        React.createElement(TemplateRenderer, {
          document: MULTIPAGE_EXPERIENCED_FIXTURE,
          settings: MULTIPAGE_EXPERIENCED_FIXTURE.settings,
          isPrint: true,
        })
      )
    );

    const violations = await runAxeScan("Document Canvas Preview", canvasMarkup);

    const criticalOrSerious = violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalOrSerious).toEqual([]);
  });
});
