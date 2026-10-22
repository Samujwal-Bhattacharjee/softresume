/**
 * RS-095 — ATS Readiness Rules Catalog & Scoring Explainability Definitions
 *
 * Single source of truth for all deterministic readiness checks across:
 * 1. Parse Readiness (structural/readability/layout checks)
 * 2. Content Completeness (role/persona-aware information coverage)
 * 3. Writing Quality (objective vs subjective style guidance)
 * 4. Job Match (transparent keyword & requirement coverage)
 *
 * Provides typed definitions, explicit pass conditions, actionable remediation steps,
 * and deterministic scoring formulas. Works 100% offline in local-first/demo mode.
 */

import type { FindingCategory, FindingSeverity, AtsFinding, AtsEvaluationInput } from "./types";

export interface AtsRuleDefinition {
  ruleId: string;
  category: FindingCategory;
  title: string;
  description: string;
  passCondition: string;
  remediation: string;
  whyItMatters: string;
  sectionId: string;
  fieldPath?: string;
  defaultSeverity: FindingSeverity;
  isSubjective?: boolean;
}

export interface CategoryScoringGuide {
  category: FindingCategory;
  title: string;
  description: string;
  baseScore: number;
  scoringFormula: string;
  penalties: {
    error: number;
    warning: number;
    suggestion: number;
  };
  scoreBands: Array<{
    min: number;
    max: number;
    label: string;
    interpretation: string;
  }>;
  disclaimer: string;
}

export interface AtsCheckItem {
  ruleId: string;
  category: FindingCategory;
  title: string;
  description: string;
  passCondition: string;
  remediation: string;
  whyItMatters: string;
  sectionId: string;
  fieldPath?: string;
  status: "passed" | "incomplete";
  severity?: FindingSeverity;
  isSubjective?: boolean;
  evidence?: string;
  finding?: AtsFinding;
}

// ─────────────────────────────────────────────
// 1. RULE CATALOG (Single Source of Truth)
// ─────────────────────────────────────────────

