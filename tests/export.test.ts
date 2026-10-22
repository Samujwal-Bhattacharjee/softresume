import { describe, it, expect, vi } from "vitest";
import { generatePlainTextResume } from "@/lib/export/txt-export";
import { generateDocxBlob } from "@/lib/export/docx-export";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";
import { POST as exportPdfRoute } from "@/app/api/export/pdf/route";
import { NextRequest } from "next/server";
import * as pdfGenerator from "@/lib/export/pdf-generator";

describe("Resume Export Spikes & Routes (RS-060 / RS-062 / RS-063 / RS-111)", () => {
  describe("Plain Text (.txt) Exporter", () => {
    it("generates structured plain text from Experienced fixture", () => {
      const text = generatePlainTextResume(EXPERIENCED_FIXTURE);

      expect(text).toContain("ROHAN KAPOOR");
      expect(text).toContain("r.kapoor@example.com");
      expect(text).toContain("PROFESSIONAL SUMMARY");
      expect(text).toContain("EXPERIENCE");
      expect(text).toContain("Nexora Systems");
      expect(text).toContain("SKILLS");
      expect(text).toContain("Languages: TypeScript, Python, Go, SQL, Bash");
    });

    it("generates structured plain text from Fresher fixture", () => {
      const text = generatePlainTextResume(FRESHER_FIXTURE);

      expect(text).toContain("PRIYA MEHTA");
      expect(text).toContain("EDUCATION");
      expect(text).toContain("Pune Institute of Technology");
      expect(text).toContain("PROJECTS");
      expect(text).toContain("StudyBuddy — Collaborative Notes App");
      expect(text).toContain("INTERNSHIPS");
      expect(text).toContain("DataFlow Technologies");
    });
  });

  describe("Word (.docx) Exporter", () => {
    it("generates a valid binary docx blob from Experienced fixture", async () => {
      const blob = await generateDocxBlob(EXPERIENCED_FIXTURE);
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(1000); // Valid zip archive for docx
    });

    it("generates a valid binary docx blob from Fresher fixture", async () => {
      const blob = await generateDocxBlob(FRESHER_FIXTURE);
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(1000);
    });
  });

  describe("PDF Export Route Handler & Host Chromium Fallback (RS-111 / Workstream B)", () => {
    it("returns 200 with vector binary PDF buffer when Chromium is available", async () => {
      const req = new NextRequest("http://localhost:3000/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: FRESHER_FIXTURE,
        }),
      });

      const res = await exportPdfRoute(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      expect(buffer.length).toBeGreaterThan(1000);
      // Valid PDF magic header
      expect(buffer.toString("utf8", 0, 5)).toBe("%PDF-");
    });

    it("returns 400 when document schema is invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: { invalid: "data" },
        }),
      });

      const res = await exportPdfRoute(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid resume document schema");
    });

    it("returns 500 with actionable browser print fallback when server Chromium fails", async () => {
      const spy = vi
        .spyOn(pdfGenerator, "generatePdfBuffer")
        .mockRejectedValueOnce(new Error("Chromium binary not found in serverless container"));

      const req = new NextRequest("http://localhost:3000/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: EXPERIENCED_FIXTURE,
        }),
      });

      const res = await exportPdfRoute(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error).toContain("browser print option as fallback");

      spy.mockRestore();
    });
  });
});
