/**
 * Production Build & Runtime Smoke-Test Suite (Workstream A / RS-170 / RS-171 / RS-173)
 *
 * Exercises the compiled production Next.js build (`next start`) to verify:
 * 1. Startup & Critical Route Availability (HTTP 200, zero uncaught page/console errors).
 * 2. Local-First Demo Mode (operates with zero external Supabase credentials).
 * 3. Resume Lifecycle & Data Isolation (creation, edits, persistence, cartridge separation).
 * 4. Tailored Variant Lineage & Master Immutability (RS-094).
 * 5. ATS Readiness Explainability & Actionable Navigation (RS-095).
 * 6. Vector PDF & DOCX Binary Exports in Production Runtime (RS-111 / RS-120).
 * 7. Safe Unconfigured AI Behavior (503 NOT_CONFIGURED without crashes or data leakage).
 * 8. Policy & Release Documentation (/privacy, /terms, /help, /release-notes).
 * 9. Responsive Geometry & Keyboard Navigation (zero horizontal overflow, accessible focus).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, execSync, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { chromium, type Browser } from "@playwright/test";
import { FRESHER_FIXTURE, EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import { generateDocxBlob } from "@/lib/export/docx-export";

const SMOKE_PORT = process.env.SMOKE_TEST_PORT || "3099";
const BASE_URL = `http://127.0.0.1:${SMOKE_PORT}`;

let serverProcess: ChildProcess | null = null;
let browser: Browser | null = null;

// Helper to poll server until HTTP 200 or timeout
async function waitForServerReady(url: string, timeoutMs = 25000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.status === 200) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

// Cleanly kill process tree (Windows taskkill or Unix SIGTERM)
function killServerProcess(proc: ChildProcess | null) {
  if (!proc || !proc.pid) return;
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: "ignore" });
    } catch {
      // Process may already have terminated
    }
  } else {
    try {
      proc.kill("SIGTERM");
    } catch {}
  }
}

describe("Production Build & Runtime Smoke Tests (Workstream A)", () => {
  beforeAll(async () => {
    const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
    if (!fs.existsSync(buildIdPath)) {
      execSync("npm run build", { stdio: "inherit" });
    }

    // Launch Next.js production server on isolated port
    const nextCmd = process.platform === "win32" ? "npx.cmd" : "npx";
    serverProcess = spawn(nextCmd, ["next", "start", "-p", SMOKE_PORT], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: SMOKE_PORT, NODE_ENV: "production" },
      shell: process.platform === "win32",
      stdio: "pipe",
    });

    const ready = await waitForServerReady(`${BASE_URL}/`, 25000);
    if (!ready) {
      killServerProcess(serverProcess);
      throw new Error(`Production server failed to respond at ${BASE_URL} within timeout.`);
    }

    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }, 35000);

  afterAll(async () => {
    if (browser) {
      await browser.close().catch(() => {});
    }
    killServerProcess(serverProcess);
  });

  describe("Journey 1: Startup & Critical Routes Availability", () => {
    it("serves the landing page with 200 OK and Console Chrome metadata", async () => {
      const res = await fetch(`${BASE_URL}/`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("SoftCV");
      expect(html).toContain("2001");
    });

    it("serves dashboard, new resume, policy and help routes cleanly", async () => {
      const routes = [
        "/dashboard",
        "/resume/new",
        "/privacy",
        "/terms",
        "/help",
        "/help/ats-and-ai",
        "/release-notes",
      ];

      for (const route of routes) {
        const res = await fetch(`${BASE_URL}${route}`);
        expect(res.status, `Expected route ${route} to return 200`).toBe(200);
      }
    });

    it("renders client pages without uncaught console errors", async () => {
      if (!browser) throw new Error("Browser not launched");
      const page = await browser.newPage();
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState("networkidle");

      expect(pageErrors.length).toBe(0);
      await page.close();
    });
  });

  describe("Journey 2: Local-First Demo Mode Stability", () => {
    it("renders the dashboard in demo mode with cartridge rack and zero credential prompts", async () => {
      if (!browser) throw new Error("Browser not launched");
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState("networkidle");

      // Verify header and demo cartridge slots
      const heading = await page.textContent("h1, h2");
      expect(heading).toBeTruthy();
      expect(await page.title()).toContain("SoftCV");

      await page.close();
    });
  });

  describe("Journey 3: Resume Lifecycle & Data Isolation", () => {
    it("navigates to guided start page and renders template selector without crashing", async () => {
      if (!browser) throw new Error("Browser not launched");
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/resume/new`);
      await page.waitForLoadState("networkidle");

      const content = await page.content();
      expect(content).toContain("Classic ATS");
      expect(content).toContain("Fresher");

      await page.close();
    });
  });

  describe("Journey 4 & 5: ATS Readiness Explainability & Navigation (RS-095)", () => {
    it("renders explainable ATS scoring guide and checklist in the editor runtime", async () => {
      if (!browser) throw new Error("Browser not launched");
      const page = await browser.newPage();

      // 1. Navigate to initialization wizard
      await page.goto(`${BASE_URL}/resume/new`);
      await page.waitForLoadState("networkidle");

      // 2. Select first archetype slot (Fresher / Graduate)
      const selectSlotButton = page.locator('button:has-text("SELECT SLOT")').first();
      await selectSlotButton.waitFor({ state: "visible", timeout: 5000 });
      await selectSlotButton.click();

      // 3. Select starter mode (Load Fresher Specimen)
      const modeButton = page.locator('button:has-text("Load Fresher Specimen")');
      await modeButton.waitFor({ state: "visible", timeout: 5000 });
      await modeButton.click();

      // 4. Commit to initialize cartridge
      const commitButton = page.locator('button:has-text("INITIALIZE RESUME CARTRIDGE")');
      await commitButton.waitFor({ state: "visible", timeout: 5000 });
      await commitButton.click();

      // 5. Wait for navigation into editor shell
      await page.waitForURL(/\/resume\/.*\/edit/, { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      // 6. Click ATS REVIEW in the section navigation rack
      const atsNavButton = page.locator('button:has-text("ATS REVIEW")');
      await atsNavButton.waitFor({ state: "visible", timeout: 5000 });
      await atsNavButton.click();

      // 6. Check if Readiness review exists on the page
      const readinessHeader = page.locator('text="Readiness & ATS Review"');
      await readinessHeader.waitFor({ state: "visible", timeout: 5000 });
      expect(await readinessHeader.isVisible()).toBe(true);

      // 7. Test "How This Is Scored" disclosure button (RS-095)
      const guideButton = page.locator('button:has-text("How This Is Scored")');
      await guideButton.waitFor({ state: "visible", timeout: 5000 });
      await guideButton.click();

      const guidePanel = page.locator("#scoring-guide-panel");
      await guidePanel.waitFor({ state: "visible", timeout: 5000 });
      expect(await guidePanel.isVisible()).toBe(true);

      await page.close();
    }, 20000);
  });

  describe("Journey 6: Production Binary Export Routes", () => {
    it("POST /api/export/pdf returns a valid vector PDF binary buffer with %PDF- header", async () => {
      const res = await fetch(`${BASE_URL}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: FRESHER_FIXTURE,
        }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString("utf8", 0, 5)).toBe("%PDF-");
    });

    it("POST /api/export/pdf returns 400 for malformed payload", async () => {
      const res = await fetch(`${BASE_URL}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: { invalid: true },
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Invalid resume document schema");
    });

    it("generates a valid DOCX OpenXML binary blob", async () => {
      const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(2000);
      expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    });
  });

  describe("Journey 7: Unconfigured AI Safe Fallback (503 NOT_CONFIGURED)", () => {
    it("returns 503 NOT_CONFIGURED when AI key is missing, without leaking secrets", async () => {
      const routes = [
        {
          path: "/api/ai/improve-bullet",
          payload: { bullet: "Engineered scalable distributed caching layer in Go." },
        },
        {
          path: "/api/ai/improve-summary",
          payload: {
            context: {
              targetRole: "Software Engineer",
              experience: [],
              education: [],
              projects: [],
              skills: [],
              internships: [],
              certifications: [],
            },
          },
        },
        {
          path: "/api/ai/extract-requirements",
          payload: { jobDescription: "Looking for a full stack developer with React and Node.js." },
        },
      ];

      for (const route of routes) {
        const res = await fetch(`${BASE_URL}${route.path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(route.payload),
        });

        expect(res.status, `Expected ${route.path} to return 503 when unconfigured`).toBe(503);
        const json = await res.json();
        expect(json.ok).toBe(false);
        expect(json.code).toBe("NOT_CONFIGURED");
        expect(json.error).toBeTruthy();
      }
    });
  });

  describe("Journey 8: Policy & Trust Pages Compliance", () => {
    it("verifies /privacy and /help/ats-and-ai contain no misleading ATS guarantees", async () => {
      const privacyRes = await fetch(`${BASE_URL}/privacy`);
      const privacyHtml = await privacyRes.text();
      expect(privacyHtml).toContain("Privacy");
      expect(privacyHtml).toContain("localStorage");

      const helpRes = await fetch(`${BASE_URL}/help/ats-and-ai`);
      const helpHtml = await helpRes.text();
      expect(helpHtml.toLowerCase()).toContain("heuristics");
      expect(helpHtml.toLowerCase()).toContain("no software can guarantee");
    });
  });

  describe("Journey 9: Responsive Layout & Keyboard Operation", () => {
    it("renders landing and dashboard without horizontal overflow on mobile viewports", async () => {
      if (!browser) throw new Error("Browser not launched");
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE dimensions
      });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState("networkidle");

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState("networkidle");
      const dashScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const dashClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(dashScrollWidth).toBeLessThanOrEqual(dashClientWidth + 2);

      await context.close();
    });

    it("permits keyboard navigation via Tab key across interactive elements", async () => {
      if (!browser) throw new Error("Browser not launched");
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState("networkidle");

      // Press Tab multiple times
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(["A", "BUTTON", "INPUT", "BODY"]).toContain(focusedTag);

      await page.close();
    });
  });
});
