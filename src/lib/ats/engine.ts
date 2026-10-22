/**
 * RS-100 / RS-101 / RS-104 — Deterministic ATS Readiness & Completeness Engine
 *
 * Pure, deterministic rules engine that analyzes a ResumeDocument against
 * standard ATS parsing heuristics, role-specific completeness standards,
 * and optional job descriptions.
 *
 * No browser dependencies, no external network calls, 100% unit-testable.
 */

import type {
  AtsEvaluationInput,
  AtsEvaluationResult,
  AtsFinding,
  CategorySummary,
  JobMatchResult,
} from "./types";
import { TEMPLATE_REGISTRY } from "@/lib/resume/template-contract";
import { evaluateJobRequirementsCoverage } from "./job-match";
import { getCategoryChecklist } from "./rules-catalog";

// Common passive openings to flag for stronger action verbs
const PASSIVE_OPENINGS = [
  /^responsible for\b/i,
  /^duties included\b/i,
  /^assisted with\b/i,
  /^helped with\b/i,
  /^worked on\b/i,
  /^handled\b/i,
];

// Fluff/buzzwords that add no parsing or recruiter value
const BUZZWORDS = [
  "go-getter",
  "hard-working",
  "rockstar",
  "ninja",
  "guru",
  "synergy",
  "think outside the box",
  "team player",
  "self-starter",
];

// Non-standard section headings that confuse conservative ATS parsers
const UNCONVENTIONAL_HEADINGS = [
  "my journey",
  "life story",
  "philosophy",
  "about me & more",
  "things i love",
  "what makes me tick",
  "random facts",
];

// Technical stop words / common terms for job-match keyword extraction
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "will", "have", "you",
  "your", "our", "are", "about", "into", "through", "during", "before", "after",
  "above", "below", "must", "should", "could", "would", "able", "candidate",
  "experience", "years", "work", "role", "team", "skills", "knowledge", "required",
  "plus", "ideal", "looking", "join", "responsibilities", "qualifications",
]);

