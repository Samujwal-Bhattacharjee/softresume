/**
 * SoftCV Studio — Help Hub (2001 Console Chrome Edition)
 * RS-165, RS-175
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Operations Manual | SoftCV Studio",
  description:
    "Documentation, technical guides, and privacy controls help for SoftCV Studio.",
};

export default function HelpHubPage() {
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
                KNOWLEDGE BASE // DOC-REF: HELP-INDEX-V1
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-nav-gold uppercase tracking-tight mt-1">
              HELP & OPERATIONS MANUAL
            </h1>
            <p className="font-micro text-micro text-canvas-soft mt-1">
              CENTRAL ACCESS POINT FOR DOCUMENTATION, DISCLOSURES, AND GUIDANCE
            </p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface hardware-inset p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="bg-carbon text-nav-gold px-2 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel inline-block mb-2">
                CORE GUIDE
              </div>
              <h2 className="font-headline-sm text-headline-sm text-carbon uppercase">
                ATS & AI Verification Guide
              </h2>
              <p className="text-sm text-carbon/80 mt-2 leading-relaxed">
                Detailed answers to how parse readiness works, keyword matching heuristics,
                why you should avoid keyword stuffing, and exact AI data flows.
              </p>
            </div>
            <Link
              href="/help/ats-and-ai"
              className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-4 py-2 hardware-bevel text-center"
            >
              READ ATS & AI GUIDE →
            </Link>
          </div>

          <div className="bg-surface hardware-inset p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="bg-carbon text-nav-gold px-2 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel inline-block mb-2">
                DATA POLICY
              </div>
              <h2 className="font-headline-sm text-headline-sm text-carbon uppercase">
                Privacy Policy & Data Controls
              </h2>
              <p className="text-sm text-carbon/80 mt-2 leading-relaxed">
                Learn how your resumes are stored locally in your browser, how to export JSON
                backups, and how to safely purge data.
              </p>
            </div>
            <Link
              href="/privacy"
              className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-4 py-2 hardware-bevel text-center"
            >
              READ PRIVACY POLICY →
            </Link>
          </div>

          <div className="bg-surface hardware-inset p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="bg-carbon text-nav-gold px-2 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel inline-block mb-2">
                LEGAL TERMS
              </div>
              <h2 className="font-headline-sm text-headline-sm text-carbon uppercase">
                Terms of Service
              </h2>
              <p className="text-sm text-carbon/80 mt-2 leading-relaxed">
                Draft terms regarding user content authenticity, no employment guarantees,
                and human review responsibilities for AI output.
              </p>
            </div>
            <Link
              href="/terms"
              className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-4 py-2 hardware-bevel text-center"
            >
              READ TERMS OF SERVICE →
            </Link>
          </div>

          <div className="bg-surface hardware-inset p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="bg-carbon text-nav-gold px-2 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel inline-block mb-2">
                RELEASE NOTES
              </div>
              <h2 className="font-headline-sm text-headline-sm text-carbon uppercase">
                Release Notes & Known Limitations
              </h2>
              <p className="text-sm text-carbon/80 mt-2 leading-relaxed">
                Verified status of supported templates, export verification suites,
                Axe accessibility audits, and deferred features.
              </p>
            </div>
            <Link
              href="/release-notes"
              className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-4 py-2 hardware-bevel text-center"
            >
              READ RELEASE NOTES →
            </Link>
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
        </div>
      </main>
    </div>
  );
}