export const ATS_RULES_CATALOG: Record<string, AtsRuleDefinition> = {
  // ── Parse Readiness Rules ──
  "contact.name": {
    ruleId: "contact.name",
    category: "parse-readiness",
    title: "Full Candidate Name",
    description: "Verifies the resume document includes the candidate's full legal or professional name.",
    passCondition: "Name field is populated with non-whitespace text.",
    remediation: "Enter your full name in the Personal Information section.",
    whyItMatters: "ATS parsers use the candidate name as the primary profile identifier and database key.",
    sectionId: "basics",
    fieldPath: "basics.name",
    defaultSeverity: "error",
  },
  "contact.method": {
    ruleId: "contact.method",
    category: "parse-readiness",
    title: "Direct Contact Method",
    description: "Verifies that at least one direct contact channel (email address or phone number) is present.",
    passCondition: "At least one non-empty email address or phone number is provided.",
    remediation: "Provide at least a valid email address in the Personal Information section.",
    whyItMatters: "Recruiters and automated scheduling systems cannot reach you without direct contact details.",
    sectionId: "basics",
    fieldPath: "basics.email",
    defaultSeverity: "error",
  },
  "contact.email_format": {
    ruleId: "contact.email_format",
    category: "parse-readiness",
    title: "Valid Email Address Syntax",
    description: "Validates that the provided email address follows standard RFC email formatting.",
    passCondition: "Email matches valid standard format (e.g. name@example.com).",
    remediation: "Correct the email address format in the Personal Information section.",
    whyItMatters: "Parsers extracting contact details will reject or fail to deliver notifications on malformed addresses.",
    sectionId: "basics",
    fieldPath: "basics.email",
    defaultSeverity: "error",
  },
  "contact.link_validity": {
    ruleId: "contact.link_validity",
    category: "parse-readiness",
    title: "External Link Integrity",
    description: "Verifies that social, portfolio, and project links have non-empty URLs with standard https:// protocols.",
    passCondition: "All links contain destination URLs beginning with https://.",
    remediation: "Provide valid URLs with explicit https:// protocols or remove broken links.",
    whyItMatters: "Broken or protocol-less links appear unprofessional and fail to generate clickable links in PDF viewers.",
    sectionId: "basics",
    fieldPath: "basics.links",
    defaultSeverity: "warning",
  },
  "section.custom_headings": {
    ruleId: "section.custom_headings",
    category: "parse-readiness",
    title: "Standard Section Headings",
    description: "Checks custom section titles against standard industry resume terminology.",
    passCondition: "All custom section headings use recognizable professional terms.",
    remediation: "Rename custom sections to standard terminology (e.g. Leadership, Activities, Additional Projects).",
    whyItMatters: "Corporate ATS scanners categorize experience using standard headings and may discard unconventional titles.",
    sectionId: "customSections",
    defaultSeverity: "warning",
  },
  "template.layout_safety": {
    ruleId: "template.layout_safety",
    category: "parse-readiness",
    title: "Template Layout Architecture",
    description: "Evaluates whether the active template uses single-column ATS-safe linear layout vs expressive multi-column design.",
    passCondition: "Selected template is rated ATS-safe with single-column linear reading order.",
    remediation: "Switch to 'Classic ATS' or 'Modern Editorial' for standard corporate job board applications.",
    whyItMatters: "Legacy ATS document scanners read multi-column layouts horizontally across column boundaries, jumbling content.",
    sectionId: "settings",
    defaultSeverity: "warning",
  },
  "format.spacing": {
    ruleId: "format.spacing",
    category: "parse-readiness",
    title: "Line Spacing & Font Readability",
    description: "Checks that line spacing allows adequate breathing room and prevents overlapping lines in exports.",
    passCondition: "Line spacing is configured to at least 1.05 (normal: 1.15 recommended).",
    remediation: "Set line spacing to at least 1.15 in Template Settings.",
    whyItMatters: "Overly tight line spacing can cause adjacent lines to touch, confusing OCR and text extraction.",
    sectionId: "settings",
    defaultSeverity: "warning",
  },
  "writing.bullet.empty": {
    ruleId: "writing.bullet.empty",
    category: "parse-readiness",
    title: "Complete Bullet Point Items",
    description: "Ensures bullet lists contain actual text and no blank empty bullet circles.",
    passCondition: "All bullet points contain non-empty accomplishment text.",
    remediation: "Remove blank bullet items or fill in your accomplishment.",
    whyItMatters: "Empty bullet circles print onto the exported document and appear untidy.",
    sectionId: "experience",
    defaultSeverity: "warning",
  },

  // ── Content Completeness Rules ──
  "completeness.education": {
    ruleId: "completeness.education",
    category: "content-completeness",
    title: "Education & Academic Credentials",
    description: "Verifies the presence of academic degree, institution name, and completion dates.",
    passCondition: "At least one education entry is present.",
    remediation: "Add your university, expected or past graduation date, and degree in Education.",
    whyItMatters: "Education credentials are a primary screening filter for graduates, early-career, and accredited roles.",
    sectionId: "education",
    defaultSeverity: "error",
  },
  "completeness.experience": {
    ruleId: "completeness.experience",
    category: "content-completeness",
    title: "Work & Employment History",
    description: "Checks for professional roles, employer names, and employment dates.",
    passCondition: "At least one professional work experience entry is present.",
    remediation: "Add your previous and current professional roles in Experience.",
    whyItMatters: "Work history provides verified chronological evidence of professional progression and scope.",
    sectionId: "experience",
    defaultSeverity: "error",
  },
  "completeness.skills": {
    ruleId: "completeness.skills",
    category: "content-completeness",
    title: "Categorized Skills Inventory",
    description: "Verifies that core skills are organized into recognizable categories.",
    passCondition: "At least one skill category with skill items is defined.",
    remediation: "Add a categorized Skills section (e.g. Languages, Frameworks, Developer Tools).",
    whyItMatters: "ATS keyword matching engines scan directly for technical and professional competencies in skills lists.",
    sectionId: "skills",
    defaultSeverity: "warning",
  },
  "completeness.projects": {
    ruleId: "completeness.projects",
    category: "content-completeness",
    title: "Demonstrated Projects & Work",
    description: "Checks for practical projects, capstone initiatives, or open-source repositories.",
    passCondition: "At least one project entry is present.",
    remediation: "Add 1–3 capstone, hackathon, course, or personal projects in Projects.",
    whyItMatters: "Projects demonstrate hands-on applied ability, especially critical for students and engineering roles.",
    sectionId: "projects",
    defaultSeverity: "warning",
  },
  "completeness.summary": {
    ruleId: "completeness.summary",
    category: "content-completeness",
    title: "Professional Summary / Executive Profile",
    description: "Checks for a concise professional summary framing seniority and expertise.",
    passCondition: "Professional summary is populated with 2–4 sentences.",
    remediation: "Add a 2–3 sentence summary in the Professional Summary section.",
    whyItMatters: "An executive summary quickly communicates seniority level, domain focus, and key accomplishments to human recruiters.",
    sectionId: "summary",
    defaultSeverity: "suggestion",
  },
  "completeness.bullets": {
    ruleId: "completeness.bullets",
    category: "content-completeness",
    title: "Accomplishment Bullet Points",
    description: "Ensures roles have descriptive accomplishment bullets rather than title-only placeholders.",
    passCondition: "Work experience roles contain at least one descriptive bullet point.",
    remediation: "Add 2–4 accomplishment bullet points for each position.",
    whyItMatters: "Recruiters and ATS parse bullets for responsibilities, tools, and measurable achievements.",
    sectionId: "experience",
    defaultSeverity: "warning",
  },
  "completeness.location": {
    ruleId: "completeness.location",
    category: "content-completeness",
    title: "Geographic Location",
    description: "Checks that city, state, or country is specified in personal details.",
    passCondition: "Candidate location field is populated.",
    remediation: "Add your city and country or state (e.g. London, UK or Seattle, WA) in Personal Information.",
    whyItMatters: "Many ATS filters screen candidates by geographic region, relocation status, or timezone availability.",
    sectionId: "basics",
    fieldPath: "basics.location",
    defaultSeverity: "suggestion",
  },
  "completeness.tech_repo": {
    ruleId: "completeness.tech_repo",
    category: "content-completeness",
    title: "Code Repository / Portfolio Link",
    description: "Checks for GitHub, GitLab, or portfolio links for technical/software personas.",
    passCondition: "At least one code repository or portfolio URL is present.",
    remediation: "Add a link to your GitHub, GitLab, or portfolio in Personal Information.",
    whyItMatters: "Engineering hiring managers frequently inspect code samples, architecture, and open-source contributions.",
    sectionId: "basics",
    defaultSeverity: "suggestion",
  },
  "completeness.general_content": {
    ruleId: "completeness.general_content",
    category: "content-completeness",
    title: "Core Portfolio Substance",
    description: "Verifies the document contains either demonstrable work history or projects.",
    passCondition: "Resume contains at least one experience or project entry.",
    remediation: "Add your work experience or highlight key projects.",
    whyItMatters: "A resume must contain demonstrable evidence of employment or academic output.",
    sectionId: "experience",
    defaultSeverity: "warning",
  },
  "completeness.density": {
    ruleId: "completeness.density",
    category: "content-completeness",
    title: "Content Density & Margins",
    description: "Checks that page density does not cause visual fatigue.",
    passCondition: "Content volume is balanced with margin sizing.",
    remediation: "Consider normal margins and pruning older or less relevant bullet points in Settings.",
    whyItMatters: "Densely packed pages are visually fatiguing for human recruiters after ATS screening.",
    sectionId: "settings",
    defaultSeverity: "suggestion",
  },

  // ── Writing Quality Rules ──
  "writing.date.chronology": {
    ruleId: "writing.date.chronology",
    category: "writing-quality",
    title: "Chronological Date Order",
    description: "Verifies that role and education start dates precede their end dates.",
    passCondition: "All date ranges are chronological (start date precedes end date).",
    remediation: "Check and correct the start and end dates.",
    whyItMatters: "Chronological inconsistencies confuse parsing systems and undermine resume credibility.",
    sectionId: "experience",
    defaultSeverity: "warning",
    isSubjective: false,
  },
  "writing.bullet.action_verbs": {
    ruleId: "writing.bullet.action_verbs",
    category: "writing-quality",
    title: "Active Action Verb Openings",
    description: "Checks that bullet points lead with active verbs rather than passive phrases ('responsible for', 'helped with').",
    passCondition: "Bullets begin with active power verbs (e.g. Engineered, Spearheaded, Accelerated).",
    remediation: "Rewrite the bullet opening with a strong action verb.",
    whyItMatters: "Active verbs demonstrate direct ownership, initiative, and measurable contribution.",
    sectionId: "experience",
    defaultSeverity: "suggestion",
    isSubjective: true,
  },
  "writing.buzzwords": {
    ruleId: "writing.buzzwords",
    category: "writing-quality",
    title: "Avoid Overused Buzzwords",
    description: "Checks for generic fluff terms ('rockstar', 'ninja', 'guru', 'synergy', 'think outside the box').",
    passCondition: "No overused buzzwords found in bullet text.",
    remediation: "Replace generic buzzwords with concrete evidence or specific outcomes.",
    whyItMatters: "Recruiters look for verifiable technical and professional skills rather than self-descriptive buzzwords.",
    sectionId: "experience",
    defaultSeverity: "suggestion",
    isSubjective: true,
  },
  "writing.repetition": {
    ruleId: "writing.repetition",
    category: "writing-quality",
    title: "Varied Action Vocabulary",
    description: "Ensures bullet points do not repeatedly start with the same action verb across positions.",
    passCondition: "No verb is repeated 3 or more times as a bullet opening.",
    remediation: "Vary opening verbs across bullets (e.g. Architected, Spearheaded, Accelerated, Engineered).",
    whyItMatters: "Varying your action verbs demonstrates diverse strengths and prevents monotonous reading.",
    sectionId: "experience",
    defaultSeverity: "suggestion",
    isSubjective: true,
  },
  "writing.metrics": {
    ruleId: "writing.metrics",
    category: "writing-quality",
    title: "Quantifiable Metrics & Evidence",
    description: "Checks that experience bullet points include measurable outcomes, percentages, or numbers.",
    passCondition: "At least one bullet per role includes numeric or percentage metrics.",
    remediation: "Where truthful, add measurable outcomes, metrics, or team/scale indicators. Never fabricate unsupported metrics.",
    whyItMatters: "Quantifiable evidence (such as latency reduced by 40%, team size of 8, or $100k savings) provides concrete proof of capability.",
    sectionId: "experience",
    defaultSeverity: "suggestion",
    isSubjective: true,
  },
  "writing.punctuation": {
    ruleId: "writing.punctuation",
    category: "writing-quality",
    title: "Consistent Bullet Punctuation",
    description: "Checks for consistent punctuation across bullet point endings.",
    passCondition: "Bullets consistently either all end with a period or all omit periods.",
    remediation: "Standardize your bullets so either all end with a period or none do.",
    whyItMatters: "Consistent punctuation across lists gives your document a clean, professional finish.",
    sectionId: "experience",
    defaultSeverity: "suggestion",
    isSubjective: true,
  },
};

