/**
 * SoftCV Studio — Release Notes & Known Limitations (2001 Console Chrome Edition)
 * RS-176
 *
 * Truthful, verified release documentation for SoftCV Studio Sprint 06.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Notes & Known Limitations | SoftCV Studio",
  description:
    "Verified feature audit, implemented templates, export pipeline status, and known architectural boundaries for SoftCV Studio.",
};

export default function ReleaseNotesPage() {
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
                AUDIT TELEMETRY // RELEASE-BUILD: 2026.10-SP06
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-nav-gold uppercase tracking-tight mt-1">
              RELEASE NOTES & KNOWN LIMITATIONS
            </h1>
            <p className="font-micro text-micro text-canvas-soft mt-1">
              VERIFIED SHIP CAPABILITIES, TEMPLATE INVENTORY, AND OPERATIONAL CONSTRAINTS
            </p>
          </div>

          <div className="bg-systems-teal text-surface px-3 py-1.5 hardware-bevel font-ui-label text-ui-label uppercase font-bold">
            SPRINT 06 VERIFIED
          </div>
        </div>

        {/* Section 1: Template Roster */}
        <div className="bg-surface hardware-inset p-6 sm:p-8 flex flex-col gap-4 text-carbon">
          <div className="flex items-center justify-between border-b-2 border-carbon pb-2">
            <h2 className="font-headline-sm text-headline-sm uppercase">
              1. Resume Template Roster
            </h2>
            <span className="font-micro text-micro bg-carbon text-nav-gold px-2 py-0.5 hardware-bevel">
              5 IMPLEMENTED · 1 DEFERRED
            </span>
          </div>

          <p className="text-sm text-carbon/85 leading-relaxed">
            Five production templates are fully implemented, unit-tested, and verified against both
            PDF text extraction and DOCX structural validators:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-periwinkle-mid hardware-bevel p-3">
              <div className="font-bold text-xs uppercase text-carbon">01. CLASSIC ATS</div>
              <div className="text-xs text-systems-teal font-bold uppercase mt-0.5">100% PARSE-SAFE</div>
              <p className="text-xs text-carbon/80 mt-1">
                Single-column, serif/sans hybrid, strict sequential reading order for high-volume enterprise filters.
              </p>
            </div>

            <div className="bg-periwinkle-mid hardware-bevel p-3">
              <div className="font-bold text-xs uppercase text-carbon">02. FRESHER / GRADUATE</div>
              <div className="text-xs text-systems-teal font-bold uppercase mt-0.5">100% PARSE-SAFE</div>
              <p className="text-xs text-carbon/80 mt-1">
                Prioritizes education, academic coursework, key engineering projects, and technical skills.
              </p>
            </div>

            <div className="bg-periwinkle-mid hardware-bevel p-3">
              <div className="font-bold text-xs uppercase text-carbon">03. MODERN EDITORIAL</div>
              <div className="text-xs text-amber font-bold uppercase mt-0.5">EXPRESSIVE LAYOUT</div>
              <p className="text-xs text-carbon/80 mt-1">
                Refined typography, balanced margins, and elegant section dividers for design and leadership roles.
              </p>
            </div>

            <div className="bg-periwinkle-mid hardware-bevel p-3">
              <div className="font-bold text-xs uppercase text-carbon">04. TECHNICAL / PROJECT-FIRST</div>
              <div className="text-xs text-systems-teal font-bold uppercase mt-0.5">100% PARSE-SAFE</div>
              <p className="text-xs text-carbon/80 mt-1">
                Software development focus with dedicated technology tags, repository URLs, and project bullets.
              </p>
            </div>

            <div className="bg-periwinkle-mid hardware-bevel p-3">
              <div className="font-bold text-xs uppercase text-carbon">05. EXPERIENCED PROFESSIONAL</div>
              <div className="text-xs text-systems-teal font-bold uppercase mt-0.5">100% PARSE-SAFE</div>
              <p className="text-xs text-carbon/80 mt-1">
                Multi-page linear narrative for senior practitioners with deep tenure, leadership bullets, and skills.
              </p>
            </div>

            <div className="bg-canvas-soft/70 border border-hairline p-3 opacity-80">
              <div className="font-bold text-xs uppercase text-muted-indigo">06. CREATIVE / PORTFOLIO</div>
              <div className="text-xs text-games-red font-bold uppercase mt-0.5">DEFERRED FROM MVP</div>
              <p className="text-xs text-carbon/70 mt-1">
                Intentionally deferred in accordance with backlog priority to ensure zero regression on ATS parsing safety.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Storage and Cloud Mode */}
        <div className="bg-surface hardware-inset p-6 sm:p-8 flex flex-col gap-4 text-carbon">
          <div className="flex items-center justify-between border-b-2 border-carbon pb-2">
            <h2 className="font-headline-sm text-headline-sm uppercase">
              2. Persistence Architecture & Boundaries
            </h2>
            <span className="font-micro text-micro bg-ink-soft text-surface px-2 py-0.5 hardware-bevel">
              LOCALSTORAGE ONLY
            </span>
          </div>

          <ul className="list-disc list-inside space-y-2 text-sm text-carbon/90">
            <li>
              <strong>No Multi-User Cloud / RLS Active:</strong> All user records reside strictly in the client’s browser
              via <code>localStorage</code>. There is no active Supabase Auth, PostgreSQL database, or Row-Level Security
              (RLS) operational in this build.
            </li>
            <li>
              <strong>Ticket RS-172 Status:</strong> Cross-user cloud isolation tests are formally marked <strong>Blocked</strong>
              pending future cloud epics (<code>RS-040</code> through <code>RS-042</code>). Local data isolation, deletion
              boundaries, and single/bulk purge behavior are fully verified.
            </li>
            <li>
              <strong>Data Protection:</strong> Full JSON backup export and irreversible purge controls are accessible via
              the Data & Privacy subsystem.
            </li>
          </ul>
        </div>

        {/* Section 3: AI Provider Subsystem */}
        <div className="bg-surface hardware-inset p-6 sm:p-8 flex flex-col gap-4 text-carbon">
          <div className="flex items-center justify-between border-b-2 border-carbon pb-2">
            <h2 className="font-headline-sm text-headline-sm uppercase">
              3. Server-Side AI Subsystem
            </h2>
            <span className="font-micro text-micro bg-carbon text-nav-gold px-2 py-0.5 hardware-bevel">
              SERVER CREDENTIALS ONLY
            </span>
          </div>

          <ul className="list-disc list-inside space-y-2 text-sm text-carbon/90">
            <li>
              <strong>Honest Failure State:</strong> When the server lacks an <code>AI_API_KEY</code>, the API returns
              status <code>503 NOT_CONFIGURED</code>. The user is informed truthfully that AI writing assistance is
              offline—no simulated or deceptive text is generated.
            </li>
            <li>
              <strong>In-Memory Rate Limiting:</strong> Rate limits are enforced in-memory per container process (20 req/min
              for bullets, 10 req/min for summaries and job extraction). Note: this is instance-local and not a distributed
              Redis cache.
            </li>
            <li>
              <strong>PII Redaction:</strong> Candidate emails, phone numbers, and full resume texts are scrubbed from
              server log payloads.
            </li>
          </ul>
        </div>

        {/* Section 4: Export Engine Verification */}
        <div className="bg-surface hardware-inset p-6 sm:p-8 flex flex-col gap-4 text-carbon">
          <div className="flex items-center justify-between border-b-2 border-carbon pb-2">
            <h2 className="font-headline-sm text-headline-sm uppercase">
              4. Export Engine & Verification Status
            </h2>
            <span className="font-micro text-micro bg-systems-teal text-surface px-2 py-0.5 hardware-bevel font-bold">
              VERIFIED PASSING
            </span>
          </div>

          <ul className="list-disc list-inside space-y-2 text-sm text-carbon/90">
            <li>
              <strong>PDF Generation:</strong> Server vector generation via Chromium/Playwright preserves point geometry,
              standard page dimensions (A4 & US Letter), and text extraction order. Instant browser print fallback is available.
            </li>
            <li>
              <strong>DOCX Generation:</strong> Client-side compilation generates valid Office Open XML packages with
              heading structures verified by structural tests.
            </li>
            <li>
              <strong>Filename Sanitization:</strong> Special characters, spaces, and path traversal strings are safely
              filtered across all export routes.
            </li>
          </ul>
        </div>

        {/* Section 5: Accessibility & Remaining Manual Audits */}
        <div className="bg-surface hardware-inset p-6 sm:p-8 flex flex-col gap-4 text-carbon">
          <div className="flex items-center justify-between border-b-2 border-carbon pb-2">
            <h2 className="font-headline-sm text-headline-sm uppercase">
              5. Accessibility & Audit Telemetry
            </h2>
            <span className="font-micro text-micro bg-carbon text-nav-gold px-2 py-0.5 hardware-bevel">
              9 AXE SCANS GREEN
            </span>
          </div>

          <ul className="list-disc list-inside space-y-2 text-sm text-carbon/90">
            <li>
              <strong>Automated Axe Coverage:</strong> All 9 release-critical page and modal states pass with 0 critical
              and 0 serious violations.
            </li>
            <li>
              <strong>Console Chrome Visuals:</strong> WCAG AA contrast standards are strictly enforced across Nintendo
              carbon navy (<code>#21242e</code>), periwinkle surfaces (<code>#eaedff</code>), and wayfinding amber (<code>#ecab37</code>).
            </li>
            <li>
              <strong>Manual Testing Remaining:</strong> Full manual screen-reader verification with physical NVDA and
              VoiceOver setups has not been conducted by a human tester and remains an open operational item.
            </li>
          </ul>
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
