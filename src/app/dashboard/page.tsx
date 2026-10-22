/**
 * SoftCV Studio — Dashboard (2001 Console Chrome Edition)
 * Reflects the exact design language from docs/DESIGN.md:
 * Brushed periwinkle chassis, carbon command bars with speaker grille,
 * beveled cartridge plates, and wayfinding amber/orange accents.
 */
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { ResumeListItem } from "@/lib/resume/local-adapter";
import { formatDate } from "@/lib/utils";
import { TEMPLATE_REGISTRY } from "@/lib/resume/template-contract";
import { DataPrivacyDialog } from "@/components/data-privacy-dialog";
import { AuthStatusBar } from "@/components/auth-status-bar";
import { CloudMigrationDialog } from "@/components/cloud-migration-dialog";
import { TailorResumeModal } from "@/components/resume-editor/tailor-resume-modal";
import { planLocalMigration } from "@/lib/resume/cloud-migration";
import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";
import type { SupabaseAdapter } from "@/lib/resume/supabase-adapter";

function EmptyState() {
  return (
    <div className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md my-8">
      <div className="bg-surface hardware-inset p-8 sm:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 speaker-grille opacity-25 pointer-events-none"></div>

        <div className="w-16 h-16 bg-carbon hardware-bevel flex items-center justify-center text-nav-gold mb-4 text-2xl font-display">
          <span>💾</span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl text-carbon uppercase tracking-tight mb-2">
          NO CARTRIDGES DETECTED
        </h2>

        <p className="font-hero-tagline text-hero-tagline text-carbon/80 max-w-lg mb-8">
          Your local memory bank is currently empty. Initialize your first resume cartridge to begin editing with ATS-ready templates and verified AI writing tools.
        </p>

        <Link
          href="/resume/new"
          className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-lg py-space-md hardware-bevel flex items-center gap-space-xs active:translate-y-0.5 transition-transform shadow-xs"
        >
          <span>+ INITIALIZE FIRST CARTRIDGE →</span>
        </Link>
      </div>
    </div>
  );
}

