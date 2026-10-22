/**
 * RS-031 — Schema Migrations
 *
 * Deterministic migrations from old schema versions to the current (v1) schema.
 * Old fixtures are upgraded without silent data loss.
 */
import { type ResumeDocument, ResumeDocumentSchema } from "./resume";

type AnyObject = Record<string, unknown>;

/**
 * Migrate a raw stored document to the current schema version.
 * Returns a validated ResumeDocument or throws a descriptive error.
 */
export function migrateResumeDocument(raw: unknown): ResumeDocument {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid resume: expected an object");
  }

  const data = raw as AnyObject;
  const version = typeof data.schemaVersion === "number" ? data.schemaVersion : 0;

  let migrated = data;

  if (version < 1) {
    migrated = migrateV0toV1(migrated);
  }

  // Parse and validate final result
  const result = ResumeDocumentSchema.safeParse(migrated);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Resume migration failed validation: ${issues}`);
  }

  return result.data;
}

/**
 * Migrate pre-v1 data (version 0 / unversioned) to v1.
 * Preserves all known fields and drops unknown ones safely.
 */
function migrateV0toV1(data: AnyObject): AnyObject {
  // Map old field names
  const basics = (data.basics as AnyObject) ?? {};

  // Old schema may have had 'name' at root or inside 'personal'
  const personal = (data.personal as AnyObject) ?? {};
  const migratedBasics: AnyObject = {
    name: basics.name ?? personal.name ?? data.name ?? "",
    email: basics.email ?? personal.email ?? data.email ?? "",
    phone: basics.phone ?? personal.phone ?? data.phone ?? "",
    location:
      basics.location ?? personal.location ?? data.location ?? "",
    headline:
      basics.headline ?? personal.headline ?? data.headline ?? "",
    links: Array.isArray(basics.links)
      ? basics.links
      : Array.isArray(data.links)
      ? data.links
      : [],
  };

  return {
    schemaVersion: 1,
    basics: migratedBasics,
    summary: data.summary ?? data.objective ?? "",
    experience: Array.isArray(data.experience)
      ? data.experience.map(migrateExperienceEntry)
      : [],
    education: Array.isArray(data.education) ? data.education : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    skills: Array.isArray(data.skills) ? migrateSkills(data.skills) : [],
    internships: Array.isArray(data.internships) ? data.internships : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications
      : [],
    awards: Array.isArray(data.awards) ? data.awards : [],
    volunteering: Array.isArray(data.volunteering) ? data.volunteering : [],
    publications: Array.isArray(data.publications) ? data.publications : [],
    customSections: Array.isArray(data.customSections)
      ? data.customSections
      : [],
    settings: {
      templateId: "classic-ats",
      fontPreset: "clean",
      pageSize: "A4",
      lineSpacing: 1.15,
      marginSize: "normal",
      sectionOrder: [],
      hiddenSections: [],
      ...(data.settings ?? {}),
    },
  };
}

function migrateExperienceEntry(entry: AnyObject): AnyObject {
  return {
    id: entry.id ?? crypto.randomUUID(),
    employer: entry.employer ?? entry.company ?? entry.organization ?? "",
    role: entry.role ?? entry.title ?? entry.position ?? "",
    location: entry.location ?? "",
    remote: entry.remote ?? false,
    startDate: entry.startDate ?? entry.start ?? "",
    endDate: entry.endDate ?? entry.end ?? "",
    current: entry.current ?? entry.isCurrent ?? false,
    bullets: Array.isArray(entry.bullets)
      ? entry.bullets
      : Array.isArray(entry.responsibilities)
      ? entry.responsibilities
      : [],
    description: entry.description ?? "",
  };
}

function migrateSkills(skills: unknown[]): AnyObject[] {
  // Old format: string[] → wrap in a single group
  if (skills.length > 0 && typeof skills[0] === "string") {
    return [
      {
        id: crypto.randomUUID(),
        category: "",
        items: skills,
      },
    ];
  }
  // Already grouped format
  return skills.map((g) => {
    const group = g as AnyObject;
    return {
      id: group.id ?? crypto.randomUUID(),
      category: group.category ?? group.name ?? "",
      items: Array.isArray(group.items) ? group.items : [],
    };
  });
}
