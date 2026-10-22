import { describe, it, expect } from "vitest";
import { sanitizeFilename, buildExportFilename } from "@/lib/export/filename";

describe("Safe Filename Sanitizer (RS-115)", () => {
  describe("sanitizeFilename", () => {
    it("handles standard alphanumeric names with spaces", () => {
      expect(sanitizeFilename("Alex Chen")).toBe("Alex_Chen");
      expect(sanitizeFilename("Software Engineer - Frontend")).toBe("Software_Engineer-Frontend");
    });

    it("strips path traversal patterns (../ and ..\\)", () => {
      expect(sanitizeFilename("../../etc/passwd")).toBe("etc_passwd");
      expect(sanitizeFilename("..\\..\\Windows\\System32\\cmd.exe")).toBe("Windows_System32_cmd.exe");
      expect(sanitizeFilename("....//....//malicious")).toBe("malicious");
    });

    it("removes control characters and null bytes", () => {
      expect(sanitizeFilename("Alex\0Chen\nResume\r\t")).toBe("Alex_Chen_Resume");
      expect(sanitizeFilename("\x1F\x7Ftest\x00")).toBe("test");
    });

    it("disallows Windows forbidden characters (< > : \" / \\ | ? *)", () => {
      expect(sanitizeFilename('Alex<Chen>:Resume"2024|test?*.pdf')).toBe("Alex_Chen_Resume_2024_test.pdf");
    });

    it("guards against Windows reserved device names", () => {
      expect(sanitizeFilename("CON")).toBe("CON_doc");
      expect(sanitizeFilename("prn")).toBe("prn_doc");
      expect(sanitizeFilename("aux.txt")).toBe("aux.txt_doc");
      expect(sanitizeFilename("NUL")).toBe("NUL_doc");
      expect(sanitizeFilename("COM1")).toBe("COM1_doc");
      expect(sanitizeFilename("LPT9")).toBe("LPT9_doc");
    });

    it("transliterates accented Latin characters safely", () => {
      expect(sanitizeFilename("Renée Müller")).toBe("Renee_Muller");
      expect(sanitizeFilename("José García")).toBe("Jose_Garcia");
      expect(sanitizeFilename("Søren Kierkegaard")).toBe("Soren_Kierkegaard");
      expect(sanitizeFilename("Marta Černá")).toBe("Marta_Cerna");
      expect(sanitizeFilename("François Ça")).toBe("Francois_Ca");
      expect(sanitizeFilename("Łukasz Weiß")).toBe("Lukasz_Weiss");
    });

    it("falls back gracefully when input is empty or becomes empty", () => {
      expect(sanitizeFilename("")).toBe("resume");
      expect(sanitizeFilename("   ")).toBe("resume");
      expect(sanitizeFilename("???///:::***")).toBe("resume");
      expect(sanitizeFilename("   ", "custom_fallback")).toBe("custom_fallback");
    });

    it("enforces maximum length boundaries (80 chars)", () => {
      const veryLong = "A".repeat(120);
      const sanitized = sanitizeFilename(veryLong);
      expect(sanitized.length).toBeLessThanOrEqual(80);
      expect(sanitized).toBe("A".repeat(80));
    });

    it("collapses multiple underscores, hyphens, and dots", () => {
      expect(sanitizeFilename("Alex___Chen---Resume...doc")).toBe("Alex_Chen-Resume.doc");
    });

    it("strips leading and trailing dots and dashes", () => {
      expect(sanitizeFilename("...---_Alex_Chen_---...")).toBe("Alex_Chen");
    });
  });

  describe("buildExportFilename", () => {
    it("builds a structured candidate and title filename", () => {
      expect(
        buildExportFilename({
          candidateName: "Alex Chen",
          resumeTitle: "Senior Frontend Engineer",
          extension: "pdf",
        })
      ).toBe("Alex_Chen_Senior_Frontend_Engineer.pdf");
    });

    it("handles missing candidate name", () => {
      expect(
        buildExportFilename({
          resumeTitle: "My Resume",
          extension: "docx",
        })
      ).toBe("My_Resume.docx");
    });

    it("handles missing title", () => {
      expect(
        buildExportFilename({
          candidateName: "Priya Mehta",
          extension: "txt",
        })
      ).toBe("Priya_Mehta.txt");
    });

    it("handles both missing candidate name and title", () => {
      expect(
        buildExportFilename({
          extension: "json",
        })
      ).toBe("Resume.json");
    });

    it("does not duplicate identical name and title", () => {
      expect(
        buildExportFilename({
          candidateName: "Resume",
          resumeTitle: "Resume",
          extension: "pdf",
        })
      ).toBe("Resume.pdf");
    });

    it("strips leading dot from extension", () => {
      expect(
        buildExportFilename({
          candidateName: "Alex Chen",
          extension: "pdf",
        })
      ).toBe("Alex_Chen.pdf");
    });
  });
});
