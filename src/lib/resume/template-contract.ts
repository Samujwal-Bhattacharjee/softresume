/**
 * RS-050 — Template Rendering Contract
 *
 * Defines the interface every template renderer must implement.
 * Templates consume ResumeDocument + PresentationSettings and produce HTML.
 * Templates MUST NOT mutate or own content data.
 */

import type { ResumeDocument, PresentationSettings, TemplateId } from "@/lib/schemas/resume";

/** ATS safety status of a template */
export type AtsSafetyLevel = "safe" | "limited" | "expressive";

/** Template descriptor metadata */
export interface TemplateDescriptor {
  id: TemplateId;
  name: string;
  description: string;
  atsLevel: AtsSafetyLevel;
  atsDisclosure: string;
  supportedPageSizes: ("A4" | "US_LETTER")[];
  supportsMultiPage: boolean;
  recommendedFor: string[];
  previewFixtureId: "fresher" | "experienced";
}

/** Props passed into every template renderer component */
export interface TemplateRenderProps {
  document: ResumeDocument;
  settings: PresentationSettings;
  /** True when rendering for PDF export (may affect certain UI-only elements) */
  isPrint?: boolean;
  /** Scale factor for preview display */
  scale?: number;
}

/** Registry of all available templates */
export type TemplateRegistry = Record<TemplateId, TemplateDescriptor>;

export const TEMPLATE_REGISTRY: TemplateRegistry = {
  "classic-ats": {
    id: "classic-ats",
    name: "Classic ATS",
    description:
      "Single-column, high-contrast layout with conventional headings and simple bullets. Designed for maximum parsing compatibility.",
    atsLevel: "safe",
    atsDisclosure:
      "This template uses a single-column text layout with standard section names. It passes our conservative parse-readiness checks, but no template can guarantee results with every employer's proprietary system.",
    supportedPageSizes: ["A4", "US_LETTER"],
    supportsMultiPage: true,
    recommendedFor: ["Experienced professionals", "Career switchers", "Any role"],
    previewFixtureId: "experienced",
  },
  "modern-editorial": {
    id: "modern-editorial",
    name: "Modern Editorial",
    description:
      "Understated accent color and strong typographic hierarchy with modest separators.",
    atsLevel: "safe",
    atsDisclosure:
      "Uses a single-column layout and conventional section headings. Passes our conservative parse-readiness checks.",
    supportedPageSizes: ["A4", "US_LETTER"],
    supportsMultiPage: true,
    recommendedFor: ["Product managers", "Designers", "Business roles"],
    previewFixtureId: "experienced",
  },
  "fresher-graduate": {
    id: "fresher-graduate",
    name: "Fresher / Graduate",
    description:
      "Education, skills, and projects can lead. Supports coursework, internships, student clubs, hackathons, and awards.",
    atsLevel: "safe",
    atsDisclosure:
      "Single-column with standard headings. Education and projects appear before experience when appropriate.",
    supportedPageSizes: ["A4", "US_LETTER"],
    supportsMultiPage: false,
    recommendedFor: ["Students", "Recent graduates", "Internship applicants"],
    previewFixtureId: "fresher",
  },
  technical: {
    id: "technical",
    name: "Technical / Project-First",
    description:
      "Emphasizes technical project details, relevant technologies, contribution, outcomes, and GitHub/demo links.",
    atsLevel: "safe",
    atsDisclosure:
      "Single-column with standard headings. Projects section appears prominently.",
    supportedPageSizes: ["A4", "US_LETTER"],
    supportsMultiPage: true,
    recommendedFor: [
      "Software engineers",
      "AI/ML engineers",
      "Cloud/DevOps engineers",
    ],
    previewFixtureId: "fresher",
  },
  experienced: {
    id: "experienced",
    name: "Experienced Professional",
    description:
      "Focused on experience, impact, scope, and leadership. Handles one- and two-page documents.",
    atsLevel: "safe",
    atsDisclosure:
      "Single-column with conventional headings. Handles multi-page content with clean pagination.",
    supportedPageSizes: ["A4", "US_LETTER"],
    supportsMultiPage: true,
    recommendedFor: [
      "Senior engineers",
      "Managers",
      "Executives",
      "Experienced professionals",
    ],
    previewFixtureId: "experienced",
  },
  creative: {
    id: "creative",
    name: "Creative / Portfolio (Deferred)",
    description:
      "Expressive visual hierarchy for portfolio roles. Deferred in this sprint; falls back to Modern Editorial with expressive notices.",
    atsLevel: "expressive",
    atsDisclosure:
      "⚠ Creative / Portfolio is currently deferred in backlog planning. Selecting this template falls back to Modern Editorial. For ATS screening environments, we recommend Classic ATS, Modern Editorial, Technical, or Experienced.",
    supportedPageSizes: ["A4", "US_LETTER"],
    supportsMultiPage: true,
    recommendedFor: [
      "Designers",
      "Filmmakers",
      "Creative professionals",
    ],
    previewFixtureId: "fresher",
  },
};

/** Font preset configuration for document output */
export const FONT_PRESET_CONFIG = {
  clean: {
    label: "Clean Sans",
    bodyFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    monoFont: "'JetBrains Mono', 'Courier New', monospace",
  },
  corporate: {
    label: "Corporate",
    bodyFont: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
    headingFont: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
    monoFont: "'Courier New', Courier, monospace",
  },
  editorial: {
    label: "Editorial",
    bodyFont: "'Source Sans 3', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
    headingFont: "'Source Sans 3', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
    monoFont: "'JetBrains Mono', 'Courier New', monospace",
  },
  serif: {
    label: "Classic Serif",
    bodyFont: "Georgia, 'Times New Roman', Times, serif",
    headingFont: "Georgia, 'Times New Roman', Times, serif",
    monoFont: "'Courier New', Courier, monospace",
  },
} as const;

/** Page dimensions in mm */
export const PAGE_DIMENSIONS = {
  A4: { width: 210, height: 297 },
  US_LETTER: { width: 215.9, height: 279.4 },
} as const;
