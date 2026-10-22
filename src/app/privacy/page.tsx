/**
 * SoftCV Studio — Privacy Policy (2001 Console Chrome Edition)
 * RS-044, RS-175
 *
 * Truthful, verified disclosure of current application data flows, local persistence,
 * server AI forwarding boundaries, and user data controls.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SoftCV Studio",
  description:
    "Transparent disclosure of local-first data storage, AI processing boundaries, and privacy controls in SoftCV Studio.",
};

export default function PrivacyPage() {
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
            <Link href="/terms" className="hover:text-nav-gold hover:underline">
              TERMS
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
                POLICY SUBSYSTEM // DOC-REF: PRIVACY-2026-V1
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-nav-gold uppercase tracking-tight mt-1">
              PRIVACY POLICY & DATA DISCLOSURE
            </h1>
            <p className="font-micro text-micro text-canvas-soft mt-1">
              STATUS: DRAFT REQUIRING OWNER/LEGAL REVIEW · LAST REVISED: OCTOBER 2026
            </p>
          </div>

          <div className="bg-ink-soft text-surface px-3 py-1.5 hardware-bevel font-ui-label text-ui-label uppercase">
            LOCAL-FIRST MODE ACTIVE
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber/20 border-2 border-amber hardware-inset p-4 text-xs text-carbon leading-relaxed">
          <strong>LEGAL & REGULATORY NOTICE:</strong> SoftCV Studio is currently operating in a
          standalone, local-first demonstration and productivity architecture. This document explains
          the exact technical behavior of the software today. This policy is a draft and requires
          formal owner, operator, and legal counsel review prior to commercial release in specific
          jurisdictions. No unverified certifications, corporate guarantees, or regulatory audits are claimed.
        </div>

        {/* Content Plate */}
        <div className="bg-surface hardware-inset p-6 sm:p-10 flex flex-col gap-8 text-carbon">
          {/* Section 1 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              1. Local-First Browser Storage
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              SoftCV Studio operates on a <strong>local-first</strong> architecture. When you create,
              edit, or tailor resumes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-carbon/90 ml-2">
              <li>
                All resume records, contact details, work experience, education, projects, skills, and
                job descriptions are saved exclusively in your browser’s <code>localStorage</code> under
                application-owned keys prefixed with <code>softcv_</code>.
              </li>
              <li>
                There is <strong>no remote database</strong>, cloud user account, or server synchronization
                active in this version.
              </li>
              <li>
                <strong>Browser Scope:</strong> Your data exists solely on this computer and inside this
                specific browser profile. If you open another browser or machine, your data will not appear there.
              </li>
              <li>
                <strong>Loss Risk:</strong> Clearing your browser history, site data, or private browsing cache
                will permanently erase locally saved resumes. We recommend frequently using the{" "}
                <strong>Export JSON Backup</strong> feature.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              2. Server and AI Data Flow
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              SoftCV Studio connects to a server-side AI provider <strong>only when you explicitly trigger
              an AI action</strong>. We never silently stream or index your resume content in the background.
            </p>
            <div className="bg-canvas-soft/70 hardware-bevel p-4 flex flex-col gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-indigo">
                EXACT DATA SENT PER AI ROUTE:
              </span>
              <ul className="list-disc list-inside space-y-1 text-carbon/90">
                <li>
                  <strong>Bullet Improver:</strong> Sends the specific bullet text you highlight, optional
                  job role, employer name, and relevant technologies.
                </li>
                <li>
                  <strong>Summary Helper:</strong> Sends your target role, years of experience, core skills,
                  and top experience bullets to draft a grounded professional summary.
                </li>
                <li>
                  <strong>Job Requirement Extractor:</strong> Sends the raw job description text you paste into
                  the Job Target drawer to extract structured keywords and responsibilities.
                </li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-carbon/90">
              <strong>Provider Credentials & Terms:</strong> All AI API keys reside strictly on the server and
              are never exposed to the client. Requests forwarded to external AI providers (e.g. OpenAI or
              compatible endpoints configured by the host) are subject to that provider’s data processing
              agreements and retention configurations. SoftCV Studio does not make unverified claims regarding
              third-party model training policies.
            </p>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              3. Telemetry, Analytics, and Error Logging
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              In accordance with ticket <code>RS-045</code>, SoftCV Studio enforces strict PII scrubbing across
              all server log outputs and diagnostics:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-carbon/90 ml-2">
              <li>
                Candidate personal names, email addresses, phone numbers, and full resume text are scrubbed
                or omitted from logs.
              </li>
              <li>
                Job descriptions, auth tokens, and API credentials are never recorded in error messages.
              </li>
              <li>
                Server diagnostic entries record only operational metadata: endpoint path, HTTP response status,
                request duration, and standardized error codes (e.g. <code>NOT_CONFIGURED</code>, <code>RATE_LIMITED</code>).
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              4. Data Export and Deletion Controls
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              You maintain total control over your local data through the in-app <strong>Data & Privacy</strong> subsystem:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-carbon/90 ml-2">
              <li>
                <strong>Single Resume Deletion:</strong> Permanently deletes a single resume document and cleans up
                its associated job target without touching other saved documents.
              </li>
              <li>
                <strong>Purge All Local Data:</strong> Clears all application keys (<code>softcv_*</code>) from browser
                storage with an irreversible confirmation dialog. Unrelated site data on your browser is strictly untouched.
              </li>
              <li>
                <strong>JSON Backup Export:</strong> Exports a complete, schema-versioned JSON file containing all your
                resumes and job targets for local archiving or portability.
              </li>
              <li>
                <strong>Synthetic Demo Reset:</strong> Clears your rack and restores clean, synthetic demonstration
                cartridges (Priya Mehta and Marcus Vance) with zero personal data.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm text-carbon uppercase border-b-2 border-carbon pb-1">
              5. Operator and Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-carbon/90">
              SoftCV Studio is currently an open-source / engineering project under development.
              For questions regarding the codebase, data architecture, or to report a security/privacy concern,
              inspect the documentation in the repository or file an issue in the project tracker.
            </p>
            <div className="bg-canvas-soft/70 hardware-bevel p-3 text-xs text-muted-indigo font-mono">
              [OPERATOR / ENTITY DETAILS REQUIRE FORMAL REGISTRATION PRIOR TO COMMERCIAL DEPLOYMENT]
            </div>
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
            <Link href="/terms" className="hover:text-nav-gold hover:underline">
              TERMS OF SERVICE
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
