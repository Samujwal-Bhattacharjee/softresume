/**
 * SoftCV Studio — Data & Privacy Dialog (2001 Console Chrome Edition)
 *
 * Implements Workstream B (RS-043, RS-044, RS-154):
 * - Plain-language disclosure of local-only browser persistence.
 * - JSON backup export of all schema-validated resumes.
 * - Single and bulk data deletion with accessible, irreversible confirmation.
 * - Synthetic demo data reset.
 * - Real live announcements for assistive technology.
 */
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { localAdapter } from "@/lib/resume/local-adapter";
import { useModalA11y } from "@/lib/hooks/use-modal-a11y";
import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";
import { useEditorStore } from "@/lib/resume/editor-store";
import {
  exportToJsonResume,
  importFromJsonResume,
  MAX_JSON_RESUME_SIZE,
  type JsonResumeImportResult,
} from "@/lib/export/json-resume";
import { sanitizeResumeFilename } from "@/lib/export/filename";

interface DataPrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export function DataPrivacyDialog({
  isOpen,
  onClose,
  onDataChanged,
}: DataPrivacyDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteCloud, setConfirmDeleteCloud] = useState(false);
  const [confirmResetDemo, setConfirmResetDemo] = useState(false);
  const [pendingImport, setPendingImport] = useState<JsonResumeImportResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { adapter, mode, user } = useStorageAdapter();
  const [statusMessage, setStatusMessage] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const handleClose = React.useCallback(() => {
    setConfirmDeleteAll(false);
    setConfirmDeleteCloud(false);
    setConfirmResetDemo(false);
    setPendingImport(null);
    setIsProcessingFile(false);
    setStatusMessage(null);
    onClose();
  }, [onClose]);

  useModalA11y({
    isOpen,
    onClose: handleClose,
    containerRef,
  });

  if (!isOpen) return null;

  // 1. Export JSON Backup (All Cartridges)
  const handleExportBackup = () => {
    try {
      const backup = localAdapter.exportAllData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `softcv_studio_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: "success",
        text: `Exported JSON backup containing ${backup.totalResumes} resume record(s).`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to compile backup JSON.",
      });
    }
  };

  // 2. Export Standard JSON Resume (Active Resume Only) (RS-097)
  const handleExportJsonResume = () => {
    try {
      const draft = useEditorStore.getState().draft;
      if (!draft.basics.name && draft.experience.length === 0) {
        setStatusMessage({
          type: "info",
          text: "No active resume document loaded in editor to export.",
        });
        return;
      }
      const jsonResume = exportToJsonResume(draft);
      const blob = new Blob([JSON.stringify(jsonResume, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const baseName = draft.basics.name?.trim() || "resume";
      const filename = sanitizeResumeFilename(`${baseName}-json-resume`, "json");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: "success",
        text: `Exported active resume in standard JSON Resume format: ${filename}`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to export JSON Resume.",
      });
    }
  };

  // 3. Import Standard JSON Resume File Selection (RS-097)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be picked again
    e.target.value = "";

    if (file.size > MAX_JSON_RESUME_SIZE) {
      setStatusMessage({
        type: "error",
        text: `Selected file exceeds the maximum 1MB size limit (${Math.round(file.size / 1024)} KB).`,
      });
      return;
    }

    try {
      setIsProcessingFile(true);
      const text = await file.text();
      const result = importFromJsonResume(text);

      if (!result.success || !result.document) {
        setStatusMessage({
          type: "error",
          text: result.error || "The uploaded file is not a valid JSON Resume.",
        });
        setPendingImport(null);
      } else {
        setPendingImport(result);
        setStatusMessage({
          type: "info",
          text: `Parsed JSON Resume for "${result.summary?.name}". Review the mapped sections below and confirm import.`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `Could not read file: ${err instanceof Error ? err.message : "Read error"}.`,
      });
      setPendingImport(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // 4. Confirm Standard JSON Resume Import (RS-097)
  const handleConfirmImport = async () => {
    if (!pendingImport || !pendingImport.document) return;

    try {
      const candidateName = pendingImport.summary?.name || "Imported Candidate";
      const title = `${candidateName} (JSON Resume)`;
      await adapter.createResume(title, pendingImport.document);

      const importedName = candidateName;
      setPendingImport(null);
      setStatusMessage({
        type: "success",
        text: `Successfully imported "${importedName}" as a new resume cartridge.`,
      });

      if (onDataChanged) {
        onDataChanged();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `Failed to persist imported resume: ${err instanceof Error ? err.message : "Save error"}`,
      });
    }
  };

  // 2. Reset Demo Data
  const handleResetDemo = () => {
    try {
      const seeded = localAdapter.resetDemoData();
      setConfirmResetDemo(false);
      setStatusMessage({
        type: "success",
        text: `Demo reset complete. Initialized ${seeded.length} sample cartridges.`,
      });
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to reset demo cartridges.",
      });
    }
  };

  // 3. Purge All Local Data
  const handleDeleteAll = () => {
    try {
      localAdapter.deleteAllData();
      setConfirmDeleteAll(false);
      setStatusMessage({
        type: "success",
        text: "All local resume cartridges and job targets have been permanently purged.",
      });
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to purge local data.",
      });
    }
  };

  // 4. Purge All Cloud Data (Authenticated User Only)
  const handleDeleteCloudData = async () => {
    try {
      if (mode === "cloud" && "deleteAllData" in adapter) {
        await Promise.resolve(adapter.deleteAllData());
        setConfirmDeleteCloud(false);
        setStatusMessage({
          type: "success",
          text: "All cloud resumes and job targets for your account have been permanently erased from the database.",
        });
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to purge cloud account data.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-dialog-title"
      aria-describedby="privacy-dialog-desc"
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-periwinkle-mid hardware-bevel p-space-sm sm:p-space-md flex flex-col gap-space-md shadow-2xl relative my-8"
      >
        {/* Chassis Header */}
        <div className="bg-carbon text-nav-gold px-space-md py-space-xs hardware-bevel flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nav-gold animate-pulse"></span>
            <h2
              id="privacy-dialog-title"
              className="font-headline-sm text-headline-sm uppercase tracking-wider text-nav-gold font-bold"
            >
              DATA CONTROLS & PRIVACY SUBSYSTEM
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-canvas-soft hover:text-nav-gold hardware-bevel px-2 py-0.5 font-bold font-micro uppercase bg-ink-soft"
            aria-label="Close data controls dialog"
          >
            ✕ ESC
          </button>
        </div>

        {/* Screen Reader Live Status */}
        <div aria-live="polite" className="sr-only">
          {statusMessage?.text}
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`p-3 hardware-inset font-ui-label text-ui-label uppercase flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-systems-teal/20 text-carbon border border-systems-teal"
                : statusMessage.type === "error"
                ? "bg-signal-red/20 text-carbon border border-signal-red"
                : "bg-surface text-carbon"
            }`}
          >
            <span className="font-bold">
              {statusMessage.type === "success" ? "✓" : "!"}
            </span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Inset Body */}
        <div className="bg-surface hardware-inset p-space-md sm:p-space-lg flex flex-col gap-space-md max-h-[75vh] overflow-y-auto">
          {/* Storage Architecture Notice */}
          <section className="flex flex-col gap-1.5 border-b border-hairline pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-carbon text-nav-gold px-1.5 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel">
                STORAGE STATUS
              </span>
              <h3 className="font-bold text-carbon text-sm uppercase tracking-wide">
                {mode === "cloud"
                  ? `CLOUD VAULT (${user?.email ?? "AUTHENTICATED SESSION"})`
                  : "LOCAL BROWSER PERSISTENCE (STANDALONE DEMO MODE)"}
              </h3>
            </div>
            <p id="privacy-dialog-desc" className="text-sm text-carbon/85 leading-relaxed">
              {mode === "cloud" ? (
                <>
                  Your resumes and job targets are synced to your secure cloud account backed by
                  PostgreSQL with Row-Level Security (RLS). Operations are authenticated through
                  your server-verified session and never accessible by other users.
                </>
              ) : (
                <>
                  Your resume documents, tailored cartridges, and job descriptions are stored
                  strictly inside this web browser using <code>localStorage</code>. Data is
                  never silently synchronized to a cloud database or shared across devices.
                </>
              )}
            </p>
            <div className="bg-canvas-soft/60 p-2.5 text-xs text-carbon hardware-bevel flex flex-col gap-1">
              <div className="font-bold uppercase tracking-wider text-muted-indigo">
                OPERATIONAL BOUNDARIES:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-carbon/80">
                {mode === "cloud" ? (
                  <>
                    <li>
                      Cloud records are bound to your user ID and protected by database-level RLS.
                    </li>
                    <li>
                      Local browser storage is independent: logging out or clearing browser data does
                      not delete your cloud account records.
                    </li>
                    <li>
                      You can export a JSON backup or purge your cloud account data at any time below.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      Clearing browser cache/cookies or resetting site data will erase local cartridges.
                    </li>
                    <li>
                      Opening this application in a different browser will start with an empty rack.
                    </li>
                    <li>
                      Download a <strong>JSON backup</strong> below to preserve or migrate your work.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </section>

          {/* AI Data Flow Disclosure */}
          <section className="flex flex-col gap-1.5 border-b border-hairline pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-ink-soft text-surface px-1.5 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel">
                AI DATA FLOW
              </span>
              <h3 className="font-bold text-carbon text-sm uppercase tracking-wide">
                MINIMAL ON-DEMAND TRANSMISSION
              </h3>
            </div>
            <p className="text-sm text-carbon/85 leading-relaxed">
              Resume text is sent to the server-side AI provider <strong>only</strong> when
              you explicitly invoke an AI feature (such as Bullet Improver, Summary Helper, or
              Job Extraction). API keys are maintained exclusively on the server and are
              never exposed to your browser.
            </p>
          </section>

          {/* Action Rack */}
          <section className="flex flex-col gap-space-sm pt-2">
            <h3 className="font-display text-xs text-carbon uppercase tracking-wider font-bold">
              USER DATA ACTIONS
            </h3>

            {/* 1. Export JSON Backup */}
            <div className="bg-periwinkle-mid hardware-bevel p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-carbon text-sm uppercase">
                  1. EXPORT FULL APP BACKUP
                </div>
                <div className="text-xs text-carbon/75">
                  Download a schema-validated .json archive of all your resume cartridges and
                  job targets.
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="bg-carbon hover:bg-black text-nav-gold font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shrink-0 transition-transform active:translate-y-0.5 cursor-pointer"
              >
                DOWNLOAD BACKUP ↓
              </button>
            </div>

            {/* 2. Export Standard JSON Resume (RS-097) */}
            <div className="bg-periwinkle-mid hardware-bevel p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-carbon text-sm uppercase">
                  2. EXPORT ACTIVE RESUME (JSON RESUME STD V1.0)
                </div>
                <div className="text-xs text-carbon/75">
                  Export the active resume formatted to the open JSON Resume specification (jsonresume.org).
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportJsonResume}
                className="bg-ink-soft hover:bg-carbon text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shrink-0 transition-transform active:translate-y-0.5 cursor-pointer"
              >
                EXPORT JSON RESUME ↓
              </button>
            </div>

            {/* 3. Import Standard JSON Resume (RS-097) */}
            <div className="bg-periwinkle-mid hardware-bevel p-space-sm flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-carbon text-sm uppercase">
                    3. IMPORT STANDARD JSON RESUME (V1.0)
                  </div>
                  <div className="text-xs text-carbon/75">
                    Upload an external .json resume adhering to the standard JSON Resume structure. Validated before import.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="json-resume-file-input"
                    aria-label="Upload JSON Resume file"
                  />
                  <button
                    type="button"
                    disabled={isProcessingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-carbon hover:bg-black text-nav-gold font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shrink-0 transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingFile ? "READING FILE…" : "CHOOSE JSON RESUME…"}
                  </button>
                </div>
              </div>

              {/* Pre-flight Verification & Confirmation Card */}
              {pendingImport && pendingImport.document && (
                <div
                  className="mt-2 p-3 bg-surface hardware-inset border-2 border-systems-teal space-y-2 text-xs text-carbon"
                  role="region"
                  aria-label="JSON Resume Import Preview"
                >
                  <div className="flex items-center justify-between border-b border-hairline pb-1.5">
                    <span className="font-bold font-ui-label text-ui-label uppercase text-carbon">
                      PRE-FLIGHT VALIDATION: {pendingImport.summary?.name}
                    </span>
                    <span className="bg-systems-teal text-surface px-1.5 py-0.5 font-micro text-micro uppercase font-bold hardware-bevel">
                      SCHEMA VALIDATED
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-neutral-600">
                      Sections to Import:{" "}
                      <strong className="text-carbon uppercase">
                        {pendingImport.summary?.sectionsImported.join(", ")}
                      </strong>
                    </div>

                    <div className="flex gap-2 text-[10px] font-mono text-neutral-700 flex-wrap">
                      <span className="bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">
                        Experience: {pendingImport.summary?.counts.experience}
                      </span>
                      <span className="bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">
                        Education: {pendingImport.summary?.counts.education}
                      </span>
                      <span className="bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">
                        Skills: {pendingImport.summary?.counts.skills}
                      </span>
                      <span className="bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">
                        Projects: {pendingImport.summary?.counts.projects}
                      </span>
                    </div>

                    {pendingImport.warnings.length > 0 && (
                      <div className="p-2 bg-amber/15 border border-amber/40 text-[11px] text-carbon space-y-0.5">
                        <span className="font-bold uppercase text-[10px] text-amber block">
                          Mapping Notices (Omitted Sections):
                        </span>
                        <ul className="list-disc pl-4 text-[10px]">
                          {pendingImport.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="bg-systems-teal hover:bg-emerald-700 text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1 hardware-bevel cursor-pointer"
                    >
                      CONFIRM IMPORT AS NEW CARTRIDGE
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingImport(null)}
                      className="bg-carbon text-platinum hover:text-white px-space-md py-1 hardware-bevel text-xs uppercase cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Reset Sample Demo Data */}
            {!confirmResetDemo ? (
              <div className="bg-periwinkle-mid hardware-bevel p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-carbon text-sm uppercase">
                    4. RESET SYNTHETIC DEMO DATA
                  </div>
                  <div className="text-xs text-carbon/75">
                    Clear current state and restore standard sample cartridges (Priya Mehta &
                    Marcus Vance).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmResetDemo(true)}
                  className="bg-ink-soft hover:bg-carbon text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shrink-0 transition-transform active:translate-y-0.5"
                >
                  RESET DEMO CARTRIDGES
                </button>
              </div>
            ) : (
              <div className="bg-amber/20 border border-amber hardware-inset p-space-sm flex flex-col gap-2">
                <div className="font-bold text-carbon text-sm uppercase">
                  CONFIRM DEMO RESET
                </div>
                <div className="text-xs text-carbon/85">
                  This will replace existing local cartridges with the two standard synthetic
                  sample resumes.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="bg-amber hover:bg-nav-gold text-carbon font-bold font-nav-link text-nav-link uppercase px-space-md py-1 hardware-bevel"
                  >
                    CONFIRM RESET DEMO
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetDemo(false)}
                    className="bg-carbon text-platinum px-space-md py-1 hardware-bevel text-xs uppercase"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* 5. Delete All Local Resume Data */}
            {!confirmDeleteAll ? (
              <div className="bg-signal-red/10 border border-signal-red/30 hardware-bevel p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-signal-red text-sm uppercase">
                    5. PURGE LOCAL BROWSER CARTRIDGES
                  </div>
                  <div className="text-xs text-carbon/75">
                    Erases all application-owned records (resumes, tailored copies, job targets)
                    from this browser&apos;s local storage.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAll(true)}
                  className="bg-signal-red hover:bg-red-700 text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shrink-0 transition-transform active:translate-y-0.5"
                >
                  PURGE LOCAL DATA
                </button>
              </div>
            ) : (
              <div
                className="bg-signal-red/20 border-2 border-signal-red hardware-inset p-space-md flex flex-col gap-space-sm"
                role="alertdialog"
                aria-labelledby="purge-warning-title"
              >
                <div
                  id="purge-warning-title"
                  className="font-bold text-signal-red text-sm uppercase flex items-center gap-2"
                >
                  <span>⚠️ PURGE LOCAL BROWSER DATA</span>
                </div>
                <p className="text-xs text-carbon font-medium leading-relaxed">
                  Are you absolutely certain you want to purge all local resume data? This will
                  permanently delete all resume cartridges stored in this browser&apos;s <code>localStorage</code>.
                  {mode === "cloud" && " (Your cloud account resumes will NOT be touched.)"}
                </p>
                <div className="flex items-center gap-space-sm pt-2">
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    className="bg-signal-red hover:bg-red-700 text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shadow-sm"
                  >
                    CONFIRM PURGE LOCAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(false)}
                    className="bg-carbon text-nav-gold font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* 6. Delete Cloud Account Data (Only in Cloud Mode) */}
            {mode === "cloud" && (
              !confirmDeleteCloud ? (
                <div className="bg-signal-red/15 border-2 border-signal-red/40 hardware-bevel p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-signal-red text-sm uppercase">
                      6. DELETE CLOUD ACCOUNT RESUMES
                    </div>
                    <div className="text-xs text-carbon/75">
                      Permanently erases all cloud resumes and job targets for {user?.email} from the Supabase database.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCloud(true)}
                    className="bg-signal-red hover:bg-red-700 text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shrink-0 transition-transform active:translate-y-0.5"
                  >
                    DELETE CLOUD DATA
                  </button>
                </div>
              ) : (
                <div
                  className="bg-signal-red/25 border-2 border-signal-red hardware-inset p-space-md flex flex-col gap-space-sm"
                  role="alertdialog"
                  aria-labelledby="cloud-purge-warning-title"
                >
                  <div
                    id="cloud-purge-warning-title"
                    className="font-bold text-signal-red text-sm uppercase flex items-center gap-2"
                  >
                    <span>⚠️ IRREVERSIBLE CLOUD DATABASE DELETION</span>
                  </div>
                  <p className="text-xs text-carbon font-medium leading-relaxed">
                    This will permanently delete all cloud resume records and job targets for{" "}
                    <strong>{user?.email}</strong> from the database. <strong>This action is immediate and cannot be undone.</strong>
                  </p>
                  <div className="flex items-center gap-space-sm pt-2">
                    <button
                      type="button"
                      onClick={handleDeleteCloudData}
                      className="bg-signal-red hover:bg-red-700 text-surface font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel shadow-sm"
                    >
                      CONFIRM: PERMANENTLY DELETE ALL CLOUD DATA
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCloud(false)}
                      className="bg-carbon text-nav-gold font-bold font-nav-link text-nav-link uppercase px-space-md py-1.5 hardware-bevel"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )
            )}
          </section>

          {/* Reference Links */}
          <footer className="pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-muted-indigo">
            <span className="font-mono">LEGAL & TECHNICAL DISCLOSURES:</span>
            <div className="flex items-center gap-3">
              <Link
                href="/privacy"
                onClick={handleClose}
                className="hover:underline text-primary font-bold uppercase"
              >
                Privacy Policy
              </Link>
              <span>·</span>
              <Link
                href="/terms"
                onClick={handleClose}
                className="hover:underline text-primary font-bold uppercase"
              >
                Terms of Service
              </Link>
              <span>·</span>
              <Link
                href="/help/ats-and-ai"
                onClick={handleClose}
                className="hover:underline text-primary font-bold uppercase"
              >
                ATS & AI Guide
              </Link>
              <span>·</span>
              <Link
                href="/release-notes"
                onClick={handleClose}
                className="hover:underline text-primary font-bold uppercase"
              >
                Release Notes
              </Link>
            </div>
          </footer>
        </div>

        {/* Modal Chassis Footer */}
        <div className="flex justify-end bg-carbon p-2 hardware-bevel">
          <button
            type="button"
            onClick={handleClose}
            className="bg-ink-soft hover:bg-black text-nav-gold px-4 py-1 hardware-bevel font-bold text-xs uppercase"
          >
            DISMISS SUBSYSTEM
          </button>
        </div>
      </div>
    </div>
  );
}
