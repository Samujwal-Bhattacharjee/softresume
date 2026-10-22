/**
 * SoftCV Studio — Terms of Service (2001 Console Chrome Edition)
 * RS-175
 *
 * Pragmatic draft terms outlining user responsibility, no hiring guarantees,
 * AI review obligations, and acceptable usage.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SoftCV Studio",
  description:
    "Pragmatic terms governing use of SoftCV Studio, resume formatting assistance, and AI suggestions.",
};

export default function TermsPage() {
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
            <Link href="/help/ats-and-ai" className="hover:text-nav-gold hover:underline">
              ATS & AI GUIDE
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
                LEGAL SUBSYSTEM // DOC-REF: TERMS-2026-V1
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-nav-gold uppercase tracking-tight mt-1">
              TERMS OF SERVICE & USAGE CONDITIONS
            </h1>
            <p className="font-micro text-micro text-canvas-soft mt-1">
              STATUS: DRAFT REQUIRING OWNER/LEGAL REVIEW · LAST REVISED: OCTOBER 2026
            </p>
          </div>

          <div className="bg-ink-soft text-surface px-3 py-1.5 hardware-bevel font-ui-label text-ui-label uppercase">
            COMMERCIAL DRAFT
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber/20 border-2 border-amber hardware-inset p-4 text-xs text-carbon leading-relaxed">
          <strong>LEGAL DISCLAIMER:</strong> These draft terms describe the basic ground rules for using
          SoftCV Studio. They are provided as an engineering and product specification draft and do not
          constitute formal legal advice. A formal review by qualified legal counsel is required prior to
          commercial distribution.
        </div>

        {/* Content Plate */}
        <div className="bg-surface hardware-inset p-6 sm:p-10 flex flex-col gap-8 text-carbon">
          {/* Section 1 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              1. Acceptance of Terms and Scope
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              By accessing or using SoftCV Studio, you agree to these Terms. SoftCV Studio is a resume editing,
              formatting, and career document productivity tool designed to help candidates prepare professional
              application materials.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              2. User Content and Authenticity Responsibility
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              You are entirely and solely responsible for the truthfulness, accuracy, legality, and completeness
              of all information you include in your resumes, job target notes, and export documents.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-carbon/90 ml-2">
              <li>
                You must not include fraudulent qualifications, invented employers, fabricated dates, or
                counterfeit credentials.
              </li>
              <li>
                You represent that you have the right to input and process any personal or employer data you submit.
              </li>
              <li>
                SoftCV Studio is not an employer, background verification service, or recruiter, and has no
                obligation to verify user-supplied data.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              3. No Employment or ATS Guarantees
            </h2>
            <div className="bg-signal-red/10 border-l-4 border-signal-red p-3 text-xs leading-relaxed text-carbon font-medium">
              CRITICAL NOTICE: SoftCV Studio does not promise, represent, or guarantee that any resume,
              template, or score produced by this software will result in job interviews, employment offers,
              salary increases, or automated parsing success with any particular employer or Applicant Tracking
              System (ATS).
            </div>
            <p className="text-sm leading-relaxed text-carbon/90">
              ATS readiness findings and keyword match percentages are heuristic guidelines designed to reduce
              common formatting errors. Actual employer screening decisions depend on human reviewers, proprietary
              enterprise software, and organizational hiring criteria beyond this tool’s control.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              4. AI Suggestions and Human Review
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              AI-assisted features (including the Bullet Improver, Summary Helper, and Job Requirement Extractor)
              generate computational language proposals based on statistical patterns:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-carbon/90 ml-2">
              <li>
                AI output can be inaccurate, incomplete, or ill-suited for your specific background.
              </li>
              <li>
                You are required to review, verify, and approve all AI suggestions before applying them.
              </li>
              <li>
                SoftCV Studio explicitly designs all AI tools with an intentional “Review / Accept / Reject”
                workflow to keep humans in full control of their professional narrative.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              5. Acceptable Use and Service Protection
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              You agree not to misuse or attempt to compromise SoftCV Studio, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-carbon/90 ml-2">
              <li>
                Sending malicious, abusive, defamatory, or unlawful content through the application or API endpoints.
              </li>
              <li>
                Attempting prompt-injection attacks, jailbreaks, or reverse-engineering of server infrastructure.
              </li>
              <li>
                Using automated scraping or denial-of-service bursts that exceed defined rate limits.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              6. Service Availability and Storage Disclaimer
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              The software is provided on an “AS IS” and “AS AVAILABLE” basis. In local-first mode, you are
              responsible for maintaining your own backups using the Export JSON Backup feature. SoftCV Studio
              is not liable for data loss resulting from cleared browser storage, hardware failure, or service
              interruptions.
            </p>
          </section>
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
            <Link href="/help/ats-and-ai" className="hover:text-nav-gold hover:underline">
              ATS & AI GUIDE
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
