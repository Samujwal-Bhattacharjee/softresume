/**
 * SoftCV Studio — 2001 Hardware Chrome Edition Landing Page
 * Directly reflects the exact design specification from Stitch project 7192787051896672021.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SoftCV Studio — 2001 Hardware Chrome Edition",
  description:
    "A professional resume studio with structured editing, live preview, AI writing assistance that preserves your facts, transparent ATS readiness checks, and real PDF & DOCX export.",
};

export default function HomePage() {
  return (
    <div className="bg-periwinkle-mid text-carbon min-h-screen selection:bg-nav-gold selection:text-carbon font-body">
      {/* ── Fixed Chassis Header ── */}
      <header className="fixed top-0 w-full z-50">
        <div className="bg-carbon speaker-grille hardware-bevel">
          <div className="w-full max-w-[1760px] mx-auto h-12 px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between">
            <div className="flex items-center gap-space-lg">
              <Link
                href="/"
                className="bg-periwinkle-mid px-space-md py-space-xs rounded-full hardware-bevel flex items-center gap-space-xs hover:opacity-95 transition-opacity"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-games-red hardware-inset"></div>
                <span className="font-display text-nav-link text-carbon tracking-tight">
                  SOFTCV STUDIO
                </span>
                <span className="font-micro text-micro bg-carbon text-nav-gold px-1 rounded-DEFAULT uppercase tracking-wider">
                  v2001
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-space-xs hardware-inset bg-carbon/90 px-space-sm py-1 rounded-DEFAULT">
                <a
                  href="#features"
                  className="font-nav-link px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all bg-carbon text-nav-gold hardware-inset font-bold"
                >
                  FEATURES
                </a>
                <span className="text-hairline">|</span>
                <a
                  href="#templates"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  TEMPLATES
                </a>
                <span className="text-hairline">|</span>
                <a
                  href="#ats-check"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  ATS CHECK
                </a>
                <span className="text-hairline">|</span>
                <a
                  href="#help"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  HELP
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-space-md">
              <Link
                href="/resume/new"
                className="bg-amber hover:bg-nav-gold text-carbon font-nav-link text-nav-link uppercase px-space-md py-space-xs rounded-DEFAULT hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform"
              >
                START BUILDING →
              </Link>
              <Link
                href="/dashboard"
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hardware-bevel active:scale-95 transition-transform"
                title="Open Dashboard"
              >
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Hardware Body ── */}
      <main id="main-content" className="w-full pt-16 pb-margin-desktop">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col w-full gap-space-lg">
            {/* ── HARDWARE HERO CHASSIS ── */}
            <section className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md">
              <div className="bg-surface hardware-inset p-space-md sm:p-space-xl relative overflow-hidden">
                {/* Dot-matrix pattern in the top-right corner behind the portrait */}
                <div className="absolute top-0 right-8 sm:right-20 w-80 h-72 speaker-grille opacity-35 pointer-events-none"></div>

                {/* Headline Block & Cartridge Preview Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center relative z-10">
                  <div className="lg:col-span-7 flex flex-col gap-space-md">
                    <div className="flex flex-col">
                      <h1 className="font-display text-display text-carbon tracking-tight leading-none uppercase">
                        Create once.
                      </h1>
                      <div className="my-1 inline-block">
                        <span className="inline-block font-display text-display text-systems-teal uppercase tracking-tight bg-surface-container px-2 py-0.5 hardware-bevel">
                          Improve with AI.
                        </span>
                      </div>
                      <h1 className="font-display text-display text-carbon tracking-tight leading-none uppercase">
                        Tailor to each job.
                      </h1>
                    </div>
                    <p className="font-hero-tagline text-hero-tagline text-carbon max-w-xl">
                      A professional resume studio with structured editing, live preview, AI writing assistance that preserves your facts, transparent ATS readiness checks, and real PDF &amp; DOCX export.
                    </p>

                    {/* Primary Control Deck */}
                    <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                      <Link
                        href="/resume/new"
                        className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-lg py-space-md hardware-bevel flex items-center gap-space-xs active:translate-y-0.5 transition-transform shadow-xs"
                      >
                        <span>Build My Resume →</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="bg-carbon hover:bg-ink-soft text-nav-gold font-nav-link text-nav-link uppercase px-space-lg py-space-md hardware-bevel flex items-center gap-space-xs active:translate-y-0.5 transition-transform shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-nav-gold"></span>
                        <span>Open Dashboard</span>
                      </Link>
                    </div>

                    {/* Feature Tick Points Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs pt-space-md">
                      <div className="bg-platinum p-space-xs hardware-bevel flex items-center gap-1">
                        <span className="font-body-bold text-body-bold text-systems-teal">✓</span>
                        <span className="font-ui-label text-ui-label text-carbon truncate">
                          Real PDF &amp; DOCX export
                        </span>
                      </div>
                      <div className="bg-platinum p-space-xs hardware-bevel flex items-center gap-1">
                        <span className="font-body-bold text-body-bold text-systems-teal">✓</span>
                        <span className="font-ui-label text-ui-label text-carbon truncate">
                          No sign-in required to start
                        </span>
                      </div>
                      <div className="bg-platinum p-space-xs hardware-bevel flex items-center gap-1">
                        <span className="font-body-bold text-body-bold text-systems-teal">✓</span>
                        <span className="font-ui-label text-ui-label text-carbon truncate">
                          Data stays on your device
                        </span>
                      </div>
                      <div className="bg-platinum p-space-xs hardware-bevel flex items-center gap-1">
                        <span className="font-body-bold text-body-bold text-systems-teal">✓</span>
                        <span className="font-ui-label text-ui-label text-carbon truncate">
                          ATS-friendly templates
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Stitch Hero Portrait Visual (Right Column, Seamless on White) ── */}
                  <div className="lg:col-span-5 flex flex-col justify-end items-center h-full">
                    <div className="w-full max-w-[420px] flex items-end justify-center">
                      <img
                        src="/images/hero-portrait.png"
                        alt="Candidate Portrait"
                        className="w-full h-auto object-contain block"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── TEMPLATES CARTRIDGE RACK ── */}
            <section
              id="templates"
              className="w-full bg-carbon hardware-bevel p-space-sm sm:p-space-md text-platinum"
            >
              {/* Header Ribbon */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm pb-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-nav-gold hardware-inset"></div>
                  <h2 className="font-headline-sm text-headline-sm text-nav-gold uppercase tracking-wider">
                    PROFESSIONAL TEMPLATES · SWITCH ANYTIME WITHOUT LOSING CONTENT
                  </h2>
                </div>
                <Link
                  href="/resume/new"
                  className="bg-ink-soft hover:bg-tertiary text-platinum px-space-md py-1 hardware-bevel font-link text-link uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <span>See all 6 templates →</span>
                </Link>
              </div>

              {/* Cartridge Carousel Deck: 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* Template 1: Classic ATS */}
                <div className="bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col text-carbon group hover:-translate-y-0.5 transition-transform">
                  <div className="bg-carbon text-nav-gold px-space-xs py-0.5 flex justify-between items-center font-micro text-micro">
                    <span className="uppercase">SLOT #01</span>
                    <span className="bg-systems-teal text-surface px-1">ATS-SAFE</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-sm h-48 flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="h-3 w-1/2 bg-carbon"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                      <div className="h-1.5 w-3/4 bg-hairline/30"></div>
                      <div className="h-2 w-1/3 bg-ink-soft mt-2"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                      <div className="h-1.5 w-5/6 bg-hairline/30"></div>
                    </div>
                    <div className="bg-surface-container-high p-1 text-center font-micro text-micro text-carbon">
                      STANDARD PARSER FORMAT
                    </div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-between items-center hardware-bevel mt-1">
                    <div>
                      <div className="font-body-bold text-body-bold text-carbon">Classic ATS</div>
                      <div className="font-micro text-micro text-carbon font-medium">ATS-safe</div>
                    </div>
                    <Link
                      href="/resume/new"
                      className="bg-amber hover:bg-nav-gold text-carbon px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel"
                    >
                      LOAD
                    </Link>
                  </div>
                </div>

                {/* Template 2: Fresher / Graduate */}
                <div className="bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col text-carbon group hover:-translate-y-0.5 transition-transform">
                  <div className="bg-carbon text-nav-gold px-space-xs py-0.5 flex justify-between items-center font-micro text-micro">
                    <span className="uppercase">SLOT #02</span>
                    <span className="bg-ink-soft text-surface px-1">STUDENTS</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-sm h-48 flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-canvas-soft hardware-bevel flex items-center justify-center font-display text-micro">
                          EDU
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="h-2.5 w-3/4 bg-carbon"></div>
                          <div className="h-1.5 w-1/2 bg-hairline/30"></div>
                        </div>
                      </div>
                      <div className="h-2 w-2/5 bg-ink-soft mt-3"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                      <div className="h-1.5 w-4/5 bg-hairline/30"></div>
                    </div>
                    <div className="bg-surface-container-high p-1 text-center font-micro text-micro text-carbon">
                      EDUCATION &amp; PROJECT FOCUS
                    </div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-between items-center hardware-bevel mt-1">
                    <div>
                      <div className="font-body-bold text-body-bold text-carbon">
                        Fresher / Graduate
                      </div>
                      <div className="font-micro text-micro text-carbon font-medium">Students</div>
                    </div>
                    <Link
                      href="/resume/new"
                      className="bg-amber hover:bg-nav-gold text-carbon px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel"
                    >
                      LOAD
                    </Link>
                  </div>
                </div>

                {/* Template 3: Technical */}
                <div className="bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col text-carbon group hover:-translate-y-0.5 transition-transform">
                  <div className="bg-carbon text-nav-gold px-space-xs py-0.5 flex justify-between items-center font-micro text-micro">
                    <span className="uppercase">SLOT #03</span>
                    <span className="bg-systems-teal text-surface px-1">ENGINEERS</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-sm h-48 flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="h-2.5 w-2/3 bg-carbon"></div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <div className="bg-canvas-soft/30 p-1">
                          <div className="h-1.5 w-full bg-systems-teal"></div>
                          <div className="h-1.5 w-4/5 bg-hairline/30 mt-1"></div>
                        </div>
                        <div className="bg-canvas-soft/30 p-1">
                          <div className="h-1.5 w-full bg-systems-teal"></div>
                          <div className="h-1.5 w-3/4 bg-hairline/30 mt-1"></div>
                        </div>
                      </div>
                      <div className="h-2 w-1/3 bg-ink-soft mt-1"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                      <div className="h-1.5 w-full bg-hairline/30"></div>
                    </div>
                    <div className="bg-surface-container-high p-1 text-center font-micro text-micro text-carbon">
                      STACK &amp; METRIC MATRIX
                    </div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-between items-center hardware-bevel mt-1">
                    <div>
                      <div className="font-body-bold text-body-bold text-carbon">Technical</div>
                      <div className="font-micro text-micro text-carbon font-medium">Engineers</div>
                    </div>
                    <Link
                      href="/resume/new"
                      className="bg-amber hover:bg-nav-gold text-carbon px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel"
                    >
                      LOAD
                    </Link>
                  </div>
                </div>

                {/* Template 4: Modern Editorial */}
                <div className="bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col text-carbon group hover:-translate-y-0.5 transition-transform">
                  <div className="bg-carbon text-nav-gold px-space-xs py-0.5 flex justify-between items-center font-micro text-micro">
                    <span className="uppercase">SLOT #04</span>
                    <span className="bg-secondary-container text-carbon font-bold px-1">VERSATILE</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-sm h-48 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 bg-surface-container p-1 flex flex-col gap-1">
                        <div className="h-2 w-full bg-ink-soft"></div>
                        <div className="h-1 w-full bg-hairline/30"></div>
                        <div className="h-1 w-full bg-hairline/30"></div>
                        <div className="h-1 w-2/3 bg-hairline/30"></div>
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <div className="h-3 w-4/5 bg-carbon"></div>
                        <div className="h-1.5 w-full bg-hairline/30"></div>
                        <div className="h-1.5 w-full bg-hairline/30"></div>
                        <div className="h-1.5 w-3/4 bg-hairline/30"></div>
                      </div>
                    </div>
                    <div className="bg-surface-container-high p-1 text-center font-micro text-micro text-carbon">
                      ASYMMETRIC TWO-COLUMN
                    </div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-between items-center hardware-bevel mt-1">
                    <div>
                      <div className="font-body-bold text-body-bold text-carbon">Modern Editorial</div>
                      <div className="font-micro text-micro text-carbon font-medium">Versatile</div>
                    </div>
                    <Link
                      href="/resume/new"
                      className="bg-amber hover:bg-nav-gold text-carbon px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel"
                    >
                      LOAD
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FEATURE SPECIFICATION GRID ── */}
            <section id="features" className="w-full bg-canvas-soft hardware-bevel p-space-sm sm:p-space-md">
              <div className="bg-surface hardware-inset p-space-md sm:p-space-lg">
                {/* Section Title Unit */}
                <div className="flex flex-col gap-1 pb-space-lg">
                  <div className="flex items-center gap-space-xs">
                    <span className="bg-games-red text-surface px-1.5 py-0.5 font-micro text-micro uppercase tracking-wider">
                      HARDWARE ARSENAL
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-carbon uppercase">
                    Everything you need to apply with confidence
                  </h2>
                  <p className="font-body text-body text-ink-soft max-w-2xl">
                    No subscriptions to start. No locked features. Build, preview, and download real documents in minutes.
                  </p>
                </div>

                {/* 6 Hardware Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                  {/* Feature 1 */}
                  <div className="bg-platinum hardware-bevel p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="w-7 h-7 bg-ink-soft text-surface flex items-center justify-center font-display text-link hardware-bevel">
                          01
                        </span>
                        <span className="font-micro text-micro bg-surface-container text-ink-soft px-1 hardware-inset">
                          CORE
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase">
                        Live Preview Editor
                      </h3>
                      <p className="font-body text-body text-carbon">
                        See your resume update in real time as you edit. Structured fields, add/remove/reorder sections, no design skills needed.
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container p-space-xs hardware-inset flex items-center justify-between font-micro text-micro text-systems-teal">
                      <span>INPUT: DUAL VIEW</span>
                      <span>STATUS: ACTIVE</span>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-platinum hardware-bevel p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="w-7 h-7 bg-ink-soft text-surface flex items-center justify-center font-display text-link hardware-bevel">
                          02
                        </span>
                        <span className="font-micro text-micro bg-surface-container text-ink-soft px-1 hardware-inset">
                          LAYOUT
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase">
                        Six Professional Templates
                      </h3>
                      <p className="font-body text-body text-carbon">
                        Classic ATS, Modern Editorial, Fresher/Graduate, Technical, Experienced Professional, and Creative. Switch templates without losing your content.
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container p-space-xs hardware-inset flex items-center justify-between font-micro text-micro text-systems-teal">
                      <span>PRESETS: 6 READY</span>
                      <span>LOSSLESS: TRUE</span>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div id="ats-check" className="bg-platinum hardware-bevel p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="w-7 h-7 bg-ink-soft text-surface flex items-center justify-center font-display text-link hardware-bevel">
                          03
                        </span>
                        <span className="font-micro text-micro bg-surface-container text-ink-soft px-1 hardware-inset">
                          AUDIT
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase">
                        ATS Readiness Checks
                      </h3>
                      <p className="font-body text-body text-carbon">
                        Transparent rule-based checks for parse readiness, content completeness, and writing quality. We show findings — we never promise a score.
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container p-space-xs hardware-inset flex items-center justify-between font-micro text-micro text-systems-teal">
                      <span>AUDIT RULES: TRANSPARENT</span>
                      <span>SCORES: REAL</span>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="bg-platinum hardware-bevel p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="w-7 h-7 bg-ink-soft text-surface flex items-center justify-center font-display text-link hardware-bevel">
                          04
                        </span>
                        <span className="font-micro text-micro bg-surface-container text-ink-soft px-1 hardware-inset">
                          FACT ENGINE
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase">
                        AI Writing Assistance
                      </h3>
                      <p className="font-body text-body text-carbon">
                        Improve bullets and draft summaries using only facts you&apos;ve provided. Side-by-side diffs, Accept/Edit/Reject — your words stay yours.
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container p-space-xs hardware-inset flex items-center justify-between font-micro text-micro text-systems-teal">
                      <span>FACT INVENT: BLOCKED</span>
                      <span>DIFF: INTERACTIVE</span>
                    </div>
                  </div>

                  {/* Feature 5 */}
                  <div className="bg-platinum hardware-bevel p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="w-7 h-7 bg-ink-soft text-surface flex items-center justify-center font-display text-link hardware-bevel">
                          05
                        </span>
                        <span className="font-micro text-micro bg-surface-container text-ink-soft px-1 hardware-inset">
                          NATIVE ROM
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase">
                        PDF &amp; DOCX Export
                      </h3>
                      <p className="font-body text-body text-carbon">
                        Real, editable documents — not screenshots. Selectable text, correct page sizes, proper formatting. Tested on actual generated files.
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container p-space-xs hardware-inset flex items-center justify-between font-micro text-micro text-systems-teal">
                      <span>FORMATS: PDF + DOCX</span>
                      <span>VECTOR: PRESERVED</span>
                    </div>
                  </div>

                  {/* Feature 6 */}
                  <div className="bg-platinum hardware-bevel p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="w-7 h-7 bg-ink-soft text-surface flex items-center justify-center font-display text-link hardware-bevel">
                          06
                        </span>
                        <span className="font-micro text-micro bg-surface-container text-ink-soft px-1 hardware-inset">
                          TARGET
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase">
                        Job Tailoring
                      </h3>
                      <p className="font-body text-body text-carbon">
                        Paste a job description to compare requirements against your resume. Create a tailored copy from your master resume without overwriting it.
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container p-space-xs hardware-inset flex items-center justify-between font-micro text-micro text-systems-teal">
                      <span>MASTER COPY: PROTECTED</span>
                      <span>DELTA: ISOLATED</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SAFEGUARDS LOG TELEMETRY PANEL ── */}
            <section
              id="safeguards"
              className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md"
            >
              <div className="bg-carbon hardware-bevel p-1">
                {/* Simulated Console Terminal Header Bar */}
                <div className="bg-carbon px-space-md py-1.5 flex flex-wrap items-center justify-between gap-space-xs border-b border-hairline">
                  <div className="flex items-center gap-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-games-red hardware-bevel"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber hardware-bevel"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-systems-teal hardware-bevel"></span>
                    </div>
                    <span className="font-nav-link text-nav-link text-nav-gold tracking-wider uppercase">
                      ai-safeguards.log
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm font-micro text-micro text-ice">
                    <span className="hidden sm:inline">KERNEL: VERIFIED CLIENT-ONLY</span>
                    <span className="bg-ink-soft text-platinum px-1 hardware-inset">
                      AUDIT PASS
                    </span>
                  </div>
                </div>

                {/* Telemetry Sub-plate */}
                <div className="bg-surface-container hardware-inset p-space-md sm:p-space-lg text-carbon">
                  <div className="flex flex-col gap-1 pb-space-md">
                    <span className="font-ui-label text-ui-label text-systems-teal uppercase tracking-widest">
                      CRITICAL POLICY ENFORCEMENT
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-carbon uppercase">
                      AI that helps, never invents
                    </h2>
                    <p className="font-body text-body text-ink-soft max-w-2xl">
                      Our AI suggestions are proposals, not commands. Every change shows you the original text, the suggested text, and an explanation. You Accept, Edit, or Reject — always.
                    </p>
                  </div>

                  {/* 2x2 Guardrail Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Safeguard Card 1 */}
                    <div className="bg-surface hardware-bevel p-space-md flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-DEFAULT bg-systems-teal text-surface flex items-center justify-center font-display text-body-bold shrink-0 hardware-bevel">
                        ✓
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-bold text-body-bold text-carbon">
                          Improves clarity and specificity using your real experience
                        </span>
                        <span className="font-micro text-micro text-muted-indigo mt-0.5">
                          Fact anchoring preserves original context and dates
                        </span>
                      </div>
                    </div>

                    {/* Safeguard Card 2 */}
                    <div className="bg-surface hardware-bevel p-space-md flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-DEFAULT bg-systems-teal text-surface flex items-center justify-center font-display text-body-bold shrink-0 hardware-bevel">
                        ✓
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-bold text-body-bold text-carbon">
                          Shows diff of every change before applying anything
                        </span>
                        <span className="font-micro text-micro text-muted-indigo mt-0.5">
                          Granular word-level inspect before committing to memory
                        </span>
                      </div>
                    </div>

                    {/* Safeguard Card 3 */}
                    <div className="bg-surface hardware-bevel p-space-md flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-DEFAULT bg-games-red text-surface flex items-center justify-center font-display text-body-bold shrink-0 hardware-bevel">
                        ✕
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-bold text-body-bold text-carbon">
                          Never invents metrics, employers, or skills you don&apos;t have
                        </span>
                        <span className="font-micro text-micro text-muted-indigo mt-0.5">
                          Hardware-level zero hallucination constraint strictly locked
                        </span>
                      </div>
                    </div>

                    {/* Safeguard Card 4 */}
                    <div className="bg-surface hardware-bevel p-space-md flex items-start gap-space-sm">
                      <div className="w-6 h-6 rounded-DEFAULT bg-games-red text-surface flex items-center justify-center font-display text-body-bold shrink-0 hardware-bevel">
                        ✕
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-bold text-body-bold text-carbon">
                          Never silently rewrites your resume in bulk
                        </span>
                        <span className="font-micro text-micro text-muted-indigo mt-0.5">
                          Requires intentional manual validation for each bullet
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── BOTTOM CALL-TO-ACTION POWER MODULE ── */}
            <section className="w-full bg-platinum hardware-bevel p-space-sm sm:p-space-md">
              <div className="bg-periwinkle-mid hardware-inset p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-lg">
                <div className="flex flex-col gap-1 max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center justify-center md:justify-start gap-1 text-carbon font-semibold font-micro text-micro uppercase">
                    <span className="w-2 h-2 rounded-full bg-games-red animate-pulse"></span>
                    <span>HARDWARE READY FOR LAUNCH</span>
                  </div>
                  <h2 className="font-display text-headline-lg sm:text-display text-carbon uppercase tracking-tight leading-none">
                    Ready to build your resume?
                  </h2>
                  <p className="font-hero-tagline text-hero-tagline text-carbon font-medium">
                    No account required to start. Your data stays local until you decide otherwise.
                  </p>
                </div>

                {/* Main Action Push Button */}
                <div className="shrink-0">
                  <Link
                    href="/resume/new"
                    className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-xl py-space-md hardware-bevel flex items-center gap-space-sm active:translate-y-1 transition-transform shadow-md"
                  >
                    <span className="font-body-bold text-body-bold tracking-wider">
                      Start Building — it&apos;s free →
                    </span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-carbon hardware-bevel text-platinum py-space-xl mt-margin-desktop">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="font-headline-sm text-headline-sm text-nav-gold uppercase tracking-wider">
              SOFTCV STUDIO CHASSIS INTERFACE
            </div>
            <div className="font-micro text-micro text-ice">
              © SoftCV Studio — All data stored locally in your browser. Engineered for hardware-grade confidentiality.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-lg text-link font-link text-ice">
            <Link href="/privacy" className="hover:text-nav-gold uppercase transition-colors">
              PRIVACY
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/terms" className="hover:text-nav-gold uppercase transition-colors">
              TERMS
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/help/ats-and-ai" className="hover:text-nav-gold uppercase transition-colors">
              ATS &amp; AI GUIDE
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/release-notes" className="hover:text-nav-gold uppercase transition-colors">
              RELEASE NOTES
            </Link>
            <div className="bg-amber text-carbon px-space-sm py-1 rounded-DEFAULT font-ui-label text-ui-label hardware-bevel uppercase">
              100% PRIVATE &amp; CLIENT-SIDE CERTIFIED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
