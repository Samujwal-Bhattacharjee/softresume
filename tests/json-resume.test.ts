/**
 * RS-097 — Standard JSON Resume Import/Export Unit & Round-trip Tests
 */
import { describe, it, expect } from "vitest";
import {
  exportToJsonResume,
  importFromJsonResume,
  type StandardJsonResume,
  MAX_JSON_RESUME_SIZE,
} from "@/lib/export/json-resume";
import {
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";
import { ResumeDocumentSchema } from "@/lib/schemas/resume";

describe("RS-097: JSON Resume Import / Export Module", () => {
  it("exports a SoftCV ResumeDocument into valid, standard JSON Resume v1.0.0 format", () => {
    const exported = exportToJsonResume(EXPERIENCED_FIXTURE);

    // Verify root schema and standard keys
    expect(exported.$schema).toContain("jsonresume/resume-schema");
    expect(exported.basics?.name).toBe(EXPERIENCED_FIXTURE.basics.name);
    expect(exported.basics?.label).toBe(EXPERIENCED_FIXTURE.basics.headline);
    expect(exported.basics?.email).toBe(EXPERIENCED_FIXTURE.basics.email);
    expect(exported.basics?.location?.city).toBe(EXPERIENCED_FIXTURE.basics.location);

    // Work / Experience
    expect(exported.work).toBeDefined();
    expect(exported.work?.length).toBe(EXPERIENCED_FIXTURE.experience.length);
    expect(exported.work?.[0].name).toBe(EXPERIENCED_FIXTURE.experience[0].employer);
    expect(exported.work?.[0].position).toBe(EXPERIENCED_FIXTURE.experience[0].role);

    // Skills
    expect(exported.skills).toBeDefined();
    expect(exported.skills?.length).toBe(EXPERIENCED_FIXTURE.skills.length);
    expect(exported.skills?.[0].keywords).toEqual(EXPERIENCED_FIXTURE.skills[0].items);

    // Projects
    expect(exported.projects).toBeDefined();
    expect(exported.projects?.length).toBe(EXPERIENCED_FIXTURE.projects.length);

    // Serialization check
    const serialized = JSON.stringify(exported, null, 2);
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it("imports a representative standard JSON Resume fixture into a valid app resume", () => {
    const standardFixture: StandardJsonResume = {
      $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      basics: {
        name: "Ada Lovelace",
        label: "Computing Pioneer & Algorithmic Mathematician",
        email: "ada@analyticalengine.org",
        phone: "+44 20 7946 0991",
        url: "https://analyticalengine.org",
        summary: "Pioneered early computational algorithms and mathematical theory.",
        location: {
          city: "London",
          region: "Greater London",
          countryCode: "GB",
        },
        profiles: [
          {
            network: "GitHub",
            username: "adalovelace",
            url: "https://github.com/adalovelace",
          },
        ],
      },
      work: [
        {
          name: "Analytical Research Lab",
          position: "Chief Algorithmic Architect",
          startDate: "1842-01",
          endDate: "1843-12",
          summary: "Published translation and notes on Babbage's Analytical Engine.",
          highlights: [
            "Authored Bernoulli numbers algorithmic execution diagram.",
            "Formulated early principles of universal machine programming.",
          ],
        },
      ],
      education: [
        {
          institution: "University of London Private Tutelage",
          area: "Mathematics & Astronomy",
          studyType: "Honorary Studies",
          startDate: "1832-01",
          endDate: "1836-12",
          score: "First Class",
          courses: ["Differential Calculus", "Astronomy"],
        },
      ],
      skills: [
        {
          name: "Mathematical Logic",
          keywords: ["Algorithms", "Combinatorics", "Symbolic Manipulation"],
        },
      ],
      projects: [
        {
          name: "Bernoulli Sequence Generator",
          description: "First published program executed on hardware mechanical logic.",
          keywords: ["Punchcard Instructions", "Calculus"],
          highlights: ["Demonstrated automatic iterative computation."],
        },
      ],
    };

    const rawJson = JSON.stringify(standardFixture);
    const result = importFromJsonResume(rawJson);

    expect(result.success).toBe(true);
    expect(result.document).toBeDefined();

    const doc = result.document!;
    // Must be valid against canonical ResumeDocumentSchema
    const parseCheck = ResumeDocumentSchema.safeParse(doc);
    expect(parseCheck.success).toBe(true);

    expect(doc.basics.name).toBe("Ada Lovelace");
    expect(doc.basics.headline).toBe("Computing Pioneer & Algorithmic Mathematician");
    expect(doc.basics.email).toBe("ada@analyticalengine.org");
    expect(doc.basics.location).toBe("London, Greater London, GB");
    expect(doc.basics.links?.length).toBe(2); // url + GitHub profile
    expect(doc.summary).toContain("computational algorithms");

    expect(doc.experience.length).toBe(1);
    expect(doc.experience[0].employer).toBe("Analytical Research Lab");
    expect(doc.experience[0].bullets.length).toBe(2);

    expect(doc.education.length).toBe(1);
    expect(doc.education[0].coursework?.length).toBe(2);

    expect(doc.skills.length).toBe(1);
    expect(doc.skills[0].items).toContain("Algorithms");

    expect(doc.projects.length).toBe(1);
    expect(doc.projects[0].name).toBe("Bernoulli Sequence Generator");

    expect(result.summary?.name).toBe("Ada Lovelace");
    expect(result.summary?.counts.experience).toBe(1);
    expect(result.summary?.counts.education).toBe(1);
    expect(result.summary?.counts.skills).toBe(1);
    expect(result.summary?.counts.projects).toBe(1);
  });

  it("preserves mapped fields through an Import → Export → Import round trip", () => {
    // Start with EXPERIENCED_FIXTURE
    const exported1 = exportToJsonResume(EXPERIENCED_FIXTURE);
    const serialized1 = JSON.stringify(exported1);

    const imported1 = importFromJsonResume(serialized1);
    expect(imported1.success).toBe(true);

    const doc1 = imported1.document!;
    const exported2 = exportToJsonResume(doc1);
    const serialized2 = JSON.stringify(exported2);

    const imported2 = importFromJsonResume(serialized2);
    expect(imported2.success).toBe(true);

    const doc2 = imported2.document!;

    // Identity and core data matches across both iterations
    expect(doc2.basics.name).toBe(doc1.basics.name);
    expect(doc2.basics.email).toBe(doc1.basics.email);
    expect(doc2.basics.headline).toBe(doc1.basics.headline);
    expect(doc2.basics.location).toBe(doc1.basics.location);
    expect(doc2.summary).toBe(doc1.summary);
    expect(doc2.experience.length).toBe(doc1.experience.length);
    expect(doc2.education.length).toBe(doc1.education.length);
    expect(doc2.skills.length).toBe(doc1.skills.length);
    expect(doc2.projects.length).toBe(doc1.projects.length);
  });

  it("reports unsupported sections as warnings without dropping supported data", () => {
    const fixtureWithExtras = {
      basics: { name: "Alan Turing" },
      work: [{ name: "Bletchley Park", position: "Cryptanalyst" }],
      languages: [{ language: "English", fluency: "Native" }],
      interests: [{ name: "Marathon Running" }],
      references: [{ name: "Gov Code and Cypher School" }],
    };

    const result = importFromJsonResume(JSON.stringify(fixtureWithExtras));

    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(3);
    expect(result.summary?.sectionsUnmapped.length).toBeGreaterThanOrEqual(3);
    expect(result.document?.basics.name).toBe("Alan Turing");
    expect(result.document?.experience.length).toBe(1);
  });

  it("rejects invalid JSON, incorrect root shapes, and oversized payloads safely", () => {
    // Malformed JSON
    const malformed = "{ name: 'Unclosed";
    const res1 = importFromJsonResume(malformed);
    expect(res1.success).toBe(false);
    expect(res1.error).toContain("Malformed JSON");

    // Array at root
    const arrayRoot = JSON.stringify([{ basics: {} }]);
    const res2 = importFromJsonResume(arrayRoot);
    expect(res2.success).toBe(false);
    expect(res2.error).toContain("root must be a JSON object");

    // Oversized payload (>1MB)
    const bigString = "x".repeat(MAX_JSON_RESUME_SIZE + 50);
    const res3 = importFromJsonResume(bigString);
    expect(res3.success).toBe(false);
    expect(res3.error).toContain("exceeds the 1MB limit");
  });

  it("handles Unicode characters, multiline text, long URLs, and empty collections safely", () => {
    const unicodeFixture = {
      basics: {
        name: "François René de Chateaubriand",
        label: "Écrivain & Diplomate // 2001 Edition",
        location: { city: "Saint-Malo, Bretagne, France" },
        summary: "Ligne un d'une longue description.\nLigne deux avec des guillemets «français» et tirets em—dash.",
      },
      work: [],
      education: [],
      skills: [
        {
          name: "Littérature",
          keywords: ["Romantisme", "Mémoires d'outre-tombe"],
        },
      ],
      projects: [],
    };

    const result = importFromJsonResume(JSON.stringify(unicodeFixture));
    expect(result.success).toBe(true);
    expect(result.document?.basics.name).toBe("François René de Chateaubriand");
    expect(result.document?.summary).toContain("«français»");
    expect(result.document?.skills[0].items).toContain("Mémoires d'outre-tombe");
    expect(result.document?.experience.length).toBe(0);
  });
});