// ─────────────────────────────────────────────
// 2. CATEGORY SCORING GUIDES
// ─────────────────────────────────────────────

export const CATEGORY_SCORING_GUIDES: Record<FindingCategory, CategoryScoringGuide> = {
  "parse-readiness": {
    category: "parse-readiness",
    title: "Parse Readiness Index",
    description: "Evaluates standard structural constraints that determine whether automated ATS systems can cleanly extract your contact identity and sections.",
    baseScore: 100,
    scoringFormula: "Score = 100 - (Errors × 25) - (Warnings × 10) - (Suggestions × 3)",
    penalties: { error: 25, warning: 10, suggestion: 3 },
    scoreBands: [
      { min: 90, max: 100, label: "Parse Ready", interpretation: "Satisfies all conservative structural, formatting, and identity heuristics." },
      { min: 70, max: 89, label: "Needs Attention", interpretation: "Minor structural or layout settings may impede automated text extraction." },
      { min: 0, max: 69, label: "Critical Issues", interpretation: "Missing essential identity or contact data required for profile creation." },
    ],
    disclaimer: "These are resume-content and formatting heuristics. Results are guidance, not a guarantee of ATS acceptance or hiring outcomes.",
  },
  "content-completeness": {
    category: "content-completeness",
    title: "Profile Completeness Score",
    description: "Evaluates the depth and presence of core resume sections against standard recruiter expectations for your target role context.",
    baseScore: 100,
    scoringFormula: "Score = 100 - (Errors × 25) - (Warnings × 10) - (Suggestions × 3)",
    penalties: { error: 25, warning: 10, suggestion: 3 },
    scoreBands: [
      { min: 90, max: 100, label: "Comprehensive", interpretation: "All recommended sections, roles, and accomplishments for your target persona are present." },
      { min: 70, max: 89, label: "Moderate Coverage", interpretation: "Core sections exist but key supporting sections (e.g. projects, summary) are omitted." },
      { min: 0, max: 69, label: "Sparse Content", interpretation: "Key qualifying credentials (e.g. education or experience) are missing." },
    ],
    disclaimer: "These are resume-content and formatting heuristics. Results are guidance, not a guarantee of ATS acceptance or hiring outcomes.",
  },
  "writing-quality": {
    category: "writing-quality",
    title: "Writing Quality Score",
    description: "Reviews bullet phrasing, action verbs, date chronology, overused buzzwords, and quantifiable evidence across experience and projects.",
    baseScore: 100,
    scoringFormula: "Score = 100 - (Errors × 25) - (Warnings × 10) - (Suggestions × 3)",
    penalties: { error: 25, warning: 10, suggestion: 3 },
    scoreBands: [
      { min: 90, max: 100, label: "Polished Phrasing", interpretation: "Action-oriented language, consistent dates, and measurable outcomes." },
      { min: 70, max: 89, label: "Refinement Advised", interpretation: "Some passive phrasing, buzzwords, or unquantified bullets could be strengthened." },
      { min: 0, max: 69, label: "Review Required", interpretation: "Chronological inconsistencies or multiple passive openings detected." },
    ],
    disclaimer: "These style suggestions are advisory guidance, not a guarantee of ATS acceptance or hiring outcomes. You can safely ignore subjective suggestions without impacting document structure.",
  },
  "job-match": {
    category: "job-match",
    title: "Job Match & Keyword Alignment",
    description: "Analyzes textual evidence between your resume and a target job description or extracted requirements.",
    baseScore: 100,
    scoringFormula: "Score = (Matched Priority Terms / Total Priority Terms) × 100%",
    penalties: { error: 0, warning: 0, suggestion: 0 },
    scoreBands: [
      { min: 80, max: 100, label: "Strong Alignment", interpretation: "High overlap with core technologies, responsibilities, and skills in the job description." },
      { min: 50, max: 79, label: "Moderate Alignment", interpretation: "Partial keyword overlap; review missing skills you truthfully possess." },
      { min: 0, max: 49, label: "Low Alignment", interpretation: "Substantial keyword gaps; ensure relevant coursework or tools are documented." },
    ],
    disclaimer: "Keyword coverage indicates heuristic text evidence and guidance, not a guarantee of ATS acceptance or candidate qualification. Never add skills, metrics, or credentials you do not possess.",
  },
};