function parseDateForComparison(d?: string): number | null {
  if (!d || !d.trim()) return null;
  const str = d.trim().toLowerCase();
  if (str === "present" || str === "current" || str === "now" || str === "ongoing") return null;
  if (/^\d{4}$/.test(str)) {
    return new Date(`${str}-01-01`).getTime();
  }
  if (/^\d{4}-\d{2}$/.test(str)) {
    return new Date(`${str}-01`).getTime();
  }
  const timestamp = Date.parse(str);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Evaluates a resume document deterministically.
 */
export function evaluateResumeAts(input: AtsEvaluationInput): AtsEvaluationResult {
  const { document, settings, persona = "general", jobDescription, requirements } = input;
  const findings: AtsFinding[] = [];

  // ─────────────────────────────────────────────
  // 1. CONTACT & IDENTITY RULES (RS-100)
  // ─────────────────────────────────────────────

  // Name missing or blank
  if (!document.basics.name || !document.basics.name.trim()) {
    findings.push({
      ruleId: "contact.name.missing",
      category: "parse-readiness",
      severity: "error",
      title: "Full Name Missing",
      message: "The resume does not include a candidate name.",
      whyItMatters: "ATS parsers use the candidate name as the primary profile identifier.",
      recommendedFix: "Enter your full name in the Personal Information section.",
      sectionId: "basics",
      fieldPath: "basics.name",
    });
  }

  // Contact method check: at least email or phone must be present
  const hasEmail = !!document.basics.email && document.basics.email.trim().length > 0;
  const hasPhone = !!document.basics.phone && document.basics.phone.trim().length > 0;

  if (!hasEmail && !hasPhone) {
    findings.push({
      ruleId: "contact.method.missing",
      category: "parse-readiness",
      severity: "error",
      title: "No Contact Method Provided",
      message: "Neither an email address nor a phone number is provided.",
      whyItMatters: "Recruiters and automated systems cannot contact you without direct contact info.",
      recommendedFix: "Provide at least a valid email address.",
      sectionId: "basics",
      fieldPath: "basics.email",
    });
  }

  // Email format validation (if provided)
  if (hasEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(document.basics.email!.trim())) {
      findings.push({
        ruleId: "contact.email.invalid",
        category: "parse-readiness",
        severity: "error",
        title: "Invalid Email Format",
        message: `"${document.basics.email}" is not a valid email address.`,
        whyItMatters: "Parsers extracting contact details will reject or fail to deliver notifications.",
        recommendedFix: "Correct the email address format (e.g. name@example.com).",
        sectionId: "basics",
        fieldPath: "basics.email",
      });
    }
  }

  // Links validation
  if (document.basics.links && document.basics.links.length > 0) {
    document.basics.links.forEach((link, idx) => {
      if (!link.url || !link.url.trim()) {
        findings.push({
          ruleId: "contact.link.empty_url",
          category: "parse-readiness",
          severity: "warning",
          title: "Blank Link URL",
          message: `Link "${link.label || `Item #${idx + 1}`}" has no destination URL.`,
          whyItMatters: "Broken or empty links appear unfinished on exported documents.",
          recommendedFix: "Provide a valid URL (e.g. https://github.com/...) or remove the link.",
          sectionId: "basics",
          fieldPath: `basics.links[${idx}].url`,
        });
      } else if (!/^https?:\/\//i.test(link.url.trim())) {
        findings.push({
          ruleId: "contact.link.missing_protocol",
          category: "parse-readiness",
          severity: "suggestion",
          title: "Missing URL Protocol",
          message: `Link "${link.url}" is missing the https:// protocol.`,
          whyItMatters: "Some PDF viewers require explicit https:// protocols to generate clickable links.",
          recommendedFix: `Prepend https:// to your link URL (e.g. https://${link.url.trim()}).`,
          sectionId: "basics",
          fieldPath: `basics.links[${idx}].url`,
        });
      }
    });
  }

  // Location recommendation
  if (!document.basics.location || !document.basics.location.trim()) {
    findings.push({
      ruleId: "contact.location.missing",
      category: "content-completeness",
      severity: "suggestion",
      title: "Location Not Specified",
      message: "City or region is omitted.",
      whyItMatters: "Many ATS filters screen candidates by geographic region or timezone availability.",
      recommendedFix: "Add your city and country or state (e.g. London, UK or Seattle, WA).",
      sectionId: "basics",
      fieldPath: "basics.location",
    });
  }

  // ─────────────────────────────────────────────
  // 2. SECTION HIERARCHY & CUSTOM SECTIONS
  // ─────────────────────────────────────────────

  // Check custom sections for unconventional titles
  if (document.customSections && document.customSections.length > 0) {
    for (const custom of document.customSections) {
      const lower = custom.title.toLowerCase().trim();
      if (UNCONVENTIONAL_HEADINGS.includes(lower)) {
        findings.push({
          ruleId: "section.custom.unusual_heading",
          category: "parse-readiness",
          severity: "warning",
          title: `Unconventional Section Heading: "${custom.title}"`,
          message: `The heading "${custom.title}" may confuse automated resume parsers.`,
          whyItMatters: "Parsers categorize experience using standard headings like Projects, Volunteering, or Leadership.",
          recommendedFix: "Rename the section to standard terminology (e.g. Leadership, Activities, or Additional Projects).",
          sectionId: "customSections",
          evidence: custom.title,
        });
      }
    }
  }

  // Template safety characteristics (RS-100 / RS-050)
  const templateId = settings?.templateId ?? document.settings.templateId;
  const template = TEMPLATE_REGISTRY[templateId];
  if (template && template.atsLevel === "expressive") {
    findings.push({
      ruleId: "template.expressive_layout",
      category: "parse-readiness",
      severity: "warning",
      title: "Expressive Template Layout Selected",
      message: `The "${template.name}" template uses a more expressive visual layout.`,
      whyItMatters: "While great for human portfolios, some conservative corporate ATS scanners struggle with non-linear columns.",
      recommendedFix: "Consider switching to 'Classic ATS' or 'Modern Editorial' for standard job board applications.",
      sectionId: "settings",
      evidence: template.atsDisclosure,
    });
  }

  // ─────────────────────────────────────────────
  // 3. GROUNDED FORMATTING & DENSITY (RS-104)
  // ─────────────────────────────────────────────

  if (settings) {
    if (settings.lineSpacing < 1.05) {
      findings.push({
        ruleId: "format.spacing.tight",
        category: "parse-readiness",
        severity: "warning",
        title: "Very Tight Line Spacing",
        message: `Line spacing is configured to ${settings.lineSpacing}, which may cause text overlap in printed PDF export.`,
        whyItMatters: "Lines of text that touch can cause OCR and PDF text extractors to merge words.",
        recommendedFix: "Set line spacing to at least 1.15 in Template Settings.",
        sectionId: "settings",
      });
    }

    if (settings.marginSize === "compact" && (document.experience.length + document.projects.length > 8)) {
      findings.push({
        ruleId: "format.density.high",
        category: "parse-readiness",
        severity: "suggestion",
        title: "High Content Density",
        message: "You have a large amount of content with compact margins.",
        whyItMatters: "Densely packed pages are visually fatiguing for human recruiters after ATS screening.",
        recommendedFix: "Consider normal margins and pruning older or less relevant bullet points.",
        sectionId: "settings",
      });
    }
  }

  // ─────────────────────────────────────────────
  // 4. WRITING QUALITY & BULLET HEURISTICS (RS-102)
  // ─────────────────────────────────────────────

  // Date consistency checks: Inverted dates across experience, education, internships
  document.experience.forEach((exp, idx) => {
    if (!exp.current && exp.startDate && exp.endDate) {
      const startTs = parseDateForComparison(exp.startDate);
      const endTs = parseDateForComparison(exp.endDate);
      if (startTs !== null && endTs !== null && startTs > endTs) {
        findings.push({
          ruleId: "writing.date.inverted",
          category: "writing-quality",
          severity: "warning",
          isSubjective: false,
          title: `Inverted Date Range: ${exp.role || exp.employer}`,
          message: `Start date "${exp.startDate}" is after end date "${exp.endDate}".`,
          whyItMatters: "Chronological inconsistencies confuse parsing systems and undermine credibility.",
          recommendedFix: "Check and correct the start and end dates.",
          sectionId: "experience",
          fieldPath: `experience[${idx}].endDate`,
          evidence: `${exp.startDate} -> ${exp.endDate}`,
        });
      }
    }
  });

  document.education.forEach((edu, idx) => {
    if (!edu.current && edu.startDate && edu.endDate) {
      const startTs = parseDateForComparison(edu.startDate);
      const endTs = parseDateForComparison(edu.endDate);
      if (startTs !== null && endTs !== null && startTs > endTs) {
        findings.push({
          ruleId: "writing.date.inverted",
          category: "writing-quality",
          severity: "warning",
          isSubjective: false,
          title: `Inverted Date Range: ${edu.institution}`,
          message: `Start date "${edu.startDate}" is after end date "${edu.endDate}".`,
          whyItMatters: "Chronological inconsistencies confuse parsing systems.",
          recommendedFix: "Check and correct the graduation/end dates.",
          sectionId: "education",
          fieldPath: `education[${idx}].endDate`,
          evidence: `${edu.startDate} -> ${edu.endDate}`,
        });
      }
    }
  });

  document.internships.forEach((intern, idx) => {
    if (!intern.current && intern.startDate && intern.endDate) {
      const startTs = parseDateForComparison(intern.startDate);
      const endTs = parseDateForComparison(intern.endDate);
      if (startTs !== null && endTs !== null && startTs > endTs) {
        findings.push({
          ruleId: "writing.date.inverted",
          category: "writing-quality",
          severity: "warning",
          isSubjective: false,
          title: `Inverted Date Range: ${intern.role || intern.employer}`,
          message: `Start date "${intern.startDate}" is after end date "${intern.endDate}".`,
          whyItMatters: "Chronological inconsistencies confuse parsing systems.",
          recommendedFix: "Check and correct the start and end dates.",
          sectionId: "internships",
          fieldPath: `internships[${idx}].endDate`,
          evidence: `${intern.startDate} -> ${intern.endDate}`,
        });
      }
    }
  });

  // Check all bullets across experience, projects, internships
  const allBullets: { bullet: string; sectionId: string; parentName: string }[] = [];

  document.experience.forEach((exp) => {
    exp.bullets.forEach((b) => {
      allBullets.push({ bullet: b, sectionId: "experience", parentName: exp.role || exp.employer });
    });
  });

  document.projects.forEach((proj) => {
    (proj.bullets || []).forEach((b) => {
      allBullets.push({ bullet: b, sectionId: "projects", parentName: proj.name });
    });
  });

  document.internships.forEach((intern) => {
    intern.bullets.forEach((b) => {
      allBullets.push({ bullet: b, sectionId: "internships", parentName: intern.role || intern.employer });
    });
  });

  // Empty bullets check
  const emptyBullet = allBullets.find((b) => !b.bullet.trim());
  if (emptyBullet) {
    findings.push({
      ruleId: "writing.bullet.empty",
      category: "parse-readiness",
      severity: "warning",
      isSubjective: false,
      title: "Empty Bullet Point Detected",
      message: `There are blank bullet items in ${emptyBullet.parentName}.`,
      whyItMatters: "Empty bullet circles print onto the document and look untidy.",
      recommendedFix: "Remove the blank bullet point or fill in your accomplishment.",
      sectionId: emptyBullet.sectionId,
    });
  }

  // Passive opening words check
  const passiveBullet = allBullets.find((b) =>
    PASSIVE_OPENINGS.some((regex) => regex.test(b.bullet.trim()))
  );
  if (passiveBullet) {
    findings.push({
      ruleId: "writing.bullet.passive",
      category: "writing-quality",
      severity: "suggestion",
      isSubjective: true,
      title: "Passive Bullet Phrasing",
      message: `Bullet in "${passiveBullet.parentName}" begins with passive language (e.g. "Responsible for", "Helped with").`,
      whyItMatters: "Active verbs (e.g. 'Engineered', 'Orchestrated', 'Reduced', 'Designed') demonstrate direct ownership and impact.",
      recommendedFix: "Rewrite the bullet opening with a strong action verb.",
      sectionId: passiveBullet.sectionId,
      evidence: passiveBullet.bullet,
    });
  }

  // Buzzwords check
  for (const item of allBullets) {
    const lower = item.bullet.toLowerCase();
    const foundWord = BUZZWORDS.find((bw) => lower.includes(bw));
    if (foundWord) {
      findings.push({
        ruleId: "writing.buzzword",
        category: "writing-quality",
        severity: "suggestion",
        isSubjective: true,
        title: `Overused Buzzword: "${foundWord}"`,
        message: `Your bullet in "${item.parentName}" uses the generic term "${foundWord}".`,
        whyItMatters: "Recruiters look for verifiable actions and skills rather than self-descriptive buzzwords.",
        recommendedFix: `Replace "${foundWord}" with concrete evidence or specific outcomes.`,
        sectionId: item.sectionId,
        evidence: item.bullet,
      });
      break; // One buzzword warning is enough
    }
  }

  // Duplicate wording: Repeated bullet opening verbs
  const openingVerbCounts: Record<string, number> = {};
  const COMMON_ARTICLES = new Set(["the", "a", "an", "to", "for", "in", "on", "at", "by", "with", "from", "and", "of"]);

  allBullets.forEach((item) => {
    const words = item.bullet.trim().split(/\s+/);
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (firstWord && firstWord.length > 2 && !COMMON_ARTICLES.has(firstWord)) {
      openingVerbCounts[firstWord] = (openingVerbCounts[firstWord] || 0) + 1;
    }
  });

  for (const [verb, count] of Object.entries(openingVerbCounts)) {
    if (count >= 3) {
      findings.push({
        ruleId: "writing.bullet.repeated_openings",
        category: "writing-quality",
        severity: "suggestion",
        isSubjective: true,
        title: `Repeated Bullet Opening: "${verb}"`,
        message: `${count} bullet points start with the verb "${verb}".`,
        whyItMatters: "Varying your action verbs demonstrates diverse strengths and prevents monotonous reading.",
        recommendedFix: `Vary opening verbs across these bullets (e.g. Architected, Spearheaded, Accelerated, Engineered).`,
        sectionId: "experience",
        evidence: `Repeated ${count}x`,
      });
      break;
    }
  }

  // Action / evidence prompt: roles with >= 2 bullets without any quantifiable metrics
  document.experience.forEach((exp, idx) => {
    if (exp.bullets && exp.bullets.length >= 2) {
      const hasNumbersOrMetrics = exp.bullets.some((b) =>
        /\b\d+(?:[.,]\d+)?%?|\$\d+|\b\d+\+?|\b(?:k|m|b)\b/i.test(b)
      );
      if (!hasNumbersOrMetrics) {
        findings.push({
          ruleId: "writing.bullet.quantification_prompt",
          category: "writing-quality",
          severity: "suggestion",
          isSubjective: true,
          title: `Quantifiable Evidence Recommended: ${exp.role || exp.employer || "Role"}`,
          message: `None of the bullet points for "${exp.role || exp.employer}" include measurable numbers, percentages, or scale indicators.`,
          whyItMatters: "Quantifiable evidence (such as latency reduced by 40%, team size of 8, or $100k savings) provides concrete proof of capability.",
          recommendedFix: "Where truthful, add measurable outcomes, metrics, or team/scale indicators. Never fabricate unsupported metrics.",
          sectionId: "experience",
          fieldPath: `experience[${idx}].bullets`,
        });
      }
    }
  });

  // Punctuation consistency check across non-blank bullets
  const nonBlankBullets = allBullets.filter((b) => b.bullet.trim().length > 0);
  if (nonBlankBullets.length >= 4) {
    const withPeriod = nonBlankBullets.filter((b) => b.bullet.trim().endsWith(".")).length;
    const withoutPeriod = nonBlankBullets.length - withPeriod;
    const ratio = withPeriod / nonBlankBullets.length;
    if (ratio >= 0.15 && ratio <= 0.85) {
      findings.push({
        ruleId: "writing.bullet.punctuation_inconsistent",
        category: "writing-quality",
        severity: "suggestion",
        isSubjective: true,
        title: "Inconsistent Bullet Punctuation",
        message: `${withPeriod} bullet points end with a period, while ${withoutPeriod} do not.`,
        whyItMatters: "Consistent punctuation across lists gives your document a clean, professional finish.",
        recommendedFix: "Standardize your bullets so either all end with a period or none do.",
        sectionId: "experience",
      });
    }
  }

  // ─────────────────────────────────────────────
  // 5. CONTEXT-AWARE COMPLETENESS (RS-101)
  // ─────────────────────────────────────────────

  // Persona: Fresher / Graduate
  if (persona === "fresher") {
    if (document.education.length === 0) {
      findings.push({
        ruleId: "completeness.fresher.education_missing",
        category: "content-completeness",
        severity: "error",
        title: "Education Section Missing",
        message: "No education entries are present.",
        whyItMatters: "For student and fresher applicants, education and degree details are the primary qualifying credential.",
        recommendedFix: "Add your university, expected or past graduation date, and degree.",
        sectionId: "education",
      });
    }

    if (document.projects.length === 0) {
      findings.push({
        ruleId: "completeness.fresher.projects_missing",
        category: "content-completeness",
        severity: "warning",
        title: "Projects Section Recommended",
        message: "No personal or academic projects are listed.",
        whyItMatters: "Without extensive formal work history, projects demonstrate your hands-on technical abilities.",
        recommendedFix: "Add 1–3 capstone, hackathon, course, or personal projects.",
        sectionId: "projects",
      });
    }

    if (document.skills.length === 0) {
      findings.push({
        ruleId: "completeness.fresher.skills_missing",
        category: "content-completeness",
        severity: "warning",
        title: "Skills Section Missing",
        message: "No technical or core skills listed.",
        whyItMatters: "ATS keyword filters scan for matching languages, tools, and technical competencies.",
        recommendedFix: "Add a categorized Skills section (e.g. Languages, Frameworks, Developer Tools).",
        sectionId: "skills",
      });
    }
  }

  // Persona: Experienced Professional
  else if (persona === "experienced") {
    if (document.experience.length === 0) {
      findings.push({
        ruleId: "completeness.experienced.experience_missing",
        category: "content-completeness",
        severity: "error",
        title: "Work Experience Missing",
        message: "An experienced profile has no employment history listed.",
        whyItMatters: "Professional roles, scope, and track record are the main screening criteria for experienced hires.",
        recommendedFix: "Add your previous and current professional roles.",
        sectionId: "experience",
      });
    } else {
      // Check that at least one experience has bullet points
      const hasBullets = document.experience.some((exp) => exp.bullets && exp.bullets.length > 0);
      if (!hasBullets) {
        findings.push({
          ruleId: "completeness.experienced.bullets_missing",
          category: "content-completeness",
          severity: "warning",
          title: "Experience Bullets Missing",
          message: "Roles are listed without descriptive accomplishments.",
          whyItMatters: "Recruiters and ATS parse bullet points for responsibilities, tools, and measurable achievements.",
          recommendedFix: "Add 2–4 accomplishment bullet points for each position.",
          sectionId: "experience",
        });
      }
    }

    if (!document.summary || !document.summary.trim()) {
      findings.push({
        ruleId: "completeness.experienced.summary_suggested",
        category: "content-completeness",
        severity: "suggestion",
        title: "Executive Summary Recommended",
        message: "A concise professional summary helps anchor experienced candidates.",
        whyItMatters: "A 2–3 sentence executive summary quickly communicates seniority, domain focus, and key accomplishments.",
        recommendedFix: "Add a 2–3 sentence summary in the Professional Summary section.",
        sectionId: "summary",
      });
    }
  }

  // Persona: Technical / Software
  else if (persona === "technical") {
    if (document.skills.length === 0) {
      findings.push({
        ruleId: "completeness.technical.skills_missing",
        category: "content-completeness",
        severity: "warning",
        title: "Technical Skills Missing",
        message: "Technical roles require categorized tools and languages.",
        whyItMatters: "Technical recruiters use boolean search queries specifically matching tech stack keywords.",
        recommendedFix: "Group your skills into Languages, Frameworks, Cloud, and Databases.",
        sectionId: "skills",
      });
    }

    const hasRepoLink = (document.basics.links || []).some(
      (l) => /github\.com|gitlab\.com|bitbucket\.org/i.test(l.url) || /github|code/i.test(l.label)
    );
    if (!hasRepoLink) {
      findings.push({
        ruleId: "completeness.technical.repo_link",
        category: "content-completeness",
        severity: "suggestion",
        title: "GitHub / Portfolio Link Recommended",
        message: "No code repository or portfolio profile link detected.",
        whyItMatters: "Engineering hiring managers frequently inspect code samples and open-source contributions.",
        recommendedFix: "Add a link to your GitHub or portfolio in Personal Information.",
        sectionId: "basics",
      });
    }
  }

  // Persona: General / Default checks
  else {
    if (document.experience.length === 0 && document.projects.length === 0) {
      findings.push({
        ruleId: "completeness.general.content_sparse",
        category: "content-completeness",
        severity: "warning",
        title: "No Experience or Projects Added",
        message: "The resume contains neither employment history nor projects.",
        whyItMatters: "A resume must contain demonstrable evidence of work or academic output.",
        recommendedFix: "Add your work experience or highlight key projects.",
        sectionId: "experience",
      });
    }
  }

  // ─────────────────────────────────────────────
  // 6. JOB MATCH EVALUATION (RS-092 / RS-100 / RS-103)
  // ─────────────────────────────────────────────

  let jobMatch: JobMatchResult = {
    analyzed: false,
    matchedKeywords: [],
    missingKeywords: [],
    findings: [],
  };

  if (requirements && requirements.length > 0) {
    jobMatch = evaluateJobRequirementsCoverage(document, requirements);
  } else if (jobDescription && jobDescription.trim().length >= 25) {
    const rawTokens = jobDescription
      .toLowerCase()
      .replace(/[^a-z0-9#+.]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

    // Count word frequency to identify priority keywords in the JD
    const tokenFreq: Record<string, number> = {};
    rawTokens.forEach((t) => {
      tokenFreq[t] = (tokenFreq[t] || 0) + 1;
    });

    // Top unique keywords in the job description
    const priorityKeywords = Object.entries(tokenFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k]) => k);

    // Concatenate all resume text to check coverage
    const resumeText = [
      document.basics.name,
      document.basics.headline || "",
      document.summary || "",
      ...document.skills.flatMap((s) => [s.category, ...s.items]),
      ...document.experience.flatMap((e) => [e.role, e.employer, ...e.bullets]),
      ...document.education.flatMap((ed) => [ed.institution, ed.degree, ed.field || "", ...(ed.coursework || [])]),
      ...document.projects.flatMap((p) => [p.name, ...(p.technologies || []), ...(p.bullets || [])]),
    ]
      .join(" ")
      .toLowerCase();

    const matched: string[] = [];
    const missing: string[] = [];

    priorityKeywords.forEach((kw) => {
      if (resumeText.includes(kw)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const matchScore = priorityKeywords.length > 0
      ? Math.round((matched.length / priorityKeywords.length) * 100)
      : 100;

    const jmFindings: AtsFinding[] = [];
    if (missing.length > 0) {
      jmFindings.push({
        ruleId: "job_match.keywords.missing",
        category: "job-match",
        severity: missing.length > 5 ? "warning" : "suggestion",
        title: `${missing.length} Key Job Description Terms Absent`,
        message: `Keywords found frequently in the target job description are not present in your resume: ${missing.slice(0, 6).join(", ")}.`,
        whyItMatters: "Recruiters and automated filters prioritize resumes demonstrating evidence of required skills.",
        recommendedFix: "If you have real experience with these skills, incorporate them into your skills or bullet points. Never fabricate unpossessed skills.",
        sectionId: "skills",
        evidence: missing.join(", "),
      });
    }

    jobMatch = {
      analyzed: true,
      score: matchScore,
      matchedKeywords: matched,
      missingKeywords: missing,
      findings: jmFindings,
    };
  }

  // ─────────────────────────────────────────────
  // 7. SUMMARY & READINESS INDEX CALCULATION
  // ─────────────────────────────────────────────

  const parseFindings = findings.filter((f) => f.category === "parse-readiness");
  const compFindings = findings.filter((f) => f.category === "content-completeness");
  const writingFindings = findings.filter((f) => f.category === "writing-quality");

  const calculateSummary = (catFindings: AtsFinding[], baseChecks: number): CategorySummary => {
    const errorCount = catFindings.filter((f) => f.severity === "error").length;
    const warningCount = catFindings.filter((f) => f.severity === "warning").length;
    const suggestionCount = catFindings.filter((f) => f.severity === "suggestion" || f.severity === "info").length;

    // Deterministic weighting: errors subtract 25, warnings subtract 10, suggestions subtract 3
    const penalty = errorCount * 25 + warningCount * 10 + suggestionCount * 3;
    const score = Math.max(0, Math.min(100, 100 - penalty));

    return {
      score,
      totalChecks: baseChecks,
      passedChecks: Math.max(0, baseChecks - errorCount - warningCount),
      errorCount,
      warningCount,
      suggestionCount,
    };
  };

  const allFindings = [...findings, ...(jobMatch.analyzed ? jobMatch.findings : [])];

  const checks = {
    "parse-readiness": getCategoryChecklist("parse-readiness", allFindings, input),
    "content-completeness": getCategoryChecklist("content-completeness", allFindings, input),
    "writing-quality": getCategoryChecklist("writing-quality", allFindings, input),
    "job-match": getCategoryChecklist("job-match", allFindings, input),
  };

  return {
    findings: allFindings,
    parseReadiness: calculateSummary(parseFindings, 8),
    contentCompleteness: calculateSummary(compFindings, 10),
    writingQuality: calculateSummary(writingFindings, 6),
    jobMatch,
    evaluatedAt: new Date().toISOString(),
    checks,
  };
}
