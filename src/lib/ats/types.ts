/**
 * RS-100 — ATS Readiness Engine Finding Contract & Types
 *
 * Defines the structured findings produced by the deterministic ATS
 * readiness and content completeness engine.
 */

import type { ResumeDocument, PresentationSettings } from "@/lib/schemas/resume";
import type { RequirementItem } from "@/lib/schemas/job-target";

export type FindingCategory =
  | "parse-readiness"
  | "content-completeness"
  | "writing-quality"
  | "job-match";

export type FindingSeverity = "error" | "warning" | "suggestion" | "info";

export type TargetPersona =
  | "fresher"
  | "internship"
  | "experienced"
  | "career-switcher"
  | "technical"
  | "creative"
  | "general";

export interface AtsFinding {
  /** Stable identifier for test assertions and UI anchors */
  ruleId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  message: string;
  whyItMatters: string;
  recommendedFix: string;
  /** Section key to navigate to in the editor */
  sectionId: string;
  /** Optional specific field path for focused highlighting */
  fieldPath?: string;
  autoFixable?: boolean;
  evidence?: string;
  /** Whether the finding is subjective writing style guidance vs objective rule failure */
  isSubjective?: boolean;
}

export interface CategorySummary {
  score: number; // 0-100 internal readiness index
  totalChecks: number;
  passedChecks: number;
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
}

export interface EvidenceItem {
  section: string;
  label: string;
  text: string;
  excerpt: string;
  matchedTerm: string;
}

export interface RequirementMatchEvidence {
  requirementText: string;
  type: "required" | "preferred" | "responsibility" | "other";
  evidenceLocations: string[];
  isStrong: boolean;
  primarySection?: string;
  primaryLabel?: string;
  excerpt?: string;
  matchedItems?: EvidenceItem[];
}

export interface MissingRequirementItem {
  text: string;
  type: string;
  suggestedSection?: string;
  suggestedSectionLabel?: string;
  suggestionReason?: string;
}

export interface JobMatchResult {
  analyzed: boolean;
  score?: number;
  requiredScore?: number;
  preferredScore?: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedRequirements?: RequirementMatchEvidence[];
  missingRequirements?: MissingRequirementItem[];
  findings: AtsFinding[];
}

import type { AtsCheckItem } from "./rules-catalog";

export interface AtsEvaluationResult {
  findings: AtsFinding[];
  parseReadiness: CategorySummary;
  contentCompleteness: CategorySummary;
  writingQuality: CategorySummary;
  jobMatch: JobMatchResult;
  evaluatedAt: string;
  checks?: Record<FindingCategory, AtsCheckItem[]>;
}

export interface AtsEvaluationInput {
  document: ResumeDocument;
  settings?: PresentationSettings;
  persona?: TargetPersona;
  targetRole?: string;
  jobDescription?: string;
  requirements?: RequirementItem[];
}
