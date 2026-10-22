/**
 * RS-081 — AI Request and Response Schemas (Zod)
 * RS-083 — Summary Helper schemas added
 * RS-091 — Job Requirement Extraction schemas added
 *
 * Validates untrusted client input and untrusted AI model output.
 * Ensures model outputs are strictly shaped and cannot inject arbitrary HTML or properties.
 */
import { z } from "zod";

// ─────────────────────────────────────────────
// Bullet Improvement (RS-082)
// ─────────────────────────────────────────────

export const BulletImprovementRequestSchema = z.object({
  bullet: z
    .string()
    .trim()
    .min(3, "Bullet must be at least 3 characters")
    .max(500, "Bullet must be 500 characters or fewer"),
  context: z
    .object({
      role: z.string().trim().max(100).optional(),
      employer: z.string().trim().max(100).optional(),
      technologies: z.array(z.string().trim().max(50)).max(20).optional(),
    })
    .optional(),
  targetRole: z.string().trim().max(100).optional(),
  roleCoachingGuidance: z.string().trim().max(500).optional(),
  evidenceExpectations: z.array(z.string().trim().max(100)).max(10).optional(),
});

export const BulletImprovementResponseSchema = z.object({
  proposed: z
    .string()
    .trim()
    .min(3, "Proposed bullet must be at least 3 characters")
    .max(600, "Proposed bullet exceeds 600 character limit"),
  explanation: z
    .string()
    .trim()
    .min(5, "Explanation must be at least 5 characters")
    .max(400, "Explanation must be 400 characters or fewer"),
  followUpQuestions: z
    .array(z.string().trim().max(250))
    .max(5)
    .default([]),
  assumptions: z
    .array(z.string().trim().max(250))
    .max(5)
    .default([]),
  preservedFacts: z
    .array(z.string().trim().max(250))
    .max(10)
    .default([]),
});

export type BulletImprovementRequestInput = z.infer<typeof BulletImprovementRequestSchema>;
export type BulletImprovementResponseOutput = z.infer<typeof BulletImprovementResponseSchema>;

// ─────────────────────────────────────────────
// Summary Helper (RS-083)
// ─────────────────────────────────────────────

const ExperienceContextSchema = z.object({
  role: z.string().trim().max(100),
  employer: z.string().trim().max(100),
  bullets: z.array(z.string().trim().max(400)).max(10),
});

const EducationContextSchema = z.object({
  institution: z.string().trim().max(120),
  degree: z.string().trim().max(120).optional(),
  field: z.string().trim().max(120).optional(),
});

const ProjectContextSchema = z.object({
  name: z.string().trim().max(120),
  description: z.string().trim().max(500).optional(),
  technologies: z.array(z.string().trim().max(50)).max(20).optional(),
});

const SkillContextSchema = z.object({
  category: z.string().trim().max(80).optional(),
  items: z.array(z.string().trim().max(80)).max(30),
});

const InternshipContextSchema = z.object({
  role: z.string().trim().max(100),
  employer: z.string().trim().max(100),
  bullets: z.array(z.string().trim().max(400)).max(10),
});

export const SummaryImprovementRequestSchema = z.object({
  context: z.object({
    existingSummary: z.string().trim().max(2000).optional(),
    targetRole: z.string().trim().max(100).optional(),
    roleCoachingGuidance: z.string().trim().max(500).optional(),
    experience: z.array(ExperienceContextSchema).max(10),
    education: z.array(EducationContextSchema).max(5),
    projects: z.array(ProjectContextSchema).max(10),
    skills: z.array(SkillContextSchema).max(10),
    internships: z.array(InternshipContextSchema).max(5),
    certifications: z.array(z.string().trim().max(120)).max(10),
  }),
});

export const SummaryImprovementResponseSchema = z.object({
  proposed: z.string().trim().max(1000).default(""),
  explanation: z.string().trim().max(600),
  followUpQuestions: z.array(z.string().trim().max(250)).max(5).default([]),
  assumptions: z.array(z.string().trim().max(250)).max(5).default([]),
  evidencedFacts: z.array(z.string().trim().max(250)).max(10).default([]),
  insufficientData: z.boolean().default(false),
});

export type SummaryImprovementRequestInput = z.infer<typeof SummaryImprovementRequestSchema>;
export type SummaryImprovementResponseOutput = z.infer<typeof SummaryImprovementResponseSchema>;

// ─────────────────────────────────────────────
// Job Requirement Extraction (RS-091)
// ─────────────────────────────────────────────

export const JobRequirementExtractionRequestSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(50, "Job description must be at least 50 characters")
    .max(10000, "Job description must be 10,000 characters or fewer"),
});

const ExtractedRequirementSchema = z.object({
  text: z.string().trim().max(200),
  type: z.enum(["required", "preferred", "responsibility", "other"]),
  sourcePhrase: z.string().trim().max(300),
  confidence: z.enum(["high", "medium", "low"]),
});

export const JobRequirementExtractionResponseSchema = z.object({
  roleTitle: z.string().trim().max(120).default(""),
  requiredSkills: z.array(ExtractedRequirementSchema).max(30).default([]),
  preferredSkills: z.array(ExtractedRequirementSchema).max(30).default([]),
  responsibilities: z.array(ExtractedRequirementSchema).max(20).default([]),
  experienceRequirements: z.array(ExtractedRequirementSchema).max(10).default([]),
  otherRequirements: z.array(ExtractedRequirementSchema).max(10).default([]),
  extractionWarnings: z.array(z.string().trim().max(200)).max(5).default([]),
});

export type JobRequirementExtractionRequestInput = z.infer<typeof JobRequirementExtractionRequestSchema>;
export type JobRequirementExtractionResponseOutput = z.infer<typeof JobRequirementExtractionResponseSchema>;
