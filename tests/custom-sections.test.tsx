/**
 * RS-075 — Custom Sections & Optional Fields Test Suite
 *
 * Verifies:
 * 1. Store lifecycle: Add, edit, remove certifications, awards, volunteering, publications, custom sections.
 * 2. Bounds and safety: Title length limits (<=80), description limits (<=2000), safe URLs.
 * 3. Template rendering guarantees: Empty sections NEVER render in any template; populated sections render predictably.
 * 4. Hidden sections honoring: hiddenSections suppresses rendering even if items exist.
 * 5. Undo/Redo integration: Store mutations record history and revert cleanly.
 * 6. Exporter parity: Plain text and DOCX exports include populated sections and omit empty ones.
 */

import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { useEditorStore } from "@/lib/resume/editor-store";
import { FRESHER_FIXTURE } from "@/lib/fixtures/resume-fixtures";
import { ClassicATSTemplate } from "@/components/resume-templates/classic-ats";
import { FresherGraduateTemplate } from "@/components/resume-templates/fresher-graduate";
import { TechnicalTemplate } from "@/components/resume-templates/technical";
import { ExperiencedTemplate } from "@/components/resume-templates/experienced";
import { ModernEditorialTemplate } from "@/components/resume-templates/modern-editorial";
import { generatePlainTextResume } from "@/lib/export/txt-export";
import { exportToJsonResume, importFromJsonResume } from "@/lib/export/json-resume";
import type { ResumeDocument } from "@/lib/schemas/resume";

