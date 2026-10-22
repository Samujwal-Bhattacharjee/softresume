/**
 * RS-092 — Transparent Skill & Keyword Coverage Engine
 *
 * Compares job requirements against explicit evidence across the ResumeDocument.
 * Uses a maintainable synonym map and distinguishes required vs preferred criteria.
 *
 * Strict Principles:
 * - Transparent Heuristic: Described as keyword/qualification alignment, NEVER a "guaranteed ATS pass".
 * - Concrete Evidence: Matched items point directly to specific resume sections/bullets.
 * - Truth Preservation: Missing items explicitly remind the candidate never to fabricate skills.
 */

import type { ResumeDocument } from "@/lib/schemas/resume";
import type { RequirementItem } from "@/lib/schemas/job-target";
import type {
  JobMatchResult,
  RequirementMatchEvidence,
  EvidenceItem,
  MissingRequirementItem,
  AtsFinding,
} from "./types";

/**
 * Maintainable synonym map for tech stacks, tools, and industry terms.
 * Each canonical key maps to lowercased alternative phrases.
 */
export const SYNONYM_MAP: Record<string, string[]> = {
  react: ["react", "react.js", "reactjs"],
  typescript: ["typescript", "ts"],
  javascript: ["javascript", "js", "ecmascript"],
  node: ["node", "node.js", "nodejs"],
  python: ["python", "py"],
  golang: ["golang", "go"],
  kubernetes: ["kubernetes", "k8s"],
  docker: ["docker", "containerization", "containers"],
  aws: ["aws", "amazon web services"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  azure: ["azure", "microsoft azure"],
  "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous deployment"],
  postgresql: ["postgresql", "postgres"],
  mongodb: ["mongodb", "mongo"],
  graphql: ["graphql", "gql"],
  rest: ["rest", "restful", "rest api", "restful api", "restful apis"],
  "machine learning": ["machine learning", "ml"],
  "artificial intelligence": ["artificial intelligence", "ai", "llm", "generative ai"],
  sql: ["sql", "rdbms", "relational database"],
  qa: ["qa", "quality assurance", "automated testing", "e2e testing", "unit testing"],
  agile: ["agile", "scrum", "sprints", "kanban"],
  css: ["css", "css3", "tailwind", "sass", "styling"],
  html: ["html", "html5", "semantic html"],
  linux: ["linux", "unix", "bash", "shell scripting"],
  redis: ["redis", "in-memory cache", "caching"],
  kafka: ["kafka", "message queue", "event streaming", "pub/sub"],
};

export interface ResumeEvidenceLocation {
  section:
    | "basics"
    | "summary"
    | "skills"
    | "experience"
    | "projects"
    | "education"
    | "internships"
    | "certifications"
    | "publications"
    | "awards"
    | "volunteering";
  label: string;
  text: string;
}

/**
 * Strips diacritics, normalizes whitespace, and lowercases text.
 */
export function normalizeKeyword(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Creates a bounded snippet centered around the matched keyword occurrence.
 */
export function generateExcerpt(
  fullText: string,
  matchIdx: number,
  termLen: number,
  maxLen = 110
): string {
  const trimmed = fullText.trim();
  if (trimmed.length <= maxLen) return trimmed;
  if (matchIdx < 0 || matchIdx >= trimmed.length) {
    return trimmed.slice(0, maxLen).trim() + "…";
  }
  const half = Math.floor((maxLen - termLen) / 2);
  let start = Math.max(0, matchIdx - half);
  const end = Math.min(trimmed.length, start + maxLen);
  if (end - start < maxLen && start > 0) {
    start = Math.max(0, end - maxLen);
  }
  let snippet = trimmed.slice(start, end).trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < trimmed.length) snippet = snippet + "…";
  return snippet;
}

/**
 * Grounded heuristic section inference for unmet/missing requirements.
 */
