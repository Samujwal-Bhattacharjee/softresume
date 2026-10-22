/**
 * RS-090 — Job Target Data Model
 *
 * Stores target role title, company label, pasted job description,
 * extracted requirements, user-corrected requirements, timestamps,
 * and association to a specific resume document.
 *
 * Privacy & Retention Architecture:
 * - 100% Client-Owned: Job target data is stored exclusively in client-side
 *   storage (e.g. browser LocalStorage) associated with the user's resume ID.
 * - Zero Server Retention: Server route handlers parse pasted descriptions
 *   ephemerally in memory without logging or retaining candidate inputs.
 * - Deletion: Removing a job target immediately purges it from local storage.
 * - Input Boundaries: Raw descriptions are capped at 10,000 characters to prevent
 *   browser freezing or excessive token consumption.
 */

import { z } from "zod";

export const RequirementTypeSchema = z.enum([
  "required",
  "preferred",
  "responsibility",
  "other",
]);
export type RequirementType = z.infer<typeof RequirementTypeSchema>;

export const RequirementItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(200),
  type: RequirementTypeSchema,
  sourcePhrase: z.string().trim().max(300).default(""),
  confidence: z.enum(["high", "medium", "low"]).default("high"),
  userAdded: z.boolean().default(false),
  userModified: z.boolean().default(false),
});
export type RequirementItem = z.infer<typeof RequirementItemSchema>;

export const JobTargetSchema = z.object({
  id: z.string().min(1),
  resumeId: z.string().min(1),
  roleTitle: z.string().trim().max(120).default(""),
  company: z.string().trim().max(120).default(""),
  jobDescription: z.string().trim().max(10000).default(""),
  requirements: z.array(RequirementItemSchema).max(100).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type JobTarget = z.infer<typeof JobTargetSchema>;

export function createEmptyJobTarget(resumeId: string): JobTarget {
  const now = new Date().toISOString();
  return {
    id: `job-target-${Date.now()}`,
    resumeId,
    roleTitle: "",
    company: "",
    jobDescription: "",
    requirements: [],
    createdAt: now,
    updatedAt: now,
  };
}