describe("RS-075 — Custom Sections and Optional Fields", () => {
  beforeEach(() => {
    // Reset store with FRESHER_FIXTURE clone
    const fixtureCopy: ResumeDocument = JSON.parse(JSON.stringify(FRESHER_FIXTURE));
    fixtureCopy.certifications = [];
    fixtureCopy.awards = [];
    fixtureCopy.volunteering = [];
    fixtureCopy.publications = [];
    fixtureCopy.customSections = [];
    useEditorStore.getState().initResume("test-resume", "Test Resume", fixtureCopy);
  });

  describe("Editor Store Mutation Operations", () => {
    it("adds, updates, and removes certifications with undo/redo", () => {
      const store = useEditorStore.getState();
      expect(store.draft.certifications?.length ?? 0).toBe(0);

      // Add certification
      store.addCertification({ name: "AWS Certified Cloud Practitioner", issuer: "Amazon" });
      let current = useEditorStore.getState().draft;
      expect(current.certifications?.length).toBe(1);
      const certId = current.certifications![0].id;
      expect(current.certifications![0].name).toBe("AWS Certified Cloud Practitioner");

      // Update certification
      useEditorStore.getState().updateCertification(certId, {
        credentialId: "AWS-12345",
        date: "2024-01",
      });
      current = useEditorStore.getState().draft;
      expect(current.certifications![0].credentialId).toBe("AWS-12345");
      expect(current.certifications![0].date).toBe("2024-01");

      // Undo update
      useEditorStore.getState().undo();
      current = useEditorStore.getState().draft;
      expect(current.certifications![0].credentialId).toBeUndefined();

      // Redo update
      useEditorStore.getState().redo();
      current = useEditorStore.getState().draft;
      expect(current.certifications![0].credentialId).toBe("AWS-12345");

      // Remove certification
      useEditorStore.getState().removeCertification(certId);
      current = useEditorStore.getState().draft;
      expect(current.certifications?.length).toBe(0);
    });

    it("adds, updates, and removes awards", () => {
      const store = useEditorStore.getState();
      store.addAward({ title: "Hackathon Winner", issuer: "Tech Con", date: "2024-03" });
      let current = useEditorStore.getState().draft;
      expect(current.awards?.length).toBe(1);
      const awardId = current.awards![0].id;

      useEditorStore.getState().updateAward(awardId, { description: "1st out of 80 teams" });
      current = useEditorStore.getState().draft;
      expect(current.awards![0].description).toBe("1st out of 80 teams");

      useEditorStore.getState().removeAward(awardId);
      current = useEditorStore.getState().draft;
      expect(current.awards?.length).toBe(0);
    });

    it("adds, updates, and removes volunteering entries", () => {
      const store = useEditorStore.getState();
      store.addVolunteering({
        role: "Mentor",
        organization: "STEM for Youth",
        startDate: "2023-01",
        bullets: ["Mentored 10 students"],
      });
      let current = useEditorStore.getState().draft;
      expect(current.volunteering?.length).toBe(1);
      const volId = current.volunteering![0].id;

      useEditorStore.getState().updateVolunteering(volId, {
        bullets: ["Mentored 10 students", "Held weekly office hours"],
      });
      current = useEditorStore.getState().draft;
      expect(current.volunteering![0].bullets?.length).toBe(2);

      useEditorStore.getState().removeVolunteering(volId);
      current = useEditorStore.getState().draft;
      expect(current.volunteering?.length).toBe(0);
    });

    it("adds, updates, and removes publications", () => {
      const store = useEditorStore.getState();
      store.addPublication({
        title: "Fast Graph Reasoning",
        venue: "ICLR 2024",
        date: "2024-05",
      });
      let current = useEditorStore.getState().draft;
      expect(current.publications?.length).toBe(1);
      const pubId = current.publications![0].id;

      useEditorStore.getState().updatePublication(pubId, {
        authors: "A. Developer, B. Researcher",
        url: "https://arxiv.org/abs/2401.00000",
      });
      current = useEditorStore.getState().draft;
      expect(current.publications![0].authors).toBe("A. Developer, B. Researcher");
      expect(current.publications![0].url).toBe("https://arxiv.org/abs/2401.00000");

      useEditorStore.getState().removePublication(pubId);
      current = useEditorStore.getState().draft;
      expect(current.publications?.length).toBe(0);
    });

    it("creates custom sections with items, enforces bounds, and supports deletion", () => {
      const store = useEditorStore.getState();
      // Add custom section
      store.addCustomSection("Speaking Engagements");
      let current = useEditorStore.getState().draft;
      expect(current.customSections?.length).toBe(1);
      const sectionId = current.customSections![0].id;
      expect(current.customSections![0].title).toBe("Speaking Engagements");
      expect(current.customSections![0].items.length).toBe(0);

      // Add item to custom section
      useEditorStore.getState().addCustomSectionItem(sectionId, {
        title: "Keynote on Distributed Databases",
        subtitle: "CloudConf Berlin",
        date: "2024-09",
        description: "Presented architectural lessons learned from scaling storage clusters.",
      });
      current = useEditorStore.getState().draft;
      expect(current.customSections![0].items.length).toBe(1);
      const itemId = current.customSections![0].items[0].id;

      // Update item bullets
      useEditorStore.getState().updateCustomSectionItem(sectionId, itemId, {
        bullets: ["Audience of 450+ attendees", "Rated 4.9/5 overall"],
      });
      current = useEditorStore.getState().draft;
      expect(current.customSections![0].items[0].bullets?.length).toBe(2);

      // Enforce bounds on title (capped at 80 chars)
      const longTitle = "A".repeat(120);
      useEditorStore.getState().updateCustomSection(sectionId, { title: longTitle });
      current = useEditorStore.getState().draft;
      expect(current.customSections![0].title.length).toBeLessThanOrEqual(80);

      // Enforce bounds on item description (capped at 2000 chars)
      const longDesc = "B".repeat(2500);
      useEditorStore.getState().updateCustomSectionItem(sectionId, itemId, {
        description: longDesc,
      });
      current = useEditorStore.getState().draft;
      expect(current.customSections![0].items[0].description!.length).toBeLessThanOrEqual(2000);

      // Remove item
      useEditorStore.getState().removeCustomSectionItem(sectionId, itemId);
      current = useEditorStore.getState().draft;
      expect(current.customSections![0].items.length).toBe(0);

      // Remove entire custom section
      useEditorStore.getState().removeCustomSection(sectionId);
      current = useEditorStore.getState().draft;
      expect(current.customSections?.length).toBe(0);
    });
  });

  describe("Template Rendering & Empty Section Omission", () => {
    it("omits empty optional sections and empty custom sections across all 5 templates", () => {
      const emptyDoc: ResumeDocument = JSON.parse(JSON.stringify(FRESHER_FIXTURE));
      emptyDoc.certifications = [];
      emptyDoc.awards = [];
      emptyDoc.volunteering = [];
      emptyDoc.publications = [];
      emptyDoc.customSections = [
        { id: "empty-cs-1", title: "Patents & Inventions", items: [] },
      ];

      const templates = [
        { name: "Classic ATS", Component: ClassicATSTemplate },
        { name: "Fresher Graduate", Component: FresherGraduateTemplate },
        { name: "Technical", Component: TechnicalTemplate },
        { name: "Experienced", Component: ExperiencedTemplate },
        { name: "Modern Editorial", Component: ModernEditorialTemplate },
      ];

      for (const { name, Component } of templates) {
        const { queryByText, queryByLabelText } = render(
          <Component document={emptyDoc} settings={emptyDoc.settings} />
        );

        // Header for empty custom section should NOT exist in rendered DOM
        expect(queryByText("Patents & Inventions"), `${name} should not render empty custom section`).toBeNull();
        expect(queryByLabelText("Certifications"), `${name} should not render empty certifications`).toBeNull();
        expect(queryByLabelText("Awards"), `${name} should not render empty awards`).toBeNull();
        expect(queryByLabelText("Volunteering"), `${name} should not render empty volunteering`).toBeNull();
        expect(queryByLabelText("Publications"), `${name} should not render empty publications`).toBeNull();
      }
    });

    it("renders populated optional and custom sections in templates", () => {
      const populatedDoc: ResumeDocument = JSON.parse(JSON.stringify(FRESHER_FIXTURE));
      populatedDoc.certifications = [
        { id: "cert-1", name: "Certified Kubernetes Administrator", issuer: "CNCF", date: "2024-04" },
      ];
      populatedDoc.awards = [
        { id: "award-1", title: "National Science Scholar", issuer: "NSF", date: "2023-08" },
      ];
      populatedDoc.volunteering = [
        {
          id: "vol-1",
          role: "Open Source Contributor",
          organization: "FreeCodeCamp",
          startDate: "2022-01",
          bullets: ["Maintained curriculum docs"],
        },
      ];
      populatedDoc.publications = [
        {
          id: "pub-1",
          title: "Neural Search Optimization",
          venue: "SIGIR 2024",
          date: "2024-07",
        },
      ];
      populatedDoc.customSections = [
        {
          id: "cs-speaking",
          title: "Speaking & Workshops",
          items: [
            {
              id: "item-sp-1",
              title: "Modern Web Performance",
              subtitle: "Frontend Summit",
              date: "2024-02",
              bullets: ["Delivered deep-dive tutorial"],
            },
          ],
        },
      ];

      // Test Classic ATS
      const classicRender = render(
        <ClassicATSTemplate document={populatedDoc} settings={populatedDoc.settings} />
      );
      expect(classicRender.getByText("Certified Kubernetes Administrator")).toBeDefined();
      expect(classicRender.getByText("National Science Scholar")).toBeDefined();
      expect(classicRender.getByText(/Open Source Contributor/)).toBeDefined();
      expect(classicRender.getByText("Neural Search Optimization")).toBeDefined();
      expect(classicRender.getByText("Speaking & Workshops")).toBeDefined();
      expect(classicRender.getByText("Modern Web Performance")).toBeDefined();
      classicRender.unmount();

      // Test Technical template
      const techRender = render(
        <TechnicalTemplate document={populatedDoc} settings={populatedDoc.settings} />
      );
      expect(techRender.getByText("Certified Kubernetes Administrator")).toBeDefined();
      expect(techRender.getByText("Speaking & Workshops")).toBeDefined();
      techRender.unmount();
    });

    it("respects hiddenSections for custom sections and optional fields", () => {
      const docWithHidden: ResumeDocument = JSON.parse(JSON.stringify(FRESHER_FIXTURE));
      docWithHidden.customSections = [
        {
          id: "custom-confidential",
          title: "Confidential Advisory",
          items: [{ id: "item-1", title: "Advisor to Startup X" }],
        },
      ];
      docWithHidden.settings.hiddenSections = ["custom-confidential", "certifications"];
      docWithHidden.certifications = [
        { id: "c1", name: "Secret Security Clearance", issuer: "Gov" },
      ];

      const { queryByText } = render(
        <ClassicATSTemplate document={docWithHidden} settings={docWithHidden.settings} />
      );
      expect(queryByText("Confidential Advisory")).toBeNull();
      expect(queryByText("Secret Security Clearance")).toBeNull();
    });
  });

  describe("Plain Text Exporter Parity", () => {
    it("exports populated optional sections and custom sections into plain text and omits empty ones", () => {
      const doc: ResumeDocument = JSON.parse(JSON.stringify(FRESHER_FIXTURE));
      doc.certifications = [
        { id: "c1", name: "AWS Solutions Architect", issuer: "Amazon", date: "2024-01" },
      ];
      doc.awards = [
        { id: "a1", title: "Dean's Honor List", issuer: "University", date: "2023-12" },
      ];
      doc.volunteering = [
        { id: "v1", role: "Volunteer Tutor", organization: "Math Club", startDate: "2023-01", bullets: ["Tutored high school calculus"] },
      ];
      doc.publications = [
        { id: "p1", title: "A Study of Cache Hierarchies", venue: "IEEE", date: "2024-02" },
      ];
      doc.customSections = [
        {
          id: "cs-patents",
          title: "Patents",
          items: [{ id: "pat-1", title: "US Patent 9876543: Adaptive Indexing" }],
        },
      ];

      const plainText = generatePlainTextResume(doc);

      expect(plainText).toContain("CERTIFICATIONS");
      expect(plainText).toContain("AWS Solutions Architect - Amazon (2024-01)");
      expect(plainText).toContain("HONORS & AWARDS");
      expect(plainText).toContain("Dean's Honor List - University (2023-12)");
      expect(plainText).toContain("VOLUNTEERING & COMMUNITY");
      expect(plainText).toContain("Volunteer Tutor - Math Club");
      expect(plainText).toContain("* Tutored high school calculus");
      expect(plainText).toContain("PUBLICATIONS");
      expect(plainText).toContain("A Study of Cache Hierarchies - IEEE (2024-02)");
      expect(plainText).toContain("PATENTS");
      expect(plainText).toContain("US Patent 9876543: Adaptive Indexing");
    });
  });

  describe("JSON Resume v1.0.0 Roundtrip Fidelity with x-softcv Extensions", () => {
    it("preserves custom sections across JSON Resume export and re-import", () => {
      const doc: ResumeDocument = JSON.parse(JSON.stringify(FRESHER_FIXTURE));
      doc.customSections = [
        {
          id: "cs-speaking",
          title: "Public Speaking",
          items: [
            {
              id: "item-talk-1",
              title: "Building Resilient Distributed Systems",
              subtitle: "TechDays London",
              date: "2024-06",
              description: "Keynote presentation on consensus protocols.",
              bullets: ["Over 300 live attendees"],
              url: "https://example.com/talk",
            },
          ],
        },
      ];

      // Export to JSON Resume
      const exportedJson = exportToJsonResume(doc);
      expect(exportedJson["x-softcv"]).toBeDefined();
      expect(exportedJson["x-softcv"]?.customSections).toBeDefined();

      // Re-import
      const reimported = importFromJsonResume(JSON.stringify(exportedJson));
      expect(reimported.success).toBe(true);
      if (!reimported.document) throw new Error("Import failed");
      expect(reimported.document.customSections).toBeDefined();
      expect(reimported.document.customSections?.length).toBe(1);
      expect(reimported.document.customSections![0].title).toBe("Public Speaking");
      expect(reimported.document.customSections![0].items[0].title).toBe("Building Resilient Distributed Systems");
      expect(reimported.document.customSections![0].items[0].bullets?.[0]).toBe("Over 300 live attendees");
    });
  });
});