export function inferSuggestedSection(requirementText: string): {
  section: string;
  label: string;
  reason: string;
} {
  const lower = requirementText.toLowerCase();

  // Education / credentials
  if (
    /\b(degree|bachelor|master|phd|bs|ms|mba|diploma|computer science|engineering|university|college|gpa)\b/i.test(
      lower
    )
  ) {
    return {
      section: "education",
      label: "Education",
      reason: "Degree, field of study, or academic credential requirement.",
    };
  }

  // Experience / leadership / tenure
  if (
    /\b(\d+\+?\s*years?|lead|manage|direct|architect|mentor|collaborat|deliver|ship|scale|scrum|cross-functional)\b/i.test(
      lower
    )
  ) {
    return {
      section: "experience",
      label: "Experience",
      reason: "Demonstrated track record, leadership, or tenure expectation.",
    };
  }

  // Certifications
  if (
    /\b(certified|certification|aws certified|pmp|cissp|comptia|scrum master|csm)\b/i.test(
      lower
    )
  ) {
    return {
      section: "certifications",
      label: "Certifications",
      reason: "Formal industry or professional certification.",
    };
  }

  // Default to skills or experience
  return {
    section: "skills",
    label: "Skills or Experience",
    reason: "Technical proficiency, tooling, or competency keyword.",
  };
}

/**
 * Extracts indexed evidence blocks from a resume document.
 */
export function extractResumeEvidence(doc: ResumeDocument): ResumeEvidenceLocation[] {
  const blocks: ResumeEvidenceLocation[] = [];

  if (doc.basics.headline) {
    blocks.push({
      section: "basics",
      label: "Contact > Headline",
      text: doc.basics.headline,
    });
  }

  if (doc.summary) {
    blocks.push({
      section: "summary",
      label: "Summary",
      text: doc.summary,
    });
  }

  // Skills
  doc.skills.forEach((group) => {
    group.items.forEach((item) => {
      blocks.push({
        section: "skills",
        label: `Skills > ${group.category || "General"}`,
        text: item,
      });
    });
  });

  // Experience
  doc.experience.forEach((exp) => {
    const parent = `${exp.role || "Role"} at ${exp.employer || "Company"}`;
    blocks.push({
      section: "experience",
      label: `Experience > ${parent}`,
      text: `${exp.role} ${exp.employer}`,
    });
    exp.bullets.forEach((bullet) => {
      blocks.push({
        section: "experience",
        label: `Experience > ${parent}`,
        text: bullet,
      });
    });
  });

  // Projects
  doc.projects.forEach((proj) => {
    const tech = (proj.technologies || []).join(", ");
    blocks.push({
      section: "projects",
      label: `Projects > ${proj.name || "Project"}`,
      text: `${proj.name} ${tech} ${proj.description || ""}`,
    });
    (proj.bullets || []).forEach((bullet) => {
      blocks.push({
        section: "projects",
        label: `Projects > ${proj.name || "Project"}`,
        text: bullet,
      });
    });
  });

  // Education
  doc.education.forEach((edu) => {
    const degree = [edu.degree, edu.field].filter(Boolean).join(" in ");
    const text = [degree, edu.institution, ...(edu.coursework || [])].join(" ");
    blocks.push({
      section: "education",
      label: `Education > ${edu.institution || "Institution"}`,
      text,
    });
  });

  // Internships
  doc.internships.forEach((intern) => {
    const parent = `${intern.role || "Intern"} at ${intern.employer || "Company"}`;
    blocks.push({
      section: "internships",
      label: `Internships > ${parent}`,
      text: `${intern.role} ${intern.employer}`,
    });
    intern.bullets.forEach((bullet) => {
      blocks.push({
        section: "internships",
        label: `Internships > ${parent}`,
        text: bullet,
      });
    });
  });

  // Certifications
  (doc.certifications || []).forEach((cert) => {
    blocks.push({
      section: "certifications",
      label: `Certifications > ${cert.name || "Certification"}`,
      text: [cert.name, cert.issuer].filter(Boolean).join(" "),
    });
  });

  // Awards
  (doc.awards || []).forEach((award) => {
    blocks.push({
      section: "awards",
      label: `Awards > ${award.title || "Award"}`,
      text: [award.title, award.issuer, award.description].filter(Boolean).join(" "),
    });
  });

  // Volunteering
  (doc.volunteering || []).forEach((vol) => {
    blocks.push({
      section: "volunteering",
      label: `Volunteering > ${vol.role || "Volunteer"}`,
      text: [vol.role, vol.organization, ...(vol.bullets || []), vol.description]
        .filter(Boolean)
        .join(" "),
    });
  });

  // Publications
  (doc.publications || []).forEach((pub) => {
    blocks.push({
      section: "publications",
      label: `Publications > ${pub.title || "Publication"}`,
      text: [pub.title, pub.authors, pub.venue, pub.description]
        .filter(Boolean)
        .join(" "),
    });
  });

  return blocks;
}

