/**
 * SoftCV Studio — Cartridge Initialization Flow (2001 Console Chrome Edition)
 * Reflects the exact design language from docs/DESIGN.md:
 * Hardware cartridge slot selection, archetype banks, and signal orange commit cues.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";
import {
  createEmptyResume,
  type ResumeDocument,
  type TemplateId,
} from "@/lib/schemas/resume";
import {
  FRESHER_FIXTURE,
  EXPERIENCED_FIXTURE,
} from "@/lib/fixtures/resume-fixtures";

type GoalId =
  | "fresher"
  | "internship"
  | "experienced"
  | "career-switcher"
  | "technical"
  | "creative";

interface GoalOption {
  id: GoalId;
  label: string;
  subtitle: string;
  icon: string;
  slotNumber: string;
  templateId: TemplateId;
  templateName: string;
  sectionOrder: string[];
}

const GOALS: GoalOption[] = [
  {
    id: "fresher",
    label: "Student / Recent Graduate",
    subtitle: "Education, coursework, key projects, and internships lead the layout hierarchy.",
    icon: "🎓",
    slotNumber: "01",
    templateId: "fresher-graduate",
    templateName: "Fresher / Graduate",
    sectionOrder: [
      "basics", "summary", "education", "skills", "projects",
      "internships", "awards", "volunteering", "certifications",
    ],
  },
  {
    id: "internship",
    label: "Internship Applicant",
    subtitle: "Compact targeted structure emphasizing projects, rapid learning, and core skills.",
    icon: "⚡",
    slotNumber: "02",
    templateId: "fresher-graduate",
    templateName: "Fresher / Graduate",
    sectionOrder: [
      "basics", "summary", "skills", "education", "projects",
      "internships", "awards",
    ],
  },
  {
    id: "experienced",
    label: "Experienced Professional",
    subtitle: "Chronological narrative focusing on business impact, scope, and career progression.",
    icon: "💼",
    slotNumber: "03",
    templateId: "classic-ats",
    templateName: "Classic ATS",
    sectionOrder: [
      "basics", "summary", "experience", "skills", "projects",
      "education", "certifications", "volunteering",
    ],
  },
  {
    id: "career-switcher",
    label: "Career Switcher",
    subtitle: "Hybrid functional layout elevating transferable competencies and cross-domain impact.",
    icon: "↗",
    slotNumber: "04",
    templateId: "modern-editorial",
    templateName: "Modern Editorial",
    sectionOrder: [
      "basics", "summary", "skills", "experience", "projects",
      "education", "certifications",
    ],
  },
  {
    id: "technical",
    label: "Technical / Engineering",
    subtitle: "Stack matrix, technical tooling, system metrics, and engineering achievements first.",
    icon: "⬡",
    slotNumber: "05",
    templateId: "technical",
    templateName: "Technical / Project-First",
    sectionOrder: [
      "basics", "summary", "skills", "projects", "experience",
      "education", "certifications",
    ],
  },
  {
    id: "creative",
    label: "Creative Professional",
    subtitle: "Editorial typography and exhibition structure for design, media, and portfolios.",
    icon: "✦",
    slotNumber: "06",
    templateId: "creative",
    templateName: "Creative / Portfolio",
    sectionOrder: [
      "basics", "summary", "experience", "projects", "skills",
      "education",
    ],
  },
];

type StartMethod = "blank" | "guided-fresher" | "guided-experienced";

export default function NewResumePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [startMethod, setStartMethod] = useState<StartMethod | null>(null);
  const [error, setError] = useState("");
  const { adapter } = useStorageAdapter();

  function handleGoalSelect(goal: GoalOption) {
    setSelectedGoal(goal);
    setStep(2);
  }

  function buildStarterDocument(
    goal: GoalOption,
    method: StartMethod
  ): ResumeDocument {
    if (method === "guided-fresher") {
      return {
        ...FRESHER_FIXTURE,
        settings: {
          ...FRESHER_FIXTURE.settings,
          templateId: goal.templateId,
          sectionOrder: goal.sectionOrder,
        },
      };
    }
    if (method === "guided-experienced") {
      return {
        ...EXPERIENCED_FIXTURE,
        settings: {
          ...EXPERIENCED_FIXTURE.settings,
          templateId: goal.templateId,
          sectionOrder: goal.sectionOrder,
        },
      };
    }
    return {
      ...createEmptyResume(),
      settings: {
        ...createEmptyResume().settings,
        templateId: goal.templateId,
        sectionOrder: goal.sectionOrder,
      },
    };
  }

  async function handleCreate() {
    if (!selectedGoal || !startMethod) return;
    setError("");

    try {
      const document = buildStarterDocument(selectedGoal, startMethod);
      const title =
        startMethod === "blank"
          ? "New Resume Cartridge"
          : startMethod === "guided-fresher"
          ? "Fresher Specimen Cartridge"
          : "Professional Specimen Cartridge";

      const meta = await Promise.resolve(
        adapter.createResume(title, document, {
          isMaster: true,
        })
      );

      startTransition(() => {
        router.push(`/resume/${meta.id}/edit`);
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to initialize cartridge. Please try again."
      );
    }
  }

  return (
    <div className="bg-periwinkle-mid text-carbon min-h-screen selection:bg-nav-gold selection:text-carbon font-body">
      {/* ── Fixed Chassis Header ── */}
      <header className="fixed top-0 w-full z-50">
        <div className="bg-carbon speaker-grille hardware-bevel">
          <div className="w-full max-w-[1760px] mx-auto h-12 px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between">
            <div className="flex items-center gap-space-lg">
              <Link
                href="/dashboard"
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
                <Link
                  href="/dashboard"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  ← DASHBOARD
                </Link>
                <span className="text-hairline">|</span>
                <span
                  className="font-nav-link px-space-md py-1 rounded-DEFAULT tracking-wider uppercase bg-carbon text-nav-gold hardware-inset font-bold"
                >
                  CARTRIDGE INITIALIZATION
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-space-sm font-micro text-micro text-canvas-soft">
              <span className="bg-systems-teal text-surface px-1.5 py-0.5 rounded-DEFAULT uppercase font-bold">
                STAGE {step} OF 2
              </span>
              <span className="hidden sm:inline">SYS.INITIALIZING</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Chassis Content ── */}
      <main id="main-content" className="w-full pt-16 pb-margin-desktop">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col gap-space-lg">
          {/* Header Status Bar */}
          <div className="w-full bg-carbon hardware-bevel p-space-sm sm:p-space-md text-platinum flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-3 h-3 bg-nav-gold hardware-inset"></div>
              <div>
                <h1 className="font-headline-sm text-headline-sm text-nav-gold uppercase tracking-wider">
                  {step === 1 ? "STAGE 01: SELECT TARGET ARCHETYPE" : "STAGE 02: SELECT INITIALIZATION MODE"}
                </h1>
                <p className="font-micro text-micro text-canvas-soft">
                  {step === 1
                    ? "Choose an archetype to configure optimal section hierarchy and parser-safe typography."
                    : `Archetype locked: ${selectedGoal?.label} (${selectedGoal?.templateName}). Choose starter memory state.`}
                </p>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className={`px-3 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-all ${
                  step === 1
                    ? "bg-nav-gold text-carbon"
                    : "bg-ink-soft text-platinum hover:bg-tertiary"
                }`}
              >
                1. ARCHETYPE
              </button>
              <button
                onClick={() => selectedGoal && setStep(2)}
                disabled={!selectedGoal}
                className={`px-3 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-all ${
                  step === 2
                    ? "bg-nav-gold text-carbon"
                    : selectedGoal
                    ? "bg-ink-soft text-platinum hover:bg-tertiary"
                    : "bg-carbon text-hairline cursor-not-allowed opacity-50"
                }`}
              >
                2. DATA MODE
              </button>
            </div>
          </div>

          {error && (
            <div className="w-full bg-games-red text-surface p-space-sm hardware-bevel font-ui-label uppercase flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Archetype Slot Rack ── */}
          {step === 1 && (
            <section className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md">
              <div className="bg-surface-container hardware-inset p-space-sm mb-space-sm flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-carbon uppercase tracking-wider">
                  AVAILABLE CARTRIDGE ARCHETYPES
                </span>
                <span className="font-micro text-micro text-carbon font-medium">
                  6 ARCHETYPES READY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {GOALS.map((goal) => {
                  const isSelected = selectedGoal?.id === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal)}
                      className={`text-left bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col group hover:-translate-y-0.5 transition-transform ${
                        isSelected ? "ring-2 ring-nav-gold" : ""
                      }`}
                    >
                      <div className="bg-carbon text-nav-gold px-space-xs py-1 flex justify-between items-center font-micro text-micro hardware-bevel">
                        <span className="uppercase font-bold tracking-wider">
                          SLOT #{goal.slotNumber}
                        </span>
                        <span className="bg-systems-teal text-surface px-1 py-0.5 uppercase">
                          {goal.templateName}
                        </span>
                      </div>

                      <div className="bg-surface hardware-inset p-space-md min-h-[160px] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{goal.icon}</span>
                            <h3 className="font-headline-sm text-headline-sm text-carbon uppercase tracking-tight">
                              {goal.label}
                            </h3>
                          </div>
                          <p className="font-body text-body text-carbon/80">
                            {goal.subtitle}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-dotted border-hairline/40 flex items-center justify-between">
                          <span className="font-micro text-micro text-carbon font-medium uppercase">
                            RECOMMENDED TEMPLATE
                          </span>
                          <span className="font-ui-label text-ui-label text-systems-teal uppercase font-bold">
                            {goal.templateName}
                          </span>
                        </div>
                      </div>

                      <div className="bg-platinum p-space-xs flex justify-between items-center hardware-bevel mt-1">
                        <span className="font-micro text-micro text-carbon font-medium uppercase">
                          CONFIGURED HIERARCHY
                        </span>
                        <span className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold px-3 py-0.5 font-ui-label text-ui-label uppercase tracking-wider hardware-bevel">
                          SELECT SLOT →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── STEP 2: Starter Data Initialization ── */}
          {step === 2 && selectedGoal && (
            <section className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md">
              <div className="bg-surface-container hardware-inset p-space-sm mb-space-sm flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-carbon uppercase tracking-wider">
                  INITIALIZATION MODES FOR: {selectedGoal.label.toUpperCase()}
                </span>
                <button
                  onClick={() => setStep(1)}
                  className="font-micro text-micro text-systems-teal hover:underline uppercase"
                >
                  ← CHANGE ARCHETYPE
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
                {/* Mode 1: Blank */}
                <button
                  onClick={() => setStartMethod("blank")}
                  className={`text-left bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col group hover:-translate-y-0.5 transition-transform ${
                    startMethod === "blank" ? "ring-2 ring-nav-gold" : ""
                  }`}
                >
                  <div className="bg-carbon text-nav-gold px-space-xs py-1 flex justify-between items-center font-micro text-micro hardware-bevel">
                    <span className="uppercase font-bold">MODE 01</span>
                    <span className="bg-ink-soft text-surface px-1">BLANK</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-md min-h-[140px] flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase mb-2">
                        Start Blank
                      </h3>
                      <p className="font-body text-body text-carbon/80">
                        Zero out all memory sectors. Populate your personal details, career history, and skills from scratch.
                      </p>
                    </div>
                    <div className="text-2xl mt-2">📄</div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-end hardware-bevel mt-1">
                    <span className={`px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel ${
                      startMethod === "blank" ? "bg-nav-gold text-carbon" : "bg-ink-soft text-platinum"
                    }`}>
                      {startMethod === "blank" ? "✓ SELECTED" : "SELECT"}
                    </span>
                  </div>
                </button>

                {/* Mode 2: Fresher Specimen */}
                <button
                  onClick={() => setStartMethod("guided-fresher")}
                  className={`text-left bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col group hover:-translate-y-0.5 transition-transform ${
                    startMethod === "guided-fresher" ? "ring-2 ring-nav-gold" : ""
                  }`}
                >
                  <div className="bg-carbon text-nav-gold px-space-xs py-1 flex justify-between items-center font-micro text-micro hardware-bevel">
                    <span className="uppercase font-bold">MODE 02</span>
                    <span className="bg-systems-teal text-surface px-1">STUDENTS</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-md min-h-[140px] flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase mb-2">
                        Load Fresher Specimen
                      </h3>
                      <p className="font-body text-body text-carbon/80">
                        Pre-populates sample coursework, hackathon projects, academic awards, and internship bullet points.
                      </p>
                    </div>
                    <div className="text-2xl mt-2">🎓</div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-end hardware-bevel mt-1">
                    <span className={`px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel ${
                      startMethod === "guided-fresher" ? "bg-nav-gold text-carbon" : "bg-ink-soft text-platinum"
                    }`}>
                      {startMethod === "guided-fresher" ? "✓ SELECTED" : "SELECT"}
                    </span>
                  </div>
                </button>

                {/* Mode 3: Experienced Specimen */}
                <button
                  onClick={() => setStartMethod("guided-experienced")}
                  className={`text-left bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col group hover:-translate-y-0.5 transition-transform ${
                    startMethod === "guided-experienced" ? "ring-2 ring-nav-gold" : ""
                  }`}
                >
                  <div className="bg-carbon text-nav-gold px-space-xs py-1 flex justify-between items-center font-micro text-micro hardware-bevel">
                    <span className="uppercase font-bold">MODE 03</span>
                    <span className="bg-amber text-carbon px-1">INDUSTRY</span>
                  </div>
                  <div className="bg-surface hardware-inset p-space-md min-h-[140px] flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-carbon uppercase mb-2">
                        Load Experienced Specimen
                      </h3>
                      <p className="font-body text-body text-carbon/80">
                        Pre-populates leadership roles, metric-driven achievements, system architecture bullets, and technical skills.
                      </p>
                    </div>
                    <div className="text-2xl mt-2">💼</div>
                  </div>
                  <div className="bg-platinum p-space-xs flex justify-end hardware-bevel mt-1">
                    <span className={`px-2 py-0.5 font-ui-label text-ui-label uppercase hardware-bevel ${
                      startMethod === "guided-experienced" ? "bg-nav-gold text-carbon" : "bg-ink-soft text-platinum"
                    }`}>
                      {startMethod === "guided-experienced" ? "✓ SELECTED" : "SELECT"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Commit Action Deck */}
              <div className="bg-carbon hardware-bevel p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-games-red animate-pulse"></span>
                  <span className="font-ui-label text-ui-label text-platinum uppercase">
                    CARTRIDGE TARGET: {selectedGoal.label.toUpperCase()} · MODE: {startMethod ? startMethod.toUpperCase() : "NONE SELECTED"}
                  </span>
                </div>

                <div className="flex items-center gap-space-md">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-ink-soft hover:bg-tertiary text-platinum px-space-md py-space-sm font-ui-label text-ui-label uppercase hardware-bevel"
                  >
                    ← BACK
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!startMethod || isPending}
                    className={`font-nav-link text-nav-link uppercase px-space-xl py-space-sm hardware-bevel flex items-center gap-2 active:translate-y-0.5 transition-all ${
                      startMethod && !isPending
                        ? "bg-secondary-container hover:bg-nav-gold text-carbon font-bold shadow-xs cursor-pointer"
                        : "bg-hairline text-platinum/50 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span>{isPending ? "INITIALIZING..." : "INITIALIZE RESUME CARTRIDGE →"}</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
