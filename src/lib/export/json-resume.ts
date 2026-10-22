/**
 * RS-097 — Standard JSON Resume Bi-directional Adapter
 *
 * Implements standard JSON Resume (v1.0.0, jsonresume.org) export and import.
 *
 * Principles:
 * - Dedicated transformation module keeping parsing, schema mapping, and validation
 *   strictly separated from UI components.
 * - Standard JSON Resume schema compliant payload; never confuses with proprietary app backups.
 * - Non-destructive: imports are parsed and validated into memory first;
 *   persisted only upon explicit user confirmation.
 * - Zero AI / zero network: deterministic, offline conversion.
 * - High-fidelity round tripping with documented loss boundaries.
 */

import {
  ResumeDocumentSchema,
  type ResumeDocument,
  createEmptyResume,
} from "@/lib/schemas/resume";
import { generateId } from "@/lib/utils";

// Maximum allowed input file size (1MB)
export const MAX_JSON_RESUME_SIZE = 1_048_576;

/**
 * Standard JSON Resume v1.0.0 Interface Definition
 */
export interface StandardJsonResume {
  $schema?: string;
  basics?: {
    name?: string;
    label?: string;
    image?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: Array<{
      network?: string;
      username?: string;
      url?: string;
    }>;
  };
  work?: Array<{
    name?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  volunteer?: Array<{
    organization?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    url?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
  }>;
  awards?: Array<{
    title?: string;
    date?: string;
    awarder?: string;
    summary?: string;
  }>;
  certificates?: Array<{
    name?: string;
    date?: string;
    issuer?: string;
    url?: string;
  }>;
  publications?: Array<{
    name?: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
    summary?: string;
  }>;
  skills?: Array<{
    name?: string;
    level?: string;
    keywords?: string[];
  }>;
  languages?: Array<{
    language?: string;
    fluency?: string;
  }>;
  interests?: Array<{
    name?: string;
    keywords?: string[];
  }>;
  references?: Array<{
    name?: string;
    reference?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  meta?: {
    canonical?: string;
    version?: string;
    lastModified?: string;
  };
  /** SoftCV extensions for 100% round-trip fidelity */
  "x-softcv"?: {
    internships?: unknown[];
    customSections?: unknown[];
    settings?: unknown;
  };
}

export interface JsonResumeImportSummary {
  name: string;
  headline?: string;
  sectionsImported: string[];
  sectionsUnmapped: string[];
  counts: {
    experience: number;
    education: number;
    skills: number;
    projects: number;
    certifications: number;
    awards: number;
    volunteering: number;
    publications: number;
  };
}

export interface JsonResumeImportResult {
  success: boolean;
  document?: ResumeDocument;
  error?: string;
  warnings: string[];
  summary?: JsonResumeImportSummary;
}

/**
 * Normalizes a date string to conform to SoftCV dateSchema:
 * YYYY, YYYY-MM, YYYY-MM-DD, or "Present"
 */
function normalizeDateString(dateStr?: string): string | undefined {
  if (!dateStr || typeof dateStr !== "string") return undefined;
  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;

  if (/^(present|current)$/i.test(trimmed)) return "Present";

  // Standard ISO: YYYY-MM-DD, YYYY-MM, YYYY
  const isoMatch = trimmed.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (isoMatch) {
    if (isoMatch[3]) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    if (isoMatch[2]) return `${isoMatch[1]}-${isoMatch[2]}`;
    return isoMatch[1];
  }

  // Attempt Date parsing for strings like "Jan 2022" or "2022/05"
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  // If cannot be parsed deterministically, omit to prevent schema validation rejection
  return undefined;
}

/**
 * Validates whether a URL string is valid and bounded.
 */
function normalizeUrlString(urlStr?: string): string | undefined {
  if (!urlStr || typeof urlStr !== "string") return undefined;
  const trimmed = urlStr.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.href.slice(0, 500);
  } catch {
    return undefined;
  }
}

/**
 * Converts a SoftCV ResumeDocument into the standard JSON Resume v1.0.0 format.
 */
export function exportToJsonResume(doc: ResumeDocument): StandardJsonResume {
  const result: StandardJsonResume = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: doc.basics.name || undefined,
      label: doc.basics.headline || undefined,
      email: doc.basics.email || undefined,
      phone: doc.basics.phone || undefined,
      summary: doc.summary || undefined,
      location: doc.basics.location
        ? {
            city: doc.basics.location,
          }
        : undefined,
      profiles:
        (doc.basics.links || []).length > 0
          ? doc.basics.links.map((link) => ({
              network: link.label || "Link",
              url: link.url,
            }))
          : undefined,
    },
    work:
      (doc.experience || []).length > 0
        ? doc.experience.map((exp) => ({
            name: exp.employer,
            position: exp.role,
            startDate: exp.startDate || undefined,
            endDate: exp.endDate || undefined,
            highlights: exp.bullets && exp.bullets.length > 0 ? exp.bullets : undefined,
            summary: exp.description || undefined,
          }))
        : undefined,
    education:
      (doc.education || []).length > 0
        ? doc.education.map((edu) => ({
            institution: edu.institution,
            studyType: edu.degree || undefined,
            area: edu.field || undefined,
            startDate: edu.startDate || undefined,
            endDate: edu.endDate || undefined,
            score: edu.grade || undefined,
            courses: edu.coursework && edu.coursework.length > 0 ? edu.coursework : undefined,
          }))
        : undefined,
    skills:
      (doc.skills || []).length > 0
        ? doc.skills.map((skill) => ({
            name: skill.category || "General",
            keywords: skill.items,
          }))
        : undefined,
    projects:
      (doc.projects || []).length > 0
        ? doc.projects.map((proj) => ({
            name: proj.name,
            description: proj.description || undefined,
            highlights: proj.bullets && proj.bullets.length > 0 ? proj.bullets : undefined,
            keywords: proj.technologies && proj.technologies.length > 0 ? proj.technologies : undefined,
            url: proj.url || undefined,
            startDate: proj.startDate || undefined,
            endDate: proj.endDate || undefined,
          }))
        : undefined,
    awards:
      (doc.awards || []).length > 0
        ? doc.awards.map((award) => ({
            title: award.title,
            awarder: award.issuer || undefined,
            date: award.date || undefined,
            summary: award.description || undefined,
          }))
        : undefined,
    certificates:
      (doc.certifications || []).length > 0
        ? doc.certifications.map((cert) => ({
            name: cert.name,
            issuer: cert.issuer || undefined,
            date: cert.date || undefined,
            url: cert.url || undefined,
          }))
        : undefined,
    publications:
      (doc.publications || []).length > 0
        ? doc.publications.map((pub) => ({
            name: pub.title,
            publisher: pub.venue || undefined,
            releaseDate: pub.date || undefined,
            url: pub.url || undefined,
            summary: pub.description || undefined,
          }))
        : undefined,
    volunteer:
      (doc.volunteering || []).length > 0
        ? doc.volunteering.map((vol) => ({
            organization: vol.organization,
            position: vol.role || undefined,
            startDate: vol.startDate || undefined,
            endDate: vol.endDate || undefined,
            highlights: vol.bullets && vol.bullets.length > 0 ? vol.bullets : undefined,
            summary: vol.description || undefined,
          }))
        : undefined,
    meta: {
      canonical: "https://jsonresume.org",
      version: "v1.0.0",
      lastModified: new Date().toISOString(),
    },
    // Preserve SoftCV-specific data for transparent round-tripping
    "x-softcv": {
      internships: doc.internships || [],
      customSections: doc.customSections || [],
      settings: doc.settings,
    },
  };

  return result;
}