// ─────────────────────────────────────────────
// 3. CHECKLIST GENERATION ENGINE
// ─────────────────────────────────────────────

/**
 * Returns a complete checklist for a category, pairing catalog rules with actual findings
 * to produce both passed and incomplete check items.
 */
export function getCategoryChecklist(
  category: FindingCategory,
  findings: AtsFinding[],
  input: AtsEvaluationInput
): AtsCheckItem[] {
  const { document, settings, persona = "general" } = input;
  const categoryFindings = findings.filter((f) => f.category === category);

  // Helper to map finding rule IDs to catalog rule IDs
  const findMatchingFinding = (catalogRuleId: string): AtsFinding | undefined => {
    switch (catalogRuleId) {
      case "contact.name":
        return categoryFindings.find((f) => f.ruleId === "contact.name.missing");
      case "contact.method":
        return categoryFindings.find((f) => f.ruleId === "contact.method.missing");
      case "contact.email_format":
        return categoryFindings.find((f) => f.ruleId === "contact.email.invalid");
      case "contact.link_validity":
        return categoryFindings.find(
          (f) => f.ruleId === "contact.link.empty_url" || f.ruleId === "contact.link.missing_protocol"
        );
      case "section.custom_headings":
        return categoryFindings.find((f) => f.ruleId === "section.custom.unusual_heading");
      case "template.layout_safety":
        return categoryFindings.find((f) => f.ruleId === "template.expressive_layout");
      case "format.spacing":
        return categoryFindings.find((f) => f.ruleId === "format.spacing.tight");
      case "writing.bullet.empty":
        return categoryFindings.find((f) => f.ruleId === "writing.bullet.empty");

      case "completeness.education":
        return categoryFindings.find((f) => f.ruleId === "completeness.fresher.education_missing");
      case "completeness.experience":
        return categoryFindings.find((f) => f.ruleId === "completeness.experienced.experience_missing");
      case "completeness.skills":
        return categoryFindings.find(
          (f) =>
            f.ruleId === "completeness.fresher.skills_missing" ||
            f.ruleId === "completeness.technical.skills_missing"
        );
      case "completeness.projects":
        return categoryFindings.find((f) => f.ruleId === "completeness.fresher.projects_missing");
      case "completeness.summary":
        return categoryFindings.find((f) => f.ruleId === "completeness.experienced.summary_suggested");
      case "completeness.bullets":
        return categoryFindings.find((f) => f.ruleId === "completeness.experienced.bullets_missing");
      case "completeness.location":
        return categoryFindings.find((f) => f.ruleId === "contact.location.missing");
      case "completeness.tech_repo":
        return categoryFindings.find((f) => f.ruleId === "completeness.technical.repo_link");
      case "completeness.general_content":
        return categoryFindings.find((f) => f.ruleId === "completeness.general.content_sparse");
      case "completeness.density":
        return categoryFindings.find((f) => f.ruleId === "format.density.high");

      case "writing.date.chronology":
        return categoryFindings.find((f) => f.ruleId === "writing.date.inverted");
      case "writing.bullet.action_verbs":
        return categoryFindings.find((f) => f.ruleId === "writing.bullet.passive");
      case "writing.buzzwords":
        return categoryFindings.find((f) => f.ruleId === "writing.buzzword");
      case "writing.repetition":
        return categoryFindings.find((f) => f.ruleId === "writing.bullet.repeated_openings");
      case "writing.metrics":
        return categoryFindings.find((f) => f.ruleId === "writing.bullet.quantification_prompt");
      case "writing.punctuation":
        return categoryFindings.find((f) => f.ruleId === "writing.bullet.punctuation_inconsistent");

      default:
        return categoryFindings.find((f) => f.ruleId === catalogRuleId);
    }
  };

  // Helper to generate evidence when passed
  const getPassEvidence = (catalogRuleId: string): string => {
    switch (catalogRuleId) {
      case "contact.name":
        return `Full name provided: "${document.basics.name}".`;
      case "contact.method":
        return document.basics.email && document.basics.phone
          ? `Both email (${document.basics.email}) and phone (${document.basics.phone}) are provided.`
          : document.basics.email
          ? `Direct email provided: "${document.basics.email}".`
          : `Phone number provided: "${document.basics.phone}".`;
      case "contact.email_format":
        return document.basics.email
          ? `Email syntax "${document.basics.email}" conforms to standard email format.`
          : "Email check skipped (no email provided).";
      case "contact.link_validity":
        return document.basics.links?.length
          ? `${document.basics.links.length} external link(s) verified with valid https:// protocol.`
          : "No broken external links detected.";
      case "section.custom_headings":
        return "All section headings follow standard industry terminology.";
      case "template.layout_safety": {
        const tId = settings?.templateId ?? document.settings.templateId;
        return `Selected template ("${tId}") uses single-column ATS-safe linear flow.`;
      }
      case "format.spacing": {
        const sp = settings?.lineSpacing ?? document.settings.lineSpacing;
        return `Line spacing is configured to ${sp} (≥ 1.05 standard).`;
      }
      case "writing.bullet.empty":
        return "No empty bullet items detected across sections.";

      case "completeness.education":
        return `${document.education.length} education credential(s) listed.`;
      case "completeness.experience":
        return `${document.experience.length} work experience role(s) listed.`;
      case "completeness.skills":
        return `${document.skills.length} skill category/categories with items defined.`;
      case "completeness.projects":
        return `${document.projects.length} project(s) documented with details.`;
      case "completeness.summary":
        return "Professional summary populated with career framing.";
      case "completeness.bullets":
        return "Experience roles contain descriptive accomplishment bullets.";
      case "completeness.location":
        return `Geographic location specified: "${document.basics.location}".`;
      case "completeness.tech_repo":
        return "Code repository / technical profile link present.";
      case "completeness.general_content":
        return "Document contains demonstrable experience or projects.";
      case "completeness.density":
        return "Page density and margins are within balanced limits.";

      case "writing.date.chronology":
        return "All start and end dates follow valid chronological sequence.";
      case "writing.bullet.action_verbs":
        return "Bullet points lead with active action verbs.";
      case "writing.buzzwords":
        return "No overused buzzwords detected in bullet text.";
      case "writing.repetition":
        return "Bullet openings use varied action vocabulary.";
      case "writing.metrics":
        return "Experience bullets include quantified metrics and impact.";
      case "writing.punctuation":
        return "Bullet point endings follow consistent punctuation formatting.";

      default:
        return "Pass condition satisfied.";
    }
  };

  // Determine applicable rule IDs for category based on context
  const getApplicableRuleIds = (): string[] => {
    switch (category) {
      case "parse-readiness":
        return [
          "contact.name",
          "contact.method",
          "contact.email_format",
          "contact.link_validity",
          "section.custom_headings",
          "template.layout_safety",
          "format.spacing",
          "writing.bullet.empty",
        ];

      case "content-completeness": {
        const base = [
          "completeness.education",
          "completeness.skills",
          "completeness.projects",
          "completeness.location",
        ];
        if (persona === "fresher" || persona === "internship") {
          return base;
        }
        if (persona === "experienced") {
          return [
            ...base,
            "completeness.experience",
            "completeness.bullets",
            "completeness.summary",
            "completeness.density",
          ];
        }
        if (persona === "technical") {
          return [
            ...base,
            "completeness.experience",
            "completeness.tech_repo",
            "completeness.bullets",
          ];
        }
        return [
          ...base,
          "completeness.experience",
          "completeness.general_content",
          "completeness.bullets",
        ];
      }

      case "writing-quality":
        return [
          "writing.date.chronology",
          "writing.bullet.action_verbs",
          "writing.buzzwords",
          "writing.repetition",
          "writing.metrics",
          "writing.punctuation",
        ];

      default:
        return [];
    }
  };

  const applicableIds = getApplicableRuleIds();
  const matchedRuleIds = new Set<string>();

  const checklist: AtsCheckItem[] = applicableIds.map((ruleId) => {
    const catalogDef = ATS_RULES_CATALOG[ruleId];
    const finding = findMatchingFinding(ruleId);

    if (finding) {
      matchedRuleIds.add(finding.ruleId);
      return {
        ruleId,
        category,
        title: finding.title || catalogDef?.title || ruleId,
        description: catalogDef?.description ?? finding.message,
        passCondition: catalogDef?.passCondition ?? "Standard requirement met.",
        remediation: finding.recommendedFix || catalogDef?.remediation || "Review and update this section.",
        whyItMatters: finding.whyItMatters || catalogDef?.whyItMatters || "Standard parsing heuristic.",
        sectionId: finding.sectionId || catalogDef?.sectionId || "basics",
        fieldPath: finding.fieldPath || catalogDef?.fieldPath,
        status: "incomplete",
        severity: finding.severity,
        isSubjective: finding.isSubjective ?? catalogDef?.isSubjective,
        evidence: finding.evidence || finding.message,
        finding,
      };
    }

    return {
      ruleId,
      category,
      title: catalogDef?.title ?? ruleId,
      description: catalogDef?.description ?? "Evaluates resume formatting and completeness.",
      passCondition: catalogDef?.passCondition ?? "Standard requirement met.",
      remediation: catalogDef?.remediation ?? "No action required.",
      whyItMatters: catalogDef?.whyItMatters ?? "Standard parsing heuristic.",
      sectionId: catalogDef?.sectionId ?? "basics",
      fieldPath: catalogDef?.fieldPath,
      status: "passed",
      isSubjective: catalogDef?.isSubjective,
      evidence: getPassEvidence(ruleId),
    };
  });

  // Include any extra findings not mapped to specific catalog IDs
  categoryFindings.forEach((f) => {
    if (!matchedRuleIds.has(f.ruleId)) {
      checklist.push({
        ruleId: f.ruleId,
        category,
        title: f.title,
        description: f.message,
        passCondition: "Pass condition satisfied.",
        remediation: f.recommendedFix,
        whyItMatters: f.whyItMatters,
        sectionId: f.sectionId || "basics",
        status: "incomplete",
        severity: f.severity,
        isSubjective: f.isSubjective,
        evidence: f.evidence || f.message,
        finding: f,
      });
    }
  });

  return checklist;
}