/**
 * Searches for occurrences of a search term (or its known synonyms) in evidence blocks.
 */
export function findRequirementEvidence(
  requirementText: string,
  evidenceBlocks: ResumeEvidenceLocation[]
): {
  locations: string[];
  isStrong: boolean;
  matchedItems: EvidenceItem[];
  primarySection?: string;
  primaryLabel?: string;
  excerpt?: string;
} {
  const cleanReq = normalizeKeyword(requirementText);
  if (!cleanReq) {
    return { locations: [], isStrong: false, matchedItems: [] };
  }

  // Find synonym variations
  const variations: string[] = [cleanReq];
  // Add hyphenated and unhyphenated variants
  if (cleanReq.includes("-")) {
    variations.push(cleanReq.replace(/-/g, " "));
    variations.push(cleanReq.replace(/-/g, ""));
  }
  for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (synonyms.some((s) => cleanReq === s || cleanReq.includes(s))) {
      variations.push(...synonyms);
      variations.push(canonical);
      break;
    }
  }
  const uniqueVariations = Array.from(new Set(variations));

  const matchedLocations: string[] = [];
  const matchedItems: EvidenceItem[] = [];
  let directSkillMatch = false;

  for (const block of evidenceBlocks) {
    const blockNorm = normalizeKeyword(block.text);

    for (const v of uniqueVariations) {
      let matched = false;
      let matchIdx = -1;

      if (v.length <= 3) {
        // Word boundary match for short words (e.g. "go", "ts", "ai", "aws")
        const regex = new RegExp(
          `(^|\\W)${v.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")}($|\\W)`,
          "i"
        );
        const match = regex.exec(blockNorm);
        if (match) {
          matched = true;
          matchIdx = match.index + (match[1] ? match[1].length : 0);
        }
      } else {
        matchIdx = blockNorm.indexOf(v);
        if (matchIdx !== -1) {
          matched = true;
        }
      }

      if (matched) {
        if (block.section === "skills") {
          directSkillMatch = true;
        }
        const excerpt = generateExcerpt(block.text, matchIdx, v.length);
        const locString = `${block.label}: "${
          block.text.length > 80 ? block.text.slice(0, 77) + "..." : block.text
        }"`;
        if (!matchedLocations.includes(locString)) {
          matchedLocations.push(locString);
          matchedItems.push({
            section: block.section,
            label: block.label,
            text: block.text,
            excerpt,
            matchedTerm: v,
          });
        }
        break; // Matched this block, stop checking other variations for this block
      }
    }
  }

  const isStrong = directSkillMatch || matchedLocations.length >= 2;

  // Select primary section: skills first, then experience, then first available
  const primaryItem =
    matchedItems.find((i) => i.section === "skills") ||
    matchedItems.find((i) => i.section === "experience") ||
    matchedItems[0];

  return {
    locations: Array.from(new Set(matchedLocations)),
    isStrong,
    matchedItems,
    primarySection: primaryItem?.section,
    primaryLabel: primaryItem?.label,
    excerpt: primaryItem?.excerpt,
  };
}

/**
 * Evaluates transparent keyword coverage for structured Job Target requirements.
 */
