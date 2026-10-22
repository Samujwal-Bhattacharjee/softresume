/**
 * SoftCV Studio — Responsive Editor Shell (2001 Console Chrome Edition)
 * Reflects the exact design language from docs/DESIGN.md:
 * - Carbon command bar with speaker grille and hardware status telemetry
 * - Beveled hardware section navigation tabs
 * - Brushed periwinkle drafting board
 * - Conservative ATS-safe document output on pure white paper
 */
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEditorStore } from "@/lib/resume/editor-store";
import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";
import { debounce } from "@/lib/utils";
import { TemplateRenderer } from "@/components/resume-templates";
import { BasicsForm } from "@/components/resume-editor/basics-form";
import { ExperienceForm } from "@/components/resume-editor/experience-form";
import { EducationForm } from "@/components/resume-editor/education-form";
import { ProjectsForm } from "@/components/resume-editor/projects-form";
import { SkillsForm } from "@/components/resume-editor/skills-form";
import { SummaryForm } from "@/components/resume-editor/summary-form";
import { InternshipsForm } from "@/components/resume-editor/internships-form";
import { CertificationsForm } from "@/components/resume-editor/certifications-form";
import { AwardsForm } from "@/components/resume-editor/awards-form";
import { VolunteeringForm } from "@/components/resume-editor/volunteering-form";
import { PublicationsForm } from "@/components/resume-editor/publications-form";
import { CustomSectionsForm } from "@/components/resume-editor/custom-sections-form";
import { TemplateSettingsPanel } from "@/components/resume-editor/template-settings-panel";
import { AtsReadinessPanel } from "@/components/resume-editor/ats-readiness-panel";
import { TEMPLATE_REGISTRY } from "@/lib/resume/template-contract";
import { DataPrivacyDialog } from "@/components/data-privacy-dialog";
import { UndoRedoControls } from "@/components/resume-editor/undo-redo-controls";
import { RoleCoachingModal } from "@/components/resume-editor/role-coaching-modal";
import { TailorResumeModal } from "@/components/resume-editor/tailor-resume-modal";
import type { ResumeListItem } from "@/lib/resume/local-adapter";
import { type RolePresetId, getRolePreset } from "@/lib/coaching/presets";

// ─────────────────────────────────────────────
// Hardware Save Status Telemetry
// ─────────────────────────────────────────────

function SaveStatusBadge({ mode }: { mode?: "local" | "cloud" }) {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const saveError = useEditorStore((s) => s.saveError);
  const isDirty = useEditorStore((s) => s.isDirty);

  if (saveStatus === "saving") {
    return (
      <span className="bg-amber text-carbon px-2 py-0.5 hardware-bevel font-micro text-micro uppercase flex items-center gap-1 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-carbon animate-ping" />
        SYNCING SECTORS…
      </span>
    );
  }
  if (saveStatus === "saved") {
    return (
      <span className="bg-systems-teal text-surface px-2 py-0.5 hardware-bevel font-micro text-micro uppercase flex items-center gap-1 font-bold">
        <span>✓</span>
        <span>{mode === "cloud" ? "CLOUD SYNC OK" : "LOCAL SYNC OK"}</span>
      </span>
    );
  }
  if (saveStatus === "error") {
    return (
      <span
        className="bg-games-red text-surface px-2 py-0.5 hardware-bevel font-micro text-micro uppercase flex items-center gap-1 font-bold"
        title={saveError ?? "Save failed"}
      >
        <span>✕</span>
        <span>SYNC ERROR</span>
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="bg-carbon text-nav-gold px-2 py-0.5 hardware-bevel font-micro text-micro uppercase flex items-center gap-1 font-bold border border-amber/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        <span>MODIFIED</span>
      </span>
    );
  }
  return (
    <span className="bg-carbon text-canvas-soft px-2 py-0.5 hardware-bevel font-micro text-micro uppercase">
      STANDBY // READY
    </span>
  );
}

// ─────────────────────────────────────────────
// Section Navigation Tabs (2001 Hardware Style)
// ─────────────────────────────────────────────

