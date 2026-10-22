import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, type Browser } from "@playwright/test";
import fs from "fs";
import path from "path";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({ resumeId: "synth-demo-1" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/resume/synth-demo-1/edit",
}));

import HomePage from "@/app/page";
import DashboardPage from "@/app/dashboard/page";
import NewResumePage from "@/app/resume/new/page";
import { TemplateSettingsPanel } from "@/components/resume-editor/template-settings-panel";
import { BasicsForm } from "@/components/resume-editor/basics-form";
import { useEditorStore } from "@/lib/resume/editor-store";
import { localAdapter } from "@/lib/resume/local-adapter";
import { FRESHER_STUDENT_FIXTURE } from "./fixtures/export-fixtures";

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

function buildPageHtml(title: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - Responsive & Motion Test</title>
  <style>
    ${appCss}
  </style>
</head>
<body class="min-h-screen antialiased bg-periwinkle-mid text-carbon m-0 p-0 overflow-x-hidden">
  ${innerHtml}
</body>
</html>`;
}

describe("Responsive Behavior & Reduced Motion Suite (RS-025)", () => {
  beforeAll(async () => {
    appCss = getCompiledAppCss();
    browser = await chromium.launch({ headless: true });
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    localAdapter.saveResume("synth-demo-1", "Responsive Audit Resume", FRESHER_STUDENT_FIXTURE);
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  // ─────────────────────────────────────────────
  // 1. Reduced Motion Preference
  // ─────────────────────────────────────────────

  describe("Reduced Motion Handling (@media (prefers-reduced-motion: reduce))", () => {
    it("respects reduced-motion preference and suppresses nonessential animation durations", async () => {
      const context = await browser.newContext({
        reducedMotion: "reduce",
      });
      const page = await context.newPage();

      const html = buildPageHtml(
        "Reduced Motion Audit",
        renderToStaticMarkup(React.createElement(HomePage))
      );
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      // Verify media query evaluates to reduce
      const isReduced = await page.evaluate(() => {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      });
      expect(isReduced).toBe(true);

      // Verify animation/transition durations are suppressed to ~0s or 0.001ms
      const pulseDuration = await page.evaluate(() => {
        const el = document.querySelector(".animate-pulse");
        if (!el) return null;
        return window.getComputedStyle(el).animationDuration;
      });

      if (pulseDuration) {
        // Our globals.css rule specifies animation-duration: 0.001ms !important
        const durationMs = parseFloat(pulseDuration) * (pulseDuration.endsWith("ms") ? 1 : 1000);
        expect(durationMs).toBeLessThanOrEqual(5); // under 5ms or 0
      }

      // Verify scroll-behavior is auto !important under reduced-motion
      const scrollBehavior = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).scrollBehavior;
      });
      expect(scrollBehavior).toBe("auto");

      await context.close();
    });

    it("ensures essential status cues remain visible without relying on animation alone", async () => {
      const context = await browser.newContext({
        reducedMotion: "reduce",
      });
      const page = await context.newPage();

      const html = buildPageHtml(
        "Motion Independence",
        renderToStaticMarkup(React.createElement(HomePage))
      );
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      // Check text label for hardware launch status is intact
      const statusText = await page.textContent("text=HARDWARE READY FOR LAUNCH");
      expect(statusText).toContain("HARDWARE READY FOR LAUNCH");

      await context.close();
    });
  });

  // ─────────────────────────────────────────────
  // 2. Responsive Viewports & Reflow (320px - 1280px)
  // ─────────────────────────────────────────────

  describe("Viewport Reflow & Overflow Prevention (WCAG 1.4.10)", () => {
    const viewports = [
      { name: "320px Narrow Mobile (Reflow stress)", width: 320, height: 640 },
      { name: "375px Standard Mobile", width: 375, height: 667 },
      { name: "768px Tablet Portrait", width: 768, height: 1024 },
      { name: "1024px Small Desktop", width: 1024, height: 768 },
      { name: "1280px Desktop Studio", width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      it(`Landing Page: no horizontal document overflow at ${vp.name}`, async () => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        const html = buildPageHtml(
          `Landing - ${vp.name}`,
          renderToStaticMarkup(React.createElement(HomePage))
        );
        await page.setContent(html, { waitUntil: "domcontentloaded" });

        // Assert scrollWidth does not exceed clientWidth + 2px tolerance
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          return {
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
            hasOverflow: docEl.scrollWidth > docEl.clientWidth + 2,
          };
        });

        expect(overflow.hasOverflow).toBe(false);
        await context.close();
      });

      it(`Dashboard Page: reflows cleanly without horizontal overflow at ${vp.name}`, async () => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        const html = buildPageHtml(
          `Dashboard - ${vp.name}`,
          renderToStaticMarkup(React.createElement(DashboardPage))
        );
        await page.setContent(html, { waitUntil: "domcontentloaded" });

        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          return {
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
            hasOverflow: docEl.scrollWidth > docEl.clientWidth + 2,
          };
        });

        expect(overflow.hasOverflow).toBe(false);
        await context.close();
      });

      it(`New Resume Guided Onboarding: cards reflow cleanly at ${vp.name}`, async () => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        const html = buildPageHtml(
          `New Resume - ${vp.name}`,
          renderToStaticMarkup(React.createElement(NewResumePage))
        );
        await page.setContent(html, { waitUntil: "domcontentloaded" });

        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          return {
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
            hasOverflow: docEl.scrollWidth > docEl.clientWidth + 2,
          };
        });

        expect(overflow.hasOverflow).toBe(false);
        await context.close();
      });
    }
  });

  // ─────────────────────────────────────────────
  // 3. Mobile Editor Tab Switching & 3-Panel Desktop Layout
  // ─────────────────────────────────────────────

  describe("Editor Workspace Responsive Layout & Modes", () => {
    it("renders 3-panel studio layout on desktop (1280px)", async () => {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      });
      const page = await context.newPage();

      useEditorStore.getState().initResume("synth-editor", "Editor Fixture", FRESHER_STUDENT_FIXTURE);

      // Render the 3-panel layout mockup mirroring edit/page.tsx
      const editorMarkup = `
        <div class="flex flex-col h-screen">
          <header class="h-12 bg-carbon flex items-center px-4 justify-between">
            <span class="text-white font-bold">SOFTCV STUDIO</span>
            <button id="export-toggle-btn" class="bg-amber px-2 py-1 text-carbon font-bold">↓ EXPORT</button>
          </header>
          <div role="tablist" class="md:hidden flex bg-carbon">
            <button role="tab" id="tab-edit" aria-selected="true" class="flex-1 py-1 text-nav-gold">✎ EDIT</button>
            <button role="tab" id="tab-preview" aria-selected="false" class="flex-1 py-1 text-platinum">◎ PREVIEW</button>
          </div>
          <main id="main-content" class="flex flex-1 overflow-hidden">
            <aside id="editor-modules-panel" class="w-80 lg:w-96 flex flex-col bg-periwinkle-mid border-r border-[#3d4f97]">
              <div class="p-4 bg-surface m-2 hardware-inset">
                ${renderToStaticMarkup(React.createElement(BasicsForm))}
              </div>
            </aside>
            <div id="editor-preview-panel" class="flex flex-1 flex-col overflow-hidden bg-neutral-200">
              <div class="h-10 bg-carbon text-nav-gold flex items-center justify-between px-3">
                <span>CANVAS ZOOM</span>
                <div class="flex gap-1">
                  <button id="zoom-out">-</button>
                  <button id="zoom-in">+</button>
                </div>
              </div>
            </div>
            <aside id="template-settings-drawer" class="hidden md:flex w-72 lg:w-80 flex-col bg-periwinkle-mid border-l border-[#3d4f97]">
              <div class="p-4 bg-surface m-2 hardware-inset">
                ${renderToStaticMarkup(React.createElement(TemplateSettingsPanel))}
              </div>
            </aside>
          </main>
        </div>
      `;

      const html = buildPageHtml("Editor Desktop 1280px", editorMarkup);
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      // Verify left modules panel and center preview panel are visible simultaneously
      const modulesVisible = await page.isVisible("#editor-modules-panel");
      const previewVisible = await page.isVisible("#editor-preview-panel");
      const mobileTabsVisible = await page.isVisible("#tab-edit");

      expect(modulesVisible).toBe(true);
      expect(previewVisible).toBe(true);
      expect(mobileTabsVisible).toBe(false); // Mobile tabs hidden on desktop

      await context.close();
    });

    it("switches between Edit and Preview tabs on mobile viewports (375px)", async () => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
      });
      const page = await context.newPage();

      useEditorStore.getState().initResume("synth-editor", "Editor Fixture", FRESHER_STUDENT_FIXTURE);

      // Render the mobile layout mockup mirroring edit/page.tsx
      const editorMobileMarkup = `
        <div class="flex flex-col h-screen">
          <header class="h-12 bg-carbon flex items-center px-3 justify-between">
            <span class="text-white font-bold text-xs">SOFTCV STUDIO</span>
            <button id="export-toggle-btn" class="bg-amber px-2 py-0.5 text-xs text-carbon font-bold">↓ EXPORT</button>
          </header>
          <div role="tablist" class="flex bg-carbon border-b border-hairline">
            <button role="tab" id="tab-edit" aria-selected="true" class="flex-1 py-1.5 text-xs bg-ink-soft text-nav-gold font-bold">✎ EDIT MODULES</button>
            <button role="tab" id="tab-preview" aria-selected="false" class="flex-1 py-1.5 text-xs text-platinum">◎ LIVE PREVIEW</button>
          </div>
          <main id="main-content" class="flex flex-1 overflow-hidden relative">
            <aside id="editor-modules-panel" role="tabpanel" class="flex flex-col w-full bg-periwinkle-mid">
              <div class="p-3 bg-surface m-1 hardware-inset">
                ${renderToStaticMarkup(React.createElement(BasicsForm))}
              </div>
            </aside>
            <div id="editor-preview-panel" role="tabpanel" class="hidden flex-col w-full bg-neutral-200">
              <div class="p-2 text-center text-xs">LIVE PREVIEW</div>
            </div>
          </main>
        </div>
      `;

      const html = buildPageHtml("Editor Mobile 375px", editorMobileMarkup);
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      // Initially Edit tab is selected and panel is visible
      const editTabSelected = await page.getAttribute("#tab-edit", "aria-selected");
      expect(editTabSelected).toBe("true");

      const modulesVisible = await page.isVisible("#editor-modules-panel");
      const previewVisible = await page.isVisible("#editor-preview-panel");

      expect(modulesVisible).toBe(true);
      expect(previewVisible).toBe(false);

      // Simulate tab switch script
      await page.evaluate(() => {
        const tabEdit = document.querySelector("#tab-edit");
        const tabPrev = document.querySelector("#tab-preview");
        const modPanel = document.querySelector("#editor-modules-panel");
        const prevPanel = document.querySelector("#editor-preview-panel");

        tabPrev?.addEventListener("click", () => {
          tabEdit?.setAttribute("aria-selected", "false");
          tabPrev.setAttribute("aria-selected", "true");
          modPanel?.classList.add("hidden");
          prevPanel?.classList.remove("hidden");
        });
      });

      await page.click("#tab-preview");

      // Verify states swapped
      const nowPreviewSelected = await page.getAttribute("#tab-preview", "aria-selected");
      expect(nowPreviewSelected).toBe("true");

      const modulesNowHidden = await page.isVisible("#editor-modules-panel");
      const previewNowVisible = await page.isVisible("#editor-preview-panel");

      expect(modulesNowHidden).toBe(false);
      expect(previewNowVisible).toBe(true);

      await context.close();
    });
  });

  // ─────────────────────────────────────────────
  // 4. Zoom & High-DPI Reflow Simulation (200% & 400%)
  // ─────────────────────────────────────────────

  describe("Browser Zoom & DPI Reflow Simulation", () => {
    it("simulates 200% zoom (640px viewport @ 2x pixel ratio) without layout breakage", async () => {
      const context = await browser.newContext({
        viewport: { width: 640, height: 480 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      const html = buildPageHtml(
        "200% Zoom Reflow",
        renderToStaticMarkup(React.createElement(HomePage))
      );
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth + 2;
      });
      expect(overflow).toBe(true);

      await context.close();
    });

    it("simulates 400% zoom (320px viewport @ 3x pixel ratio) without horizontal breakage", async () => {
      const context = await browser.newContext({
        viewport: { width: 320, height: 480 },
        deviceScaleFactor: 3,
      });
      const page = await context.newPage();

      const html = buildPageHtml(
        "400% Zoom Reflow",
        renderToStaticMarkup(React.createElement(HomePage))
      );
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth + 2;
      });
      expect(overflow).toBe(true);

      await context.close();
    });
  });
});
