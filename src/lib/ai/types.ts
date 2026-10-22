/**
 * RS-080 / RS-081 — AI Provider Types and Contract
 * RS-083 — Summary Helper types added
 * RS-091 — Job Requirement Extraction types added
 */

export type AIErrorCode =
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "INVALID_REQUEST"
  | "PROVIDER_ERROR"
  | "TIMEOUT"
  | "VALIDATION_FAILED";

export interface AIProviderError {
  code: AIErrorCode;
  message: string;
  isRetryable: boolean;
}

// ─────────────────────────────────────────────
// Bullet Improvement (RS-082)
// ─────────────────────────────────────────────

export interface BulletImprovementRequest {
  bullet: string;
  context?: {
    role?: string;
    employer?: string;
    technologies?: string[];
  };
  targetRole?: string;
}

export interface BulletImprovementResponse {
  proposed: string;
  explanation: string;
  followUpQuestions: string[];
  assumptions: string[];
  preservedFacts: string[];
}

// ─────────────────────────────────────────────
// Summary Helper (RS-083)
// ─────────────────────────────────────────────

export interface SummaryResumeContext {
  existingSummary?: string;
  targetRole?: string;
  experience: Array<{
    role: string;
    employer: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree?: string;
    field?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    technologies?: string[];
  }>;
  skills: Array<{
    category?: string;
    items: string[];
  }>;
  internships: Array<{
    role: string;
    employer: string;
    bullets: string[];
  }>;
  certifications: string[];
}

export interface SummaryImprovementRequest {
  context: SummaryResumeContext;
}

export interface SummaryImprovementResponse {
  proposed: string;
  explanation: string;
  followUpQuestions: string[];
  assumptions: string[];
  evidencedFacts: string[];
  insufficientData: boolean;
}

// ─────────────────────────────────────────────
// Job Requirement Extraction (RS-091)
// ─────────────────────────────────────────────

export interface JobRequirementExtractionRequest {
  jobDescription: string;
}

export interface ExtractedRequirement {
  text: string;
  type: "required" | "preferred" | "responsibility" | "other";
  sourcePhrase: string;
  confidence: "high" | "medium" | "low";
}

export interface JobRequirementExtractionResponse {
  roleTitle: string;
  requiredSkills: ExtractedRequirement[];
  preferredSkills: ExtractedRequirement[];
  responsibilities: ExtractedRequirement[];
  experienceRequirements: ExtractedRequirement[];
  otherRequirements: ExtractedRequirement[];
  extractionWarnings: string[];
}

// ─────────────────────────────────────────────
// AIProvider Interface
// ─────────────────────────────────────────────

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  improveBullet(req: BulletImprovementRequest): Promise<BulletImprovementResponse>;
  improveSummary(req: SummaryImprovementRequest): Promise<SummaryImprovementResponse>;
  extractJobRequirements(req: JobRequirementExtractionRequest): Promise<JobRequirementExtractionResponse>;
}