const SECTION_NAV = [
  { key: "basics", label: "CONTACT", icon: "○" },
  { key: "summary", label: "SUMMARY", icon: "≡" },
  { key: "experience", label: "EXPERIENCE", icon: "◆" },
  { key: "education", label: "EDUCATION", icon: "◈" },
  { key: "projects", label: "PROJECTS", icon: "⬡" },
  { key: "skills", label: "SKILLS", icon: "✦" },
  { key: "internships", label: "INTERNSHIPS", icon: "⬢" },
  { key: "certifications", label: "CERTIFICATIONS", icon: "❖" },
  { key: "awards", label: "AWARDS", icon: "★" },
  { key: "volunteering", label: "VOLUNTEER", icon: "♥" },
  { key: "publications", label: "PUBLICATIONS", icon: "¶" },
  { key: "custom-sections", label: "CUSTOM", icon: "⊞" },
  { key: "ats-readiness", label: "ATS REVIEW", icon: "✓" },
];

function SectionNav({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <nav aria-label="Resume sections" className="flex flex-col gap-1">
      <div className="bg-carbon text-nav-gold px-2 py-1 font-micro text-micro uppercase tracking-wider hardware-bevel flex items-center justify-between">
        <span>SECTION RACK</span>
        <span>{SECTION_NAV.length} MODULES</span>
      </div>
      <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container hardware-inset">
        {SECTION_NAV.map(({ key, label, icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-1.5 px-2 py-1 text-left transition-all ${
                isActive
                  ? "bg-ink-soft text-nav-gold hardware-inset font-ui-label text-ui-label font-bold"
                  : "bg-platinum hover:bg-surface text-carbon hardware-bevel font-ui-label text-ui-label"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="text-[10px] opacity-70">{icon}</span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// Section Editor Dispatcher
// ─────────────────────────────────────────────

function LocatorTargetBanner() {
  const locatorTarget = useEditorStore((s) => s.locatorTarget);
  const setLocatorTarget = useEditorStore((s) => s.setLocatorTarget);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);

  if (!locatorTarget) return null;

  const isMatched = locatorTarget.source === "matched";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-3 p-2 bg-carbon text-nav-gold hardware-bevel border border-amber/40 shadow-xs flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`px-1.5 py-0.5 text-[9px] font-bold hardware-bevel uppercase font-micro ${
            isMatched
              ? "bg-systems-teal text-surface"
              : "bg-games-red text-surface"
          }`}
        >
          {isMatched ? "✓ EVIDENCED" : "✕ NOT EVIDENCED"}
        </span>
        <span className="font-ui-label text-ui-label text-platinum truncate">
          {isMatched ? "Locating" : "Reviewing"}: <strong className="text-nav-gold">&ldquo;{locatorTarget.term}&rdquo;</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            setActiveSection("ats-readiness");
          }}
          className="px-2 py-0.5 bg-ink-soft hover:bg-tertiary text-platinum hover:text-white hardware-bevel text-[10px] font-ui-label font-bold uppercase transition-colors"
          title="Return to ATS Job Match Review"
        >
          ← ATS REVIEW
        </button>
        <button
          type="button"
          onClick={() => setLocatorTarget(null)}
          className="px-1.5 py-0.5 text-canvas-soft hover:text-white text-xs font-bold"
          title="Dismiss locator focus"
          aria-label="Dismiss locator focus"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function SectionEditor({ activeSection }: { activeSection: string }) {
  const locatorTarget = useEditorStore((s) => s.locatorTarget);
  const showBanner =
    locatorTarget &&
    locatorTarget.section === activeSection &&
    activeSection !== "ats-readiness";

  const renderContent = () => {
    switch (activeSection) {
      case "basics":
        return <BasicsForm />;
      case "summary":
        return <SummaryForm />;
      case "experience":
        return <ExperienceForm />;
      case "education":
        return <EducationForm />;
      case "projects":
        return <ProjectsForm />;
      case "skills":
        return <SkillsForm />;
      case "internships":
        return <InternshipsForm />;
      case "certifications":
        return <CertificationsForm />;
      case "awards":
        return <AwardsForm />;
      case "volunteering":
        return <VolunteeringForm />;
      case "publications":
        return <PublicationsForm />;
      case "custom-sections":
        return <CustomSectionsForm />;
      case "ats-readiness":
        return <AtsReadinessPanel />;
      default:
        return (
          <div className="p-4 text-carbon font-ui-label uppercase">
            Select a section module from the rack above.
          </div>
        );
    }
  };

  return (
    <>
      {showBanner && <LocatorTargetBanner />}
      {renderContent()}
    </>
  );
}

// ─────────────────────────────────────────────
// Live Preview Board (Periwinkle Drafting Table)
// ─────────────────────────────────────────────

function LivePreview() {
  const draft = useEditorStore((s) => s.draft);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [isAutoFit, setIsAutoFit] = useState(true);

  useEffect(() => {
    if (!isAutoFit) return;
    const observer = new ResizeObserver(() => {
      if (previewRef.current) {
        const containerWidth = previewRef.current.clientWidth - 48;
        const docWidth = draft.settings.pageSize === "US_LETTER" ? 215.9 : 210;
        const docWidthPx = docWidth * (96 / 25.4);
        setScale(Math.min(containerWidth / docWidthPx, 0.95));
      }
    });
    if (previewRef.current) observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [draft.settings.pageSize, isAutoFit]);

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setScale((s) => Math.min(Number((s + 0.1).toFixed(2)), 1.5));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setScale((s) => Math.max(Number((s - 0.1).toFixed(2)), 0.3));
  };

  const handleResetFit = () => {
    setIsAutoFit(true);
    if (previewRef.current) {
      const containerWidth = previewRef.current.clientWidth - 48;
      const docWidth = draft.settings.pageSize === "US_LETTER" ? 215.9 : 210;
      const docWidthPx = docWidth * (96 / 25.4);
      setScale(Math.min(containerWidth / docWidthPx, 0.95));
    }
  };

  const template = TEMPLATE_REGISTRY[draft.settings.templateId];

  return (
    <div
      ref={previewRef}
      className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center bg-[#7a8aba] speaker-grille relative"
      aria-label="Resume preview"
    >
      {/* Drafting Board Header Banner */}
      <div className="w-full max-w-2xl mb-4 bg-carbon text-nav-gold px-3 py-1.5 hardware-bevel font-micro text-micro uppercase tracking-wider flex items-center justify-between shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nav-gold"></span>
          <span>
            CARTRIDGE PREVIEW // {template?.name ?? draft.settings.templateId} · {draft.settings.pageSize}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-ink-soft px-1.5 py-0.5 rounded-xs hardware-inset">
            <button
              type="button"
              onClick={handleZoomOut}
              className="px-1.5 py-0.5 bg-carbon hover:bg-black text-nav-gold hardware-bevel font-bold text-xs"
              title="Zoom out"
              aria-label="Zoom out preview"
            >
              −
            </button>
            <span className="text-canvas-soft font-mono px-1">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="px-1.5 py-0.5 bg-carbon hover:bg-black text-nav-gold hardware-bevel font-bold text-xs"
              title="Zoom in"
              aria-label="Zoom in preview"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleResetFit}
              className={`px-1.5 py-0.5 hardware-bevel text-[10px] ml-1 font-bold ${
                isAutoFit ? "bg-nav-gold text-carbon" : "bg-carbon text-platinum hover:bg-black"
              }`}
              title="Fit to width"
              aria-label="Fit preview to width"
            >
              FIT
            </button>
          </div>
          <span className="bg-systems-teal text-surface px-1.5 py-0.5 hidden sm:inline">
            {template?.atsLevel === "safe" ? "100% ATS PARSE-SAFE" : "EXPRESSIVE TEMPLATE"}
          </span>
        </div>
      </div>

      {/* Pure White Document Board Frame */}
      <div
        style={{
          boxShadow: "0 10px 40px rgba(0,0,0,0.35), 0 2px 10px rgba(0,0,0,0.2)",
          transformOrigin: "top center",
          transform: `scale(${scale})`,
          background: "white",
          width: "fit-content",
        }}
        className="hardware-bevel"
      >
        <TemplateRenderer
          document={draft}
          settings={draft.settings}
          scale={1}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Editor Layout
// ─────────────────────────────────────────────

function EditorPageContent() {
  const params = useParams();
  const resumeId = params.resumeId as string;

  const initResume = useEditorStore((s) => s.initResume);
  const draft = useEditorStore((s) => s.draft);
  const resumeTitle = useEditorStore((s) => s.resumeTitle);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeSection = useEditorStore((s) => s.activeSection);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const markSaved = useEditorStore((s) => s.markSaved);

  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [resumeMeta, setResumeMeta] = useState<ResumeListItem | null>(null);
  const [allResumes, setAllResumes] = useState<ResumeListItem[]>([]);
  const [renaming, setRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [rolePresetId, setRolePresetId] = useState<RolePresetId>("general");
  const { adapter, mode, loading: authLoading } = useStorageAdapter();

  // Load resume and catalog from active adapter
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    Promise.resolve(adapter.loadResume(resumeId))
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
        } else {
          setResumeMeta(result.meta);
          initResume(resumeId, result.meta.title, result.document);
          setTitleInput(result.meta.title);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
        setLoaded(true);
      });

    Promise.resolve(adapter.listResumes())
      .then((list) => {
        if (!cancelled && list) {
          setAllResumes(list);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [resumeId, initResume, adapter, authLoading]);

  // Debounced Autosave (RS-071)
  const autosaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    autosaveRef.current = debounce(
      async (id: string, title: string, doc: typeof draft) => {
        setSaveStatus("saving");
        try {
          await Promise.resolve(adapter.saveResume(id, title, doc));
          markSaved(doc);
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Unknown save error"
          );
        }
      },
      1500
    );

    return () => {
      autosaveRef.current?.cancel();
    };
  }, [setSaveStatus, markSaved, adapter]);

  useEffect(() => {
    if (loaded && isDirty && resumeId && autosaveRef.current) {
      autosaveRef.current(resumeId, resumeTitle, draft);
    }
  }, [draft, isDirty, loaded, resumeId, resumeTitle]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-periwinkle-mid flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface hardware-inset p-8 max-w-md w-full">
          <h1 className="font-display text-xl text-carbon uppercase mb-2">
            CARTRIDGE NOT FOUND
          </h1>
          <p className="font-body text-body text-carbon/80 mb-6">
            The requested resume cartridge slot could not be read from local sectors.
          </p>
          <Link
            href="/dashboard"
            className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold px-4 py-2 font-ui-label text-ui-label uppercase hardware-bevel inline-block"
          >
            ← RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-periwinkle-mid flex items-center justify-center">
        <div className="bg-carbon text-nav-gold p-6 hardware-bevel flex items-center gap-3 font-display text-sm uppercase">
          <span className="w-3 h-3 rounded-full bg-amber animate-ping"></span>
          <span>LOADING CARTRIDGE DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-periwinkle-mid text-carbon font-body selection:bg-nav-gold selection:text-carbon">
      {/* ── Fixed Carbon Command Bar ── */}
      <header className="shrink-0 bg-carbon speaker-grille hardware-bevel h-12 px-4 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="bg-periwinkle-mid px-2.5 py-1 rounded-full hardware-bevel flex items-center gap-1.5 hover:opacity-95 transition-opacity shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-games-red hardware-inset"></div>
            <span className="font-display text-xs text-carbon tracking-tight">
              SOFTCV
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="font-nav-link text-nav-gold hover:text-amber text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            ← DASHBOARD
          </Link>

          <span className="text-hairline shrink-0">|</span>

          {renaming ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const t = titleInput.trim();
                if (t && t !== resumeTitle) {
                  try {
                    await Promise.resolve(adapter.renameResume(resumeId, t));
                    initResume(resumeId, t, draft);
                  } catch (err) {
                    console.error("Rename failed", err);
                  }
                }
                setRenaming(false);
              }}
              className="flex items-center"
            >
              <input
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="bg-surface text-carbon px-2 py-0.5 text-xs font-bold uppercase border border-hairline focus:outline-none focus:ring-1 focus:ring-systems-teal"
              />
            </form>
          ) : (
            <h2
              onClick={() => setRenaming(true)}
              className="font-headline-sm text-sm text-platinum uppercase tracking-wider truncate max-w-[200px] sm:max-w-xs cursor-pointer hover:text-nav-gold transition-colors"
              title="Click to rename cartridge"
            >
              {resumeTitle} ✎
            </h2>
          )}

          {/* Tailored Variant Telemetry Pill (RS-094) */}
          {resumeMeta && !resumeMeta.isMaster && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-ink-soft text-nav-gold hardware-inset font-micro text-micro uppercase tracking-wider shrink-0"
              title={
                resumeMeta.targetRole
                  ? `Target Position: ${resumeMeta.targetRole}${resumeMeta.targetCompany ? ` @ ${resumeMeta.targetCompany}` : ""}`
                  : "Tailored variant cartridge"
              }
            >
              <span>◈</span>
              <span className="font-bold text-surface">TAILORED</span>
              {resumeMeta.targetRole && (
                <span className="text-nav-gold truncate max-w-[130px]">
                  {"// "}{resumeMeta.targetRole}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Center / Right Telemetry Controls */}
        <div className="flex items-center gap-2">
          <SaveStatusBadge mode={mode} />

          <UndoRedoControls />

          <button
            type="button"
            onClick={() => setShowTailorModal(true)}
            className="text-xs px-2.5 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-colors flex items-center gap-1 bg-secondary-container hover:bg-nav-gold text-carbon font-bold cursor-pointer"
            title="Create an opportunity-tailored copy from this cartridge"
          >
            <span>◈</span>
            <span className="hidden sm:inline">TAILOR</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRoleModal(true)}
            className="text-xs px-2.5 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-colors flex items-center gap-1 bg-ink-soft hover:bg-tertiary text-platinum border border-amber/30 cursor-pointer"
            title="Select target role coaching profile and section layout"
          >
            <span className="text-nav-gold">✦</span>
            <span className="hidden sm:inline">COACHING</span>
          </button>

          <button
            onClick={() => setActiveSection("ats-readiness")}
            className={`text-xs px-2.5 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-colors flex items-center gap-1 ${
              activeSection === "ats-readiness"
                ? "bg-systems-teal text-surface hardware-inset font-bold"
                : "bg-ink-soft hover:bg-tertiary text-platinum"
            }`}
          >
            <span>✓</span>
            <span className="hidden sm:inline">ATS CHECK</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrivacyDialog(true)}
            className="text-xs px-2.5 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-colors flex items-center gap-1 bg-ink-soft hover:bg-tertiary text-platinum"
            title="Open data controls, JSON backup, and privacy settings"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">DATA & PRIVACY</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-xs px-2.5 py-1 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-colors flex items-center gap-1 ${
              showSettings
                ? "bg-nav-gold text-carbon hardware-inset font-bold"
                : "bg-ink-soft hover:bg-tertiary text-platinum"
            }`}
            aria-expanded={showSettings}
            aria-controls="template-settings-drawer"
            title="Toggle template settings & export"
          >
            <span>⚙</span>
            <span className="hidden sm:inline">SETTINGS</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold px-3 py-1 hardware-bevel font-nav-link text-nav-link uppercase tracking-wider flex items-center gap-1 active:translate-y-0.5 transition-all shadow-xs"
            title="Open export and format controls"
          >
            <span>↓ EXPORT</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div role="tablist" aria-label="Editor view modes" className="md:hidden shrink-0 flex bg-carbon border-b border-hairline">
        <button
          role="tab"
          id="tab-edit"
          aria-selected={mobileTab === "edit"}
          aria-controls="editor-modules-panel"
          onClick={() => setMobileTab("edit")}
          className={`flex-1 py-1.5 font-ui-label text-ui-label uppercase tracking-wider ${
            mobileTab === "edit"
              ? "bg-ink-soft text-nav-gold hardware-inset font-bold"
              : "text-platinum"
          }`}
        >
          ✎ EDIT MODULES
        </button>
        <button
          role="tab"
          id="tab-preview"
          aria-selected={mobileTab === "preview"}
          aria-controls="editor-preview-panel"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-1.5 font-ui-label text-ui-label uppercase tracking-wider ${
            mobileTab === "preview"
              ? "bg-ink-soft text-nav-gold hardware-inset font-bold"
              : "text-platinum"
          }`}
        >
          ◎ LIVE PREVIEW
        </button>
      </div>

      {/* ── 3-Panel Studio Body ── */}
      <main id="main-content" className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — Section Navigation & Form Controls */}
        <aside
          id="editor-modules-panel"
          role="tabpanel"
          aria-labelledby="tab-edit"
          className={`${
            mobileTab === "preview" ? "hidden" : "flex"
          } md:flex flex-col border-r border-[#3d4f97] shrink-0 w-full md:w-80 lg:w-96 bg-periwinkle-mid overflow-hidden z-10`}
        >
          {/* Section Rack Header */}
          <div className="shrink-0 p-space-xs bg-periwinkle-mid border-b border-[#3d4f97] space-y-1.5">
            {/* Active Role Coaching Quick Indicator */}
            <div className="bg-surface hardware-inset p-2 border border-hairline flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-nav-gold font-bold">✦</span>
                <span className="font-mono text-[11px] truncate font-semibold uppercase text-carbon">
                  {getRolePreset(rolePresetId).name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="text-[10px] font-mono text-primary font-bold hover:underline uppercase shrink-0 cursor-pointer"
              >
                PRESET
              </button>
            </div>

            <SectionNav active={activeSection} onSelect={setActiveSection} />
          </div>

          {/* Form Editing Deck */}
          <div className="flex-1 overflow-y-auto p-space-sm bg-surface hardware-inset m-2">
            <SectionEditor activeSection={activeSection} />
          </div>
        </aside>

        {/* CENTER PANEL — Live Preview Drafting Table */}
        <div
          id="editor-preview-panel"
          role="tabpanel"
          aria-labelledby="tab-preview"
          className={`${
            mobileTab === "edit" ? "hidden" : "flex"
          } md:flex flex-1 flex-col overflow-hidden`}
        >
          <LivePreview />
        </div>

        {/* RIGHT PANEL — Template & Style Settings */}
        {showSettings && (
          <aside
            id="template-settings-drawer"
            aria-label="Template configuration and export settings"
            className="fixed inset-0 z-40 md:static md:z-10 flex flex-col border-l border-[#3d4f97] shrink-0 w-full md:w-72 lg:w-80 bg-periwinkle-mid overflow-y-auto"
          >
            <div className="bg-carbon text-nav-gold px-3 py-1.5 hardware-bevel font-ui-label text-ui-label uppercase tracking-wider flex items-center justify-between">
              <span>TEMPLATE CONFIGURATION</span>
              <button
                onClick={() => setShowSettings(false)}
                className="hover:text-surface px-2 py-0.5 text-nav-gold font-bold"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>
            <div className="p-space-sm m-2 bg-surface hardware-inset flex-1 overflow-y-auto">
              <TemplateSettingsPanel />
            </div>
          </aside>
        )}
      </main>

      <DataPrivacyDialog
        isOpen={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
      />

      <RoleCoachingModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        activePresetId={rolePresetId}
        onSelectPreset={(id) => setRolePresetId(id)}
      />

      <TailorResumeModal
        isOpen={showTailorModal}
        onClose={() => setShowTailorModal(false)}
        sourceResumeId={resumeId}
        resumes={allResumes.length > 0 ? allResumes : (resumeMeta ? [resumeMeta] : [])}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-periwinkle-mid flex items-center justify-center">
          <div className="bg-carbon text-nav-gold p-6 hardware-bevel font-display text-sm uppercase">
            INITIALIZING STUDIO...
          </div>
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}