export function evaluateJobRequirementsCoverage(
  document: ResumeDocument,
  requirements: RequirementItem[]
): JobMatchResult {
  if (!requirements || requirements.length === 0) {
    return {
      analyzed: false,
      matchedKeywords: [],
      missingKeywords: [],
      findings: [],
    };
  }

  const evidenceBlocks = extractResumeEvidence(document);

  const matchedRequirements: RequirementMatchEvidence[] = [];
  const missingRequirements: MissingRequirementItem[] = [];
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  let requiredTotal = 0;
  let requiredMatched = 0;
  let preferredTotal = 0;
  let preferredMatched = 0;

  for (const req of requirements) {
    const { locations, isStrong, matchedItems, primarySection, primaryLabel, excerpt } =
      findRequirementEvidence(req.text, evidenceBlocks);

    if (req.type === "required") {
      requiredTotal++;
      if (locations.length > 0) {
        requiredMatched++;
        matchedKeywords.push(req.text);
        matchedRequirements.push({
          requirementText: req.text,
          type: req.type,
          evidenceLocations: locations,
          isStrong,
          primarySection,
          primaryLabel,
          excerpt,
          matchedItems,
        });
      } else {
        missingKeywords.push(req.text);
        const suggested = inferSuggestedSection(req.text);
        missingRequirements.push({
          text: req.text,
          type: req.type,
          suggestedSection: suggested.section,
          suggestedSectionLabel: suggested.label,
          suggestionReason: suggested.reason,
        });
      }
    } else if (req.type === "preferred") {
      preferredTotal++;
      if (locations.length > 0) {
        preferredMatched++;
        matchedKeywords.push(req.text);
        matchedRequirements.push({
          requirementText: req.text,
          type: req.type,
          evidenceLocations: locations,
          isStrong,
          primarySection,
          primaryLabel,
          excerpt,
          matchedItems,
        });
      } else {
        missingKeywords.push(req.text);
        const suggested = inferSuggestedSection(req.text);
        missingRequirements.push({
          text: req.text,
          type: req.type,
          suggestedSection: suggested.section,
          suggestedSectionLabel: suggested.label,
          suggestionReason: suggested.reason,
        });
      }
    } else {
      // Responsibility or other
      if (locations.length > 0) {
        matchedKeywords.push(req.text);
        matchedRequirements.push({
          requirementText: req.text,
          type: req.type,
          evidenceLocations: locations,
          isStrong,
          primarySection,
          primaryLabel,
          excerpt,
          matchedItems,
        });
      } else {
        missingKeywords.push(req.text);
        const suggested = inferSuggestedSection(req.text);
        missingRequirements.push({
          text: req.text,
          type: req.type,
          suggestedSection: suggested.section,
          suggestedSectionLabel: suggested.label,
          suggestionReason: suggested.reason,
        });
      }
    }
  }

  const reqScore = requiredTotal > 0 ? Math.round((requiredMatched / requiredTotal) * 100) : 100;
  const prefScore = preferredTotal > 0 ? Math.round((preferredMatched / preferredTotal) * 100) : 100;

  // Weighted overall heuristic coverage: 70% required, 30% preferred
  let overallScore = 100;
  if (requiredTotal > 0 && preferredTotal > 0) {
    overallScore = Math.round(reqScore * 0.7 + prefScore * 0.3);
  } else if (requiredTotal > 0) {
    overallScore = reqScore;
  } else if (preferredTotal > 0) {
    overallScore = prefScore;
  }

  // Findings
  const findings: AtsFinding[] = [];

  const missingRequired = missingRequirements.filter((r) => r.type === "required");
  if (missingRequired.length > 0) {
    findings.push({
      ruleId: "job_match.required.missing",
      category: "job-match",
      severity: missingRequired.length > 3 ? "warning" : "suggestion",
      title: `${missingRequired.length} Required Qualifications Not Evidenced`,
      message: `The target role lists the following required qualifications not yet reflected on your resume: ${missingRequired.slice(0, 5).map((r) => r.text).join(", ")}.`,
      whyItMatters: "Recruiters and automated filters screen specifically for required baseline skills.",
      recommendedFix: "If you have real experience with these areas, incorporate them into your skills or project bullets. Never fabricate skills.",
      sectionId: "skills",
      evidence: missingRequired.map((r) => r.text).join(", "),
    });
  }

  const missingPreferred = missingRequirements.filter((r) => r.type === "preferred");
  if (missingPreferred.length > 0) {
    findings.push({
      ruleId: "job_match.preferred.missing",
      category: "job-match",
      severity: "suggestion",
      title: `${missingPreferred.length} Preferred Skills Omitted`,
      message: `Preferred / nice-to-have skills not found: ${missingPreferred.slice(0, 5).map((r) => r.text).join(", ")}.`,
      whyItMatters: "Preferred qualifications distinguish competitive candidates in closely matched applicant pools.",
      recommendedFix: "Add genuine evidence for any preferred skills you possess.",
      sectionId: "skills",
      evidence: missingPreferred.map((r) => r.text).join(", "),
    });
  }

  return {
    analyzed: true,
    score: overallScore,
    requiredScore: reqScore,
    preferredScore: prefScore,
    matchedKeywords,
    missingKeywords,
    matchedRequirements,
    missingRequirements,
    findings,
  };
}
