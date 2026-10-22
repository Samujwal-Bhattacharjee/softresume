/**
 * SoftCV Studio — ATS & AI Guide (2001 Console Chrome Edition)
 * RS-165, RS-175
 *
 * In-depth technical and career help explaining heuristic ATS checks,
 * AI assistance boundaries, keyword matching, and document export rules.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS & AI Verification Guide | SoftCV Studio",
  description:
    "Honest guide to ATS parse readiness, keyword coverage heuristics, AI writing assistance, and export formats in SoftCV Studio.",
};

const FAQ_ITEMS = [
  {
    id: "parse-readiness",
    category: "ATS & SCANNING",
    question: "What is 'Parse Readiness' and how is it measured?",
    answer:
      "Parse Readiness is an automated check of your resume’s structural readability. It verifies objective criteria that applicant tracking systems require: complete contact information, standardized ISO date formats, recognizable section headings, absence of multi-column clipping, and selectable plain-text streams. It evaluates file structure, not whether a recruiter likes your accomplishments.",
  },
  {
    id: "keyword-coverage",
    category: "ATS & SCANNING",
    question: "What does 'Keyword Coverage' actually mean?",
    answer:
      "Keyword Coverage measures how many required and preferred skills from a target job description appear in your resume text. SoftCV Studio uses deterministic exact-match search and a curated, transparent synonym dictionary (e.g. 'React' matches 'React.js', 'PostgreSQL' matches 'Postgres'). It is an editorial alignment tool—not an employer's proprietary ATS ranking score.",
  },
  {
    id: "missing-skills",
    category: "ATS & SCANNING",
    question: "Why is a required skill marked 'Missing'?",
    answer:
      "A skill is marked missing because the exact term or its known synonyms were not found in your resume text. This means there is no clear textual evidence for an automated scanner to find. It does NOT prove you lack the ability. If you have the skill, consider mentioning it naturally in your experience bullets or skills rack.",
  },
  {
    id: "no-keyword-stuffing",
    category: "ATS & SCANNING",
    question: "Why should I not add keywords just to achieve 100% score?",
    answer:
      "Keyword stuffing harms candidate credibility. If an automated filter passes a resume with inflated or ungrounded skills, the candidate will be interviewed on those topics. If you cannot discuss the technology in depth, it leads to immediate interview rejection. Only add skills you have genuinely practiced or studied.",
  },
  {
    id: "pdf-text-order",
    category: "DOCUMENT EXPORT",
    question: "Why might a PDF look right visually but extract in the wrong order?",
    answer:
      "PDFs render visual glyphs at arbitrary (x, y) coordinates. An ATS parser does not look at the page visually; it extracts the sequential character stream. If two columns or absolute floats are rendered out of document flow, the text stream can jumble words from different columns together. SoftCV Studio's templates use strictly sequential semantic HTML and validated vector rendering to ensure extracted text matches visual reading order.",
  },
  {
    id: "pdf-vs-docx",
    category: "DOCUMENT EXPORT",
    question: "What is the difference between PDF and DOCX export?",
    answer:
      "Our PDF export uses Chromium vector rendering with exact point-geometry for print and digital submission. It preserves typography, margins, and page boundaries across all devices. Our DOCX export compiles clean, native Office Open XML (.docx) with standard Word styles (Heading 1, Heading 2, Normal) for recruiters who specifically demand an editable Word document.",
  },
  {
    id: "ai-payloads",
    category: "AI ASSISTANCE",
    question: "What exact data does the AI receive when I click 'Improve'?",
    answer:
      "Only the specific content needed for the requested task. For Bullet Improver: the target bullet text, job role, and company name. For Summary Helper: target role, years of experience, core skills, and selected top bullets. For Job Extraction: only the pasted job text. We never send your full resume document, phone number, physical address, or unrelated cartridges.",
  },
  {
    id: "ai-unconfigured",
    category: "AI ASSISTANCE",
    question: "What happens if AI is not configured on the server?",
    answer:
      "If the server does not have an AI API key configured, the endpoint returns a clear 503 NOT_CONFIGURED status. The UI informs you honestly that AI services are offline. We NEVER display fake 'AI refined' text or pretend an unconfigured system has run a model.",
  },
  {
    id: "data-management",
    category: "DATA & STORAGE",
    question: "How do I export my data or delete local resumes?",
    answer:
      "Click the 'DATA & PRIVACY' button in the Dashboard or Editor header. You can download a complete schema-versioned JSON backup of all your resumes, reset sample demo cartridges, delete individual resumes, or permanently purge all local records from your browser.",
  },
  {
    id: "creative-template-status",
    category: "TEMPLATES",
    question: "Why is the 'Creative / Portfolio' template unavailable?",
    answer:
      "In accordance with our release roadmap, SoftCV Studio currently ships five fully implemented, tested templates: Classic ATS, Fresher / Graduate, Modern Editorial, Technical / Project-First, and Experienced Professional. Creative / Portfolio remains deferred to a future release to ensure its visual complexity does not compromise ATS parse readiness.",
  },
];

export default function AtsAndAiGuidePage() {
  return (
    <div className="bg-periwinkle-mid text-carbon min-h-screen selection:bg-nav-gold selection:text-carbon font-body">
      {/* ── Chassis Header ── */}
      <header className="w-full bg-carbon speaker-grille hardware-bevel">
        <div className="max-w-[1200px] mx-auto h-12 px-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="bg-periwinkle-mid px-space-md py-1 rounded-full hardware-bevel flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-games-red hardware-inset"></div>
            <span className="font-display text-nav-link text-carbon tracking-tight">
              SOFTCV STUDIO
            </span>
            <span className="font-micro text-micro bg-carbon text-nav-gold px-1 rounded-DEFAULT uppercase">
              v2001
            </span>
          </Link>

          <nav className="flex items-center gap-3 text-xs uppercase font-ui-label text-platinum">
            <Link href="/dashboard" className="text-nav-gold hover:underline">
              DASHBOARD
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/privacy" className="hover:text-nav-gold hover:underline">
              PRIVACY
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/release-notes" className="hover:text-nav-gold hover:underline">
              RELEASE NOTES
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main Document Chassis ── */}
      <main id="main-content" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        {/* Ribbon Header */}
        <div className="bg-carbon hardware-bevel p-4 sm:p-6 text-platinum flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nav-gold"></span>
              <span className="font-micro text-micro uppercase tracking-wider text-ice">
                KNOWLEDGE BASE // DOC-REF: HELP-ATS-AI-V1
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-nav-gold uppercase tracking-tight mt-1">
              ATS & AI VERIFICATION GUIDE
            </h1>
            <p className="font-micro text-micro text-canvas-soft mt-1">
              PRACTICAL EXPLANATIONS OF SCORING, HEURISTICS, AND MACHINE-READABLE EXPORTS
            </p>
          </div>

          <div className="bg-ink-soft text-surface px-3 py-1.5 hardware-bevel font-ui-label text-ui-label uppercase">
            OBJECTIVE METRICS ONLY
          </div>
        </div>

        {/* Core Principles Card */}
        <div className="bg-carbon text-platinum hardware-bevel p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-nav-gold font-display text-base uppercase flex items-center gap-1.5">
              <span>01.</span>
              <span>NO HIRING PROMISES</span>
            </div>
            <p className="text-xs text-canvas-soft leading-relaxed">
              No software can guarantee an interview. We optimize structure and clarity so human recruiters
              and automated parsers read your genuine story accurately.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-systems-teal font-display text-base uppercase flex items-center gap-1.5">
              <span>02.</span>
              <span>GROUNDED IN FACT</span>
            </div>
            <p className="text-xs text-canvas-soft leading-relaxed">
              AI suggestions are constrained by your real accomplishments. We never fabricate metrics,
              add fake years of experience, or invent unearned skills.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-amber font-display text-base uppercase flex items-center gap-1.5">
              <span>03.</span>
              <span>100% HUMAN CONTROL</span>
            </div>
            <p className="text-xs text-canvas-soft leading-relaxed">
              Every AI proposal requires explicit review and approval. Content is only written to your
              cartridge when you choose to accept it.
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-surface hardware-inset p-6 sm:p-10 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-2 border-carbon pb-2">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase">
              FREQUENTLY ASKED QUESTIONS & TECHNICAL MANUAL
            </h2>
            <span className="font-micro text-micro text-muted-indigo uppercase">
              10 VERIFIED ENTRIES
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {FAQ_ITEMS.map((item, idx) => (
              <article
                key={item.id}
                className="bg-periwinkle-mid hardware-bevel p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-carbon text-nav-gold px-2 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel">
                    {item.category} #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-base text-carbon uppercase tracking-tight">
                  {item.question}
                </h3>
                <p className="text-sm text-carbon/90 leading-relaxed font-body">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between bg-carbon p-3 hardware-bevel text-xs">
          <Link
            href="/dashboard"
            className="text-nav-gold hover:underline font-bold uppercase"
          >
            ← RETURN TO DASHBOARD
          </Link>
          <div className="flex items-center gap-3 text-canvas-soft uppercase">
            <Link href="/privacy" className="hover:text-nav-gold hover:underline">
              PRIVACY POLICY
            </Link>
            <span>·</span>
            <Link href="/release-notes" className="hover:text-nav-gold hover:underline">
              RELEASE NOTES
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
