/**
 * RS-030 — Canonical Versioned Resume Schema
 *
 * This is the single source of truth for all resume data.
 * The editor, templates, AI context, checks, and exports all consume this schema.
 * Templates must never mutate or own this data.
 *
 * schemaVersion: 1 (semver-like integer for deterministic migration)
 */
import { z } from "zod";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const MAX_SHORT = 200;
const MAX_MEDIUM = 500;
const MAX_LONG = 2000;
const MAX_BULLET = 400;
const MAX_URL = 500;
const MAX_BULLETS = 20;
const MAX_ITEMS = 50;

const urlSchema = z
  .string()
  .max(MAX_URL, "URL too long")
  .url("Must be a valid URL")
  .or(z.literal(""))
  .optional();

const dateSchema = z
  .string()
  .max(30, "Date too long")
  .regex(
    /^(\d{4}(-\d{2}(-\d{2})?)?|present|Present|current|Current|)$/,
    'Use YYYY, YYYY-MM, YYYY-MM-DD, or "Present"'
  )
  .optional();

const stableId = z.string().min(1, "ID required").max(50, "ID too long");

// ─────────────────────────────────────────────
// Contact / Basics
// ─────────────────────────────────────────────

export const LinkSchema = z.object({
  label: z.string().max(60, "Label too long"),
  url: z.string().max(MAX_URL, "URL too long"),
});

export const BasicsSchema = z.object({
  name: z.string().max(120, "Name too long").default(""),
  email: z
    .string()
    .email("Must be a valid email")
    .max(254, "Email too long")
    .or(z.literal(""))
    .optional(),
  phone: z.string().max(30, "Phone too long").optional(),
  location: z.string().max(120, "Location too long").optional(),
  headline: z.string().max(MAX_SHORT, "Headline too long").optional(),
  links: z.array(LinkSchema).max(10, "Too many links"),
});

// ─────────────────────────────────────────────
// Experience
// ─────────────────────────────────────────────

export const ExperienceEntrySchema = z.object({
  id: stableId,
  employer: z.string().min(1, "Employer required").max(MAX_SHORT, "Too long"),
  role: z.string().min(1, "Role required").max(MAX_SHORT, "Too long"),
  location: z.string().max(100, "Location too long").optional(),
  remote: z.boolean().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  current: z.boolean().optional(),
  bullets: z
    .array(z.string().max(MAX_BULLET, "Bullet too long"))
    .max(MAX_BULLETS, "Too many bullets"),
  description: z.string().max(MAX_LONG, "Description too long").optional(),
});

export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;

// ─────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────

export const EducationEntrySchema = z.object({
  id: stableId,
  institution: z
    .string()
    .min(1, "Institution required")
    .max(MAX_SHORT, "Too long"),
  degree: z.string().max(MAX_SHORT, "Too long").optional(),
  field: z.string().max(MAX_SHORT, "Too long").optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  current: z.boolean().optional(),
  grade: z.string().max(50, "Too long").optional(),
  location: z.string().max(100, "Too long").optional(),
  details: z.string().max(MAX_LONG, "Too long").optional(),
  coursework: z.array(z.string().max(MAX_SHORT, "Too long")).max(20).optional(),
  honors: z.string().max(MAX_MEDIUM, "Too long").optional(),
});

export type EducationEntry = z.infer<typeof EducationEntrySchema>;

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────

export const ProjectEntrySchema = z.object({
  id: stableId,
  name: z.string().min(1, "Project name required").max(MAX_SHORT, "Too long"),
  description: z.string().max(MAX_LONG, "Too long").optional(),
  bullets: z
    .array(z.string().max(MAX_BULLET, "Bullet too long"))
    .max(MAX_BULLETS)
    .optional(),
  technologies: z
    .array(z.string().max(50, "Technology name too long"))
    .max(30)
    .optional(),
  url: urlSchema,
  repoUrl: urlSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  highlights: z.string().max(MAX_MEDIUM, "Too long").optional(),
});

export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;

// ─────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────

export const SkillGroupSchema = z.object({
  id: stableId,
  category: z.string().max(80, "Category name too long").optional(),
  items: z.array(z.string().max(80, "Skill name too long")).max(40),
});

export type SkillGroup = z.infer<typeof SkillGroupSchema>;

// ─────────────────────────────────────────────
// Internships
// ─────────────────────────────────────────────

export const InternshipEntrySchema = ExperienceEntrySchema;
export type InternshipEntry = z.infer<typeof InternshipEntrySchema>;

// ─────────────────────────────────────────────
// Certifications
// ─────────────────────────────────────────────

export const CertificationEntrySchema = z.object({
  id: stableId,
  name: z
    .string()
    .min(1, "Certification name required")
    .max(MAX_SHORT, "Too long"),
  issuer: z.string().max(MAX_SHORT, "Too long").optional(),
  date: dateSchema,
  expiryDate: dateSchema,
  credentialId: z.string().max(100, "Too long").optional(),
  url: urlSchema,
});

export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;

// ─────────────────────────────────────────────
// Awards
// ─────────────────────────────────────────────

export const AwardEntrySchema = z.object({
  id: stableId,
  title: z.string().min(1, "Award title required").max(MAX_SHORT, "Too long"),
  issuer: z.string().max(MAX_SHORT, "Too long").optional(),
  date: dateSchema,
  description: z.string().max(MAX_MEDIUM, "Too long").optional(),
});

export type AwardEntry = z.infer<typeof AwardEntrySchema>;

// ─────────────────────────────────────────────
// Volunteering / Activities / Leadership
// ─────────────────────────────────────────────