/**
 * Parses and maps a standard JSON Resume payload into the SoftCV ResumeDocument schema.
 * Rejects invalid JSON, oversized files, and invalid shapes without modifying state.
 */
export function importFromJsonResume(rawJson: string): JsonResumeImportResult {
  const warnings: string[] = [];

  // 1. File size check
  if (!rawJson || rawJson.length > MAX_JSON_RESUME_SIZE) {
    return {
      success: false,
      error: `File size exceeds the 1MB limit (${Math.round(rawJson?.length || 0) / 1024} KB).`,
      warnings,
    };
  }

  // 2. Parse JSON safely
  let payload: unknown;
  try {
    payload = JSON.parse(rawJson);
  } catch (err) {
    return {
      success: false,
      error: `Malformed JSON: ${err instanceof Error ? err.message : "Parsing failed"}.`,
      warnings,
    };
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {
      success: false,
      error: "Invalid JSON Resume structure: root must be a JSON object.",
      warnings,
    };
  }

  const data = payload as StandardJsonResume;
  const sectionsImported: string[] = [];
  const sectionsUnmapped: string[] = [];

  // Track unmapped standard JSON Resume sections
  if (data.languages && data.languages.length > 0) {
    sectionsUnmapped.push("Languages (not modeled in active templates)");
    warnings.push("Languages section is not supported in SoftCV templates and was omitted.");
  }
  if (data.interests && data.interests.length > 0) {
    sectionsUnmapped.push("Interests");
    warnings.push("Interests section is not modeled in SoftCV templates and was omitted.");
  }
  if (data.references && data.references.length > 0) {
    sectionsUnmapped.push("References (available on request)");
    warnings.push("References section was omitted in compliance with modern ATS best practices.");
  }

  // 3. Construct candidate SoftCV document skeleton
  const draft = createEmptyResume();

  // Basics mapping
  if (data.basics) {
    sectionsImported.push("Basics / Contact");
    draft.basics.name = (data.basics.name || "").slice(0, 120).trim();
    draft.basics.headline = (data.basics.label || "").slice(0, 120).trim();

    if (data.basics.email) {
      draft.basics.email = data.basics.email.slice(0, 254).trim();
    }
    if (data.basics.phone) {
      draft.basics.phone = data.basics.phone.slice(0, 30).trim();
    }

    // Location mapping: city, region, countryCode
    if (data.basics.location) {
      const loc = data.basics.location;
      const parts = [loc.city, loc.region, loc.countryCode].filter(Boolean);
      if (parts.length > 0) {
        draft.basics.location = parts.join(", ").slice(0, 120);
      } else if (loc.address) {
        draft.basics.location = loc.address.slice(0, 120);
      }
    }

    // Profiles & URL -> Links
    const links: Array<{ label: string; url: string }> = [];
    if (data.basics.url) {
      const validUrl = normalizeUrlString(data.basics.url);
      if (validUrl) {
        links.push({ label: "Portfolio", url: validUrl });
      }
    }
    if (Array.isArray(data.basics.profiles)) {
      data.basics.profiles.forEach((p) => {
        const validUrl = normalizeUrlString(p.url);
        if (validUrl) {
          links.push({
            label: (p.network || "Profile").slice(0, 60),
            url: validUrl,
          });
        }
      });
    }
    draft.basics.links = links.slice(0, 10);

    // Summary
    if (data.basics.summary) {
      draft.summary = data.basics.summary.slice(0, 2000).trim();
      sectionsImported.push("Professional Summary");
    }
  }

  // Work -> Experience
  if (Array.isArray(data.work) && data.work.length > 0) {
    sectionsImported.push("Experience");
    draft.experience = data.work.slice(0, 50).map((w) => ({
      id: generateId(),
      employer: (w.name || "Company").slice(0, 120).trim(),
      role: (w.position || "Role").slice(0, 120).trim(),
      startDate: normalizeDateString(w.startDate),
      endDate: normalizeDateString(w.endDate),
      current: /present/i.test(w.endDate || ""),
      bullets: (w.highlights || [])
        .filter((h): h is string => typeof h === "string")
        .slice(0, 20)
        .map((h) => h.slice(0, 400).trim()),
      description: w.summary ? w.summary.slice(0, 1000).trim() : undefined,
    }));
  }

  // Education -> Education
  if (Array.isArray(data.education) && data.education.length > 0) {
    sectionsImported.push("Education");
    draft.education = data.education.slice(0, 50).map((e) => ({
      id: generateId(),
      institution: (e.institution || "Institution").slice(0, 120).trim(),
      degree: e.studyType ? e.studyType.slice(0, 100).trim() : undefined,
      field: e.area ? e.area.slice(0, 100).trim() : undefined,
      startDate: normalizeDateString(e.startDate),
      endDate: normalizeDateString(e.endDate),
      current: /present/i.test(e.endDate || ""),
      grade: e.score ? e.score.slice(0, 50).trim() : undefined,
      coursework: (e.courses || [])
        .filter((c): c is string => typeof c === "string")
        .slice(0, 20)
        .map((c) => c.slice(0, 80).trim()),
    }));
  }

  // Skills -> Skills
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    sectionsImported.push("Skills");
    draft.skills = data.skills.slice(0, 20).map((s) => ({
      id: generateId(),
      category: (s.name || "Skills").slice(0, 60).trim(),
      items: (s.keywords || [])
        .filter((k): k is string => typeof k === "string")
        .slice(0, 30)
        .map((k) => k.slice(0, 80).trim()),
    }));
  }

  // Projects -> Projects
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    sectionsImported.push("Projects");
    draft.projects = data.projects.slice(0, 50).map((p) => ({
      id: generateId(),
      name: (p.name || "Project").slice(0, 120).trim(),
      description: p.description ? p.description.slice(0, 1000).trim() : undefined,
      technologies: (p.keywords || [])
        .filter((k): k is string => typeof k === "string")
        .slice(0, 20)
        .map((k) => k.slice(0, 60).trim()),
      bullets: (p.highlights || [])
        .filter((h): h is string => typeof h === "string")
        .slice(0, 20)
        .map((h) => h.slice(0, 400).trim()),
      url: normalizeUrlString(p.url),
      startDate: normalizeDateString(p.startDate),
      endDate: normalizeDateString(p.endDate),
    }));
  }

  // Awards -> Awards
  if (Array.isArray(data.awards) && data.awards.length > 0) {
    sectionsImported.push("Awards");
    draft.awards = data.awards.slice(0, 50).map((a) => ({
      id: generateId(),
      title: (a.title || "Award").slice(0, 200).trim(),
      issuer: a.awarder ? a.awarder.slice(0, 200).trim() : undefined,
      date: normalizeDateString(a.date),
      description: a.summary ? a.summary.slice(0, 500).trim() : undefined,
    }));
  }

  // Certificates -> Certifications
  if (Array.isArray(data.certificates) && data.certificates.length > 0) {
    sectionsImported.push("Certifications");
    draft.certifications = data.certificates.slice(0, 50).map((c) => ({
      id: generateId(),
      name: (c.name || "Certification").slice(0, 200).trim(),
      issuer: c.issuer ? c.issuer.slice(0, 200).trim() : undefined,
      date: normalizeDateString(c.date),
      url: normalizeUrlString(c.url),
    }));
  }

  // Publications -> Publications
  if (Array.isArray(data.publications) && data.publications.length > 0) {
    sectionsImported.push("Publications");
    draft.publications = data.publications.slice(0, 50).map((p) => ({
      id: generateId(),
      title: (p.name || "Publication").slice(0, 500).trim(),
      venue: p.publisher ? p.publisher.slice(0, 200).trim() : undefined,
      date: normalizeDateString(p.releaseDate),
      url: normalizeUrlString(p.url),
      description: p.summary ? p.summary.slice(0, 2000).trim() : undefined,
    }));
  }

  // Volunteer -> Volunteering
  if (Array.isArray(data.volunteer) && data.volunteer.length > 0) {
    sectionsImported.push("Volunteering");
    draft.volunteering = data.volunteer.slice(0, 50).map((v) => ({
      id: generateId(),
      organization: (v.organization || "Organization").slice(0, 200).trim(),
      role: v.position ? v.position.slice(0, 200).trim() : undefined,
      startDate: normalizeDateString(v.startDate),
      endDate: normalizeDateString(v.endDate),
      current: /present/i.test(v.endDate || ""),
      bullets: (v.highlights || [])
        .filter((h): h is string => typeof h === "string")
        .slice(0, 10)
        .map((h) => h.slice(0, 400).trim()),
      description: v.summary ? v.summary.slice(0, 2000).trim() : undefined,
    }));
  }

  // Round-trip SoftCV extension restoration
  if (data["x-softcv"]) {
    const ext = data["x-softcv"];
    if (Array.isArray(ext.internships) && ext.internships.length > 0) {
      draft.internships = ext.internships as ResumeDocument["internships"];
      sectionsImported.push("Internships (restored from SoftCV extension)");
    }
    if (Array.isArray(ext.customSections) && ext.customSections.length > 0) {
      draft.customSections = ext.customSections as ResumeDocument["customSections"];
      sectionsImported.push("Custom Sections (restored from SoftCV extension)");
    }
    if (ext.settings && typeof ext.settings === "object") {
      draft.settings = { ...draft.settings, ...(ext.settings as Partial<ResumeDocument["settings"]>) };
    }
  }

  // 4. Validate output with canonical ResumeDocumentSchema
  const parseResult = ResumeDocumentSchema.safeParse(draft);
  if (!parseResult.success) {
    const issueMessages = parseResult.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      success: false,
      error: `JSON Resume validation failed against internal schema: ${issueMessages}`,
      warnings,
    };
  }

  const validatedDoc = parseResult.data;

  const summary: JsonResumeImportSummary = {
    name: validatedDoc.basics.name || "Unnamed Candidate",
    headline: validatedDoc.basics.headline || undefined,
    sectionsImported: Array.from(new Set(sectionsImported)),
    sectionsUnmapped,
    counts: {
      experience: validatedDoc.experience.length,
      education: validatedDoc.education.length,
      skills: validatedDoc.skills.length,
      projects: validatedDoc.projects.length,
      certifications: validatedDoc.certifications?.length || 0,
      awards: validatedDoc.awards?.length || 0,
      volunteering: validatedDoc.volunteering?.length || 0,
      publications: validatedDoc.publications?.length || 0,
    },
  };

  return {
    success: true,
    document: validatedDoc,
    warnings,
    summary,
  };
}