function ResumeCard({
  resume,
  slotIndex,
  parentTitle,
  onDelete,
  onDuplicate,
  onRename,
  onTailor,
}: {
  resume: ResumeListItem;
  slotIndex: number;
  parentTitle?: string;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onTailor: (id: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(resume.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const template = TEMPLATE_REGISTRY[resume.templateId as keyof typeof TEMPLATE_REGISTRY];
  const slotNumber = String(slotIndex + 1).padStart(2, "0");

  return (
    <div className="bg-periwinkle-mid hardware-bevel p-space-xs flex flex-col group hover:-translate-y-0.5 transition-transform">
      {/* Slot Header Bar */}
      <div className="bg-carbon text-nav-gold px-space-xs py-1 flex justify-between items-center font-micro text-micro hardware-bevel">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-nav-gold"></span>
          <span className="uppercase tracking-wider font-bold">SLOT #{slotNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          {resume.isMaster ? (
            <span className="bg-systems-teal text-surface px-1.5 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1">
              <span>★</span>
              <span>MASTER</span>
            </span>
          ) : (
            <span className="bg-ink-soft text-surface px-1.5 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1">
              <span>◈</span>
              <span>TAILORED</span>
            </span>
          )}
          <span className="bg-surface/20 text-platinum px-1 py-0.5 uppercase">
            {template?.atsLevel === "safe" ? "ATS-SAFE" : "EXPRESSIVE"}
          </span>
        </div>
      </div>

      {/* Cartridge Inset Body */}
      <div className="bg-surface hardware-inset p-space-md min-h-[140px] flex flex-col justify-between">
        <div>
          {renaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = newTitle.trim();
                if (t) onRename(resume.id, t);
                setRenaming(false);
              }}
            >
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="w-full text-sm font-bold uppercase p-1 border border-hairline bg-surface text-carbon focus:outline-none focus:ring-1 focus:ring-systems-teal"
                maxLength={120}
              />
            </form>
          ) : (
            <h3
              className="font-headline-sm text-headline-sm text-carbon uppercase tracking-tight truncate cursor-pointer hover:text-systems-teal transition-colors"
              onClick={() => setRenaming(true)}
              title="Click to rename"
            >
              {resume.title}
            </h3>
          )}

          <div className="flex flex-wrap items-center gap-1 mt-2">
            <span className="bg-surface-container-high text-systems-teal font-ui-label text-ui-label px-2 py-0.5 hardware-bevel uppercase">
              {template?.name ?? resume.templateId}
            </span>
            <span className="text-micro font-micro text-muted-indigo">
              · {formatDate(resume.updatedAt.slice(0, 7))}
            </span>
          </div>

          {/* Job Target & Lineage Telemetry (RS-094) */}
          {!resume.isMaster && (
            <div className="mt-2.5 pt-2 border-t border-hairline/60 flex flex-col gap-0.5 text-micro font-micro">
              <div
                className="font-bold text-systems-teal uppercase flex items-center gap-1 truncate"
                title={resume.targetRole ? `Target Position: ${resume.targetRole}${resume.targetCompany ? ` @ ${resume.targetCompany}` : ""}` : undefined}
              >
                <span className="text-nav-gold">◈ TARGET:</span>
                <span className="truncate">
                  {resume.targetRole
                    ? `${resume.targetRole}${resume.targetCompany ? ` @ ${resume.targetCompany}` : ""}`
                    : "CUSTOM TARGET"}
                </span>
              </div>
              <div
                className="text-carbon/75 uppercase truncate"
                title={parentTitle ? `Cloned from master: ${parentTitle}` : undefined}
              >
                <span>BASED ON:</span>{" "}
                <span className="font-semibold text-carbon">
                  {parentTitle || "MASTER RESUME"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mini Cartridge Barcode Graphic */}
        <div className="pt-3">
          <div className="flex items-center gap-0.5 opacity-30">
            <div className="h-3 w-1 bg-carbon"></div>
            <div className="h-3 w-0.5 bg-carbon"></div>
            <div className="h-3 w-2 bg-carbon"></div>
            <div className="h-3 w-0.5 bg-carbon"></div>
            <div className="h-3 w-1.5 bg-carbon"></div>
            <div className="h-3 w-3 bg-carbon"></div>
            <div className="h-3 w-0.5 bg-carbon"></div>
            <div className="h-3 w-2 bg-carbon"></div>
            <div className="h-3 w-1 bg-carbon"></div>
          </div>
        </div>
      </div>

      {/* Cartridge Control Deck */}
      <div className="bg-platinum p-space-xs flex items-center justify-between hardware-bevel mt-1 gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTailor(resume.id)}
            className="bg-secondary-container hover:bg-nav-gold text-carbon px-2 py-1 font-micro text-micro uppercase font-bold tracking-wider hardware-bevel transition-colors cursor-pointer"
            title="Branch an independent tailored copy for a job opportunity"
            aria-label={`Branch tailored copy from: ${resume.title}`}
          >
            TAILOR
          </button>
          <button
            onClick={() => onDuplicate(resume.id)}
            className="bg-ink-soft hover:bg-tertiary text-platinum px-2 py-1 font-micro text-micro uppercase tracking-wider hardware-bevel transition-colors cursor-pointer"
            title="Create duplicate copy"
            aria-label={`Duplicate cartridge: ${resume.title}`}
          >
            DUPLICATE
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(resume.id)}
                className="bg-games-red text-surface px-2 py-1 font-micro text-micro uppercase font-bold hardware-bevel cursor-pointer"
                aria-label={`Confirm deletion of cartridge: ${resume.title}`}
              >
                CONFIRM
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-carbon text-platinum px-2 py-1 font-micro text-micro uppercase hardware-bevel cursor-pointer"
                aria-label={`Cancel deletion of cartridge: ${resume.title}`}
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-carbon hover:bg-games-red text-platinum px-2 py-1 font-micro text-micro uppercase tracking-wider hardware-bevel transition-colors cursor-pointer"
              title="Delete cartridge"
              aria-label={`Delete cartridge: ${resume.title}`}
            >
              DELETE
            </button>
          )}
        </div>

        <Link
          href={`/resume/${resume.id}/edit`}
          className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold px-3 py-1 font-ui-label text-ui-label uppercase tracking-wider hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-all shadow-xs"
          aria-label={`Load cartridge: ${resume.title}`}
        >
          <span>LOAD →</span>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [selectedSourceForTailoring, setSelectedSourceForTailoring] = useState<string | undefined>(undefined);
  const { adapter, mode, loading: authLoading, user } = useStorageAdapter();

  const refreshResumes = useCallback(async () => {
    try {
      const list = await Promise.resolve(adapter.listResumes());
      setResumes(list);
    } catch {
      setResumes([]);
    }
    setLoaded(true);
  }, [adapter]);

  const resumeMap = useMemo(() => new Map(resumes.map((r) => [r.id, r.title])), [resumes]);

  const handleOpenTailor = useCallback((sourceId?: string) => {
    setSelectedSourceForTailoring(sourceId);
    setShowTailorModal(true);
  }, []);

  const localCartridgesCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    try {
      return planLocalMigration({ includeDemo: false }).candidates.length;
    } catch {
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumes]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      refreshResumes();
    });
    return () => cancelAnimationFrame(frameId);
  }, [refreshResumes]);

  async function handleDelete(id: string) {
    try {
      await Promise.resolve(adapter.deleteResume(id));
    } catch { /* local adapter is sync */ }
    refreshResumes();
  }

  async function handleDuplicate(id: string) {
    const original = resumes.find((r) => r.id === id);
    try {
      await Promise.resolve(adapter.duplicateResume(id, `${original?.title ?? "Resume"} (copy)`, false));
    } catch { /* local adapter is sync */ }
    refreshResumes();
  }

  async function handleRename(id: string, newTitle: string) {
    try {
      await Promise.resolve(adapter.renameResume(id, newTitle));
    } catch { /* local adapter is sync */ }
    refreshResumes();
  }

  const masterResumes = resumes.filter((r) => r.isMaster);
  const tailoredResumes = resumes.filter((r) => !r.isMaster);

  const isAuthLoading = authLoading && !loaded;

  return (
    <div className="bg-periwinkle-mid text-carbon min-h-screen selection:bg-nav-gold selection:text-carbon font-body">
      {/* Cloud Mode Status Bar */}
      <AuthStatusBar />
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
                <Link
                  href="/"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  FEATURES
                </Link>
                <span className="text-hairline">|</span>
                <Link
                  href="/#templates"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  TEMPLATES
                </Link>
                <span className="text-hairline">|</span>
                <Link
                  href="/#ats-check"
                  className="font-nav-link text-nav-link text-nav-gold px-space-md py-1 rounded-DEFAULT tracking-wider uppercase transition-all hover:bg-ink-soft hover:text-nav-gold"
                >
                  ATS CHECK
                </Link>
                <span className="text-hairline">|</span>
                <span
                  className="font-nav-link px-space-md py-1 rounded-DEFAULT tracking-wider uppercase bg-carbon text-nav-gold hardware-inset font-bold"
                >
                  DASHBOARD
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-space-sm sm:gap-space-md">
              <button
                type="button"
                onClick={() => setShowPrivacyDialog(true)}
                className="bg-ink-soft hover:bg-black text-surface font-nav-link text-nav-link uppercase px-space-md py-space-xs rounded-DEFAULT hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform"
                title="Open data management, JSON backup, and privacy subsystem"
              >
                <span>🔒 DATA & PRIVACY</span>
              </button>
              <Link
                href="/resume/new"
                className="bg-amber hover:bg-nav-gold text-carbon font-nav-link text-nav-link uppercase px-space-md py-space-xs rounded-DEFAULT hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform"
              >
                + NEW CARTRIDGE
              </Link>
              <div
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hardware-bevel"
                title="Active Profile"
              >
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Hardware Chassis ── */}
      <main id="main-content" className="w-full pt-16 pb-margin-desktop">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col gap-space-lg">
          {/* Deck Ribbon Header */}
          <div className="w-full bg-carbon hardware-bevel p-space-sm sm:p-space-md text-platinum flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-3 h-3 bg-nav-gold hardware-inset"></div>
              <div>
                <h1 className="font-headline-sm text-headline-sm text-nav-gold uppercase tracking-wider">
                  {mode === "cloud" ? "CLOUD VAULT" : "LOCAL MEMORY BANK"} · RESUME CARTRIDGE RACK
                </h1>
                <p className="font-micro text-micro text-canvas-soft">
                  {mode === "cloud"
                    ? "SYSTEM READY // SYNCED TO SECURE CLOUD VAULT"
                    : "SYSTEM READY // DATA RETAINED ON LOCAL CHASSIS ONLY"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm flex-wrap">
              <div className="bg-ink-soft text-surface px-space-md py-1 hardware-bevel font-ui-label text-ui-label uppercase">
                {resumes.length} / 12 SLOTS USED
              </div>
              {mode === "cloud" && localCartridgesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMigrationDialog(true)}
                  className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-md py-1 hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform"
                  title="Move cartridges stored in this browser to your cloud account"
                >
                  <span>☁ MIGRATE LOCAL ({localCartridgesCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPrivacyDialog(true)}
                className="bg-canvas-soft hover:bg-surface text-carbon font-bold font-nav-link text-nav-link uppercase px-space-md py-1 hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform"
              >
                <span>DATA CONTROLS</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenTailor()}
                className="bg-secondary-container hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-md py-1 hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform shadow-xs cursor-pointer"
                title="Create a job-tailored resume variant from an existing cartridge"
              >
                <span>◈ TAILOR FOR A JOB →</span>
              </button>
              <Link
                href="/resume/new"
                className="bg-amber hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-md py-1 hardware-bevel flex items-center gap-1 active:translate-y-0.5 transition-transform shadow-xs"
              >
                <span>+ INITIALIZE NEW →</span>
              </Link>
            </div>
          </div>

          {/* Cloud Migration Notification Banner */}
          {mode === "cloud" && localCartridgesCount > 0 && (
            <div className="w-full bg-nav-gold/25 border-2 border-nav-gold p-3.5 hardware-bevel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-carbon shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">☁</span>
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider">
                    {localCartridgesCount} LOCAL CARTRIDGE(S) FOUND IN THIS BROWSER
                  </div>
                  <div className="text-xs text-carbon/80">
                    You are signed in as {user?.email}. Would you like to upload your local cartridges to your secure cloud account?
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMigrationDialog(true)}
                className="bg-carbon hover:bg-black text-platinum px-3 py-1.5 hardware-bevel text-xs uppercase font-bold tracking-wider shrink-0 transition-colors"
              >
                REVIEW & MIGRATE TO CLOUD →
              </button>
            </div>
          )}

          {!loaded || isAuthLoading ? (
            <div className="w-full bg-surface hardware-inset p-16 flex items-center justify-center">
              <div className="flex items-center gap-2 font-display text-sm text-carbon uppercase">
                <span className="w-3 h-3 rounded-full bg-amber animate-ping"></span>
                <span>{mode === "cloud" ? "CONNECTING TO CLOUD VAULT..." : "READING LOCAL MEMORY SECTORS..."}</span>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-space-lg">
              {/* Master Resumes Section */}
              {masterResumes.length > 0 && (
                <section className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md">
                  <div className="bg-surface-container hardware-inset p-space-sm mb-space-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-systems-teal"></span>
                      <h2 className="font-headline-sm text-headline-sm text-carbon uppercase tracking-wider">
                        MASTER CARTRIDGES (SOURCE OF TRUTH)
                      </h2>
                    </div>
                    <span className="font-micro text-micro text-muted-indigo">
                      {masterResumes.length} RECORD{masterResumes.length !== 1 ? "S" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
                    {masterResumes.map((resume, idx) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        slotIndex={idx}
                        parentTitle={resume.parentResumeId ? resumeMap.get(resume.parentResumeId) : undefined}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onRename={handleRename}
                        onTailor={handleOpenTailor}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Tailored Resumes Section */}
              {tailoredResumes.length > 0 && (
                <section className="w-full bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md">
                  <div className="bg-surface-container hardware-inset p-space-sm mb-space-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-nav-gold"></span>
                      <h2 className="font-headline-sm text-headline-sm text-carbon uppercase tracking-wider">
                        JOB-TAILORED CARTRIDGES
                      </h2>
                    </div>
                    <span className="font-micro text-micro text-muted-indigo">
                      {tailoredResumes.length} RECORD{tailoredResumes.length !== 1 ? "S" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
                    {tailoredResumes.map((resume, idx) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        slotIndex={masterResumes.length + idx}
                        parentTitle={resume.parentResumeId ? resumeMap.get(resume.parentResumeId) : undefined}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onRename={handleRename}
                        onTailor={handleOpenTailor}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Console Hardware Footer ── */}
      <footer className="w-full bg-carbon text-canvas-soft border-t-2 border-hairline py-8 px-4 sm:px-6 md:px-8 lg:px-12 mt-12">
        <div className="max-w-[1760px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-micro text-micro uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-nav-gold"></span>
            <span>SOFTCV STUDIO // 2001 CONSOLE CHROME ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPrivacyDialog(true)}
              className="text-nav-gold hover:underline font-bold"
            >
              DATA & PRIVACY
            </button>
            <span className="text-hairline">|</span>
            <Link href="/privacy" className="hover:text-nav-gold hover:underline">
              PRIVACY POLICY
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/terms" className="hover:text-nav-gold hover:underline">
              TERMS OF SERVICE
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/help/ats-and-ai" className="hover:text-nav-gold hover:underline">
              ATS & AI GUIDE
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/release-notes" className="hover:text-nav-gold hover:underline">
              RELEASE NOTES
            </Link>
          </div>
        </div>
      </footer>

      {/* Tailor Resume Modal (RS-094) */}
      <TailorResumeModal
        isOpen={showTailorModal}
        onClose={() => setShowTailorModal(false)}
        sourceResumeId={selectedSourceForTailoring}
        resumes={resumes}
        onSuccess={() => {
          setShowTailorModal(false);
          refreshResumes();
        }}
      />

      {/* Data Controls & Privacy Dialog */}
      <DataPrivacyDialog
        isOpen={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
        onDataChanged={() => refreshResumes()}
      />

      {/* Local to Cloud Migration Dialog */}
      {mode === "cloud" && (
        <CloudMigrationDialog
          isOpen={showMigrationDialog}
          onClose={() => setShowMigrationDialog(false)}
          cloudAdapter={adapter as SupabaseAdapter}
          userEmail={user?.email}
          onMigrationComplete={() => refreshResumes()}
        />
      )}
    </div>
  );
}