export const VolunteeringEntrySchema = z.object({
  id: stableId,
  organization: z
    .string()
    .min(1, "Organization required")
    .max(MAX_SHORT, "Too long"),
  role: z.string().max(MAX_SHORT, "Too long").optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  current: z.boolean().optional(),
  bullets: z
    .array(z.string().max(MAX_BULLET, "Bullet too long"))
    .max(10)
    .optional(),
  description: z.string().max(MAX_LONG, "Too long").optional(),
});

export type VolunteeringEntry = z.infer<typeof VolunteeringEntrySchema>;

// ─────────────────────────────────────────────
// Publications / Research
// ─────────────────────────────────────────────

export const PublicationEntrySchema = z.object({
  id: stableId,
  title: z
    .string()
    .min(1, "Publication title required")
    .max(MAX_MEDIUM, "Too long"),
  authors: z.string().max(MAX_MEDIUM, "Too long").optional(),
  venue: z.string().max(MAX_SHORT, "Too long").optional(),
  date: dateSchema,
  url: urlSchema,
  description: z.string().max(MAX_LONG, "Too long").optional(),
});

export type PublicationEntry = z.infer<typeof PublicationEntrySchema>;

// ─────────────────────────────────────────────
// Custom Sections
// ─────────────────────────────────────────────

export const CustomSectionItemSchema = z.object({
  id: stableId,
  title: z.string().max(MAX_SHORT, "Too long").optional(),
  subtitle: z.string().max(MAX_SHORT, "Too long").optional(),
  date: dateSchema,
  bullets: z
    .array(z.string().max(MAX_BULLET, "Bullet too long"))
    .max(MAX_BULLETS)
    .optional(),
  description: z.string().max(MAX_LONG, "Too long").optional(),
  url: urlSchema,
});

export const CustomSectionSchema = z.object({
  id: stableId,
  title: z
    .string()
    .min(1, "Section title required")
    .max(80, "Title too long"),
  items: z.array(CustomSectionItemSchema).max(MAX_ITEMS),
});

export type CustomSectionItem = z.infer<typeof CustomSectionItemSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;

// ─────────────────────────────────────────────
// Presentation Settings (separate from content)
// ─────────────────────────────────────────────

export const TEMPLATE_IDS = [
  "classic-ats",
  "modern-editorial",
  "fresher-graduate",
  "technical",
  "experienced",
  "creative",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const FONT_PRESETS = ["clean", "corporate", "editorial", "serif"] as const;
export type FontPreset = (typeof FONT_PRESETS)[number];

export const PAGE_SIZES = ["A4", "US_LETTER"] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const SECTION_KEYS = [
  "basics",
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "internships",
  "certifications",
  "awards",
  "volunteering",
  "publications",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number] | string;

export const MARGIN_SIZES = ["compact", "normal", "spacious"] as const;
export type MarginSize = (typeof MARGIN_SIZES)[number];

export const PresentationSettingsSchema = z.object({
  templateId: z.enum(TEMPLATE_IDS).default("classic-ats"),
  fontPreset: z.enum(FONT_PRESETS).default("clean"),
  accentColor: z.string().max(20, "Color too long").optional(),
  pageSize: z.enum(PAGE_SIZES).default("A4"),
  lineSpacing: z.number().min(1.0).max(2.0).default(1.15),
  marginSize: z.enum(MARGIN_SIZES).default("normal"),
  sectionOrder: z.array(z.string()).default([]),
  hiddenSections: z.array(z.string()).default([]),
});

export type PresentationSettings = z.infer<typeof PresentationSettingsSchema>;

// ─────────────────────────────────────────────
// Root: ResumeDocument
// ─────────────────────────────────────────────

export const ResumeDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  basics: BasicsSchema,
  summary: z.string().max(MAX_LONG, "Summary too long").optional(),
  experience: z.array(ExperienceEntrySchema).max(MAX_ITEMS),
  education: z.array(EducationEntrySchema).max(MAX_ITEMS),
  projects: z.array(ProjectEntrySchema).max(MAX_ITEMS),
  skills: z.array(SkillGroupSchema).max(20),
  internships: z.array(InternshipEntrySchema).max(MAX_ITEMS),
  certifications: z.array(CertificationEntrySchema).max(MAX_ITEMS),
  awards: z.array(AwardEntrySchema).max(MAX_ITEMS),
  volunteering: z.array(VolunteeringEntrySchema).max(MAX_ITEMS),
  publications: z.array(PublicationEntrySchema).max(MAX_ITEMS),
  customSections: z.array(CustomSectionSchema).max(10),
  settings: PresentationSettingsSchema,
});

export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;

// ─────────────────────────────────────────────
// Factory: empty resume skeleton
// ─────────────────────────────────────────────

export function createEmptyResume(
  overrides?: Partial<ResumeDocument>
): ResumeDocument {
  return {
    schemaVersion: 1,
    basics: {
      name: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      links: [],
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    internships: [],
    certifications: [],
    awards: [],
    volunteering: [],
    publications: [],
    customSections: [],
    settings: {
      templateId: "classic-ats",
      fontPreset: "clean",
      pageSize: "A4",
      lineSpacing: 1.15,
      marginSize: "normal",
      sectionOrder: [],
      hiddenSections: [],
    },
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Metadata wrapper (for persistence layer)
// ─────────────────────────────────────────────

export const ResumeMetaSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().max(120, "Title too long").default("Untitled Resume"),
  isMaster: z.boolean().default(true),
  parentResumeId: z.string().uuid().nullable().optional(),
  jobTargetId: z.string().uuid().nullable().optional(),
  rolePreset: z.string().max(80, "Too long").optional(),
  document: ResumeDocumentSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ResumeMeta = z.infer<typeof ResumeMetaSchema>;
