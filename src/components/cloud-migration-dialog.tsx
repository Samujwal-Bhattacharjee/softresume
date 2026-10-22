/**
 * SoftCV Studio — Local-to-Cloud Migration Dialog (2001 Console Chrome Edition)
 *
 * Implements RS-041, RS-042, RS-063:
 * - User-controlled migration of local browser cartridges to the authenticated Supabase account.
 * - Displays count, titles, and schema validation status.
 * - Excludes synthetic specimens (Priya Mehta / Rohan Kapoor) by default.
 * - Idempotent upload reporting per-item progress.
 * - Never deletes local data automatically; offers explicit post-migration purge.
 */
"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { useModalA11y } from "@/lib/hooks/use-modal-a11y";
import {
  planLocalMigration,
  executeCloudMigration,
  purgeMigratedLocalRecords,
  type MigrationBatchResult,
} from "@/lib/resume/cloud-migration";
import type { SupabaseAdapter } from "@/lib/resume/supabase-adapter";

interface CloudMigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cloudAdapter: SupabaseAdapter;
  userEmail?: string;
  onMigrationComplete?: () => void;
}

export function CloudMigrationDialog({
  isOpen,
  onClose,
  cloudAdapter,
  userEmail,
  onMigrationComplete,
}: CloudMigrationDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [includeDemo, setIncludeDemo] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<MigrationBatchResult | null>(null);
  const [confirmPurgeLocal, setConfirmPurgeLocal] = useState(false);
  const [purgedCount, setPurgedCount] = useState<number | null>(null);

  const plan = useMemo(() => {
    if (!isOpen) return null;
    return planLocalMigration({ includeDemo });
  }, [includeDemo, isOpen]);

  const handleClose = useCallback(() => {
    if (isMigrating) return; // Prevent closing mid-transfer
    setResult(null);
    setConfirmPurgeLocal(false);
    setPurgedCount(null);
    onClose();
  }, [isMigrating, onClose]);

  useModalA11y({
    isOpen,
    onClose: handleClose,
    containerRef,
  });

  if (!isOpen) return null;

  const handleStartMigration = async () => {
    if (!plan || plan.candidates.length === 0) return;
    setIsMigrating(true);
    setProgress({ current: 0, total: plan.candidates.length });

    try {
      const res = await executeCloudMigration(plan.candidates, cloudAdapter, {
        skipDuplicates: true,
        onProgress: (current, total) => setProgress({ current, total }),
      });
      setResult(res);
      onMigrationComplete?.();
    } catch {
      // Errors handled per-item in result
    } finally {
      setIsMigrating(false);
    }
  };

  const handlePurgeLocal = () => {
    if (!result) return;
    const succeededLocalIds = result.results
      .filter((r) => r.success)
      .map((r) => r.localId);

    const { purgedCount: count } = purgeMigratedLocalRecords(succeededLocalIds);
    setPurgedCount(count);
    setConfirmPurgeLocal(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-migration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/80 backdrop-blur-xs"
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-periwinkle-mid border-2 border-hairline hardware-bevel shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-carbon font-body"
      >
        {/* Header Bar */}
        <div className="bg-carbon text-platinum px-4 py-3 flex items-center justify-between hardware-bevel shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nav-gold animate-pulse hardware-inset" />
            <h2
              id="cloud-migration-title"
              className="font-display text-sm uppercase tracking-wider text-nav-gold"
            >
              MOVE LOCAL CARTRIDGES TO CLOUD ACCOUNT
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isMigrating}
            className="text-canvas-soft hover:text-nav-gold font-bold px-2 py-0.5 hardware-bevel text-xs disabled:opacity-50"
            aria-label="Close migration dialog"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Identity & Scope Notice */}
          <div className="bg-surface hardware-inset p-3.5 border-l-4 border-l-nav-gold text-xs space-y-1">
            <div className="font-bold uppercase tracking-wider text-carbon flex items-center justify-between">
              <span>TARGET ACCOUNT: {userEmail ?? "AUTHENTICATED SESSION"}</span>
              <span className="bg-systems-teal text-surface px-1.5 py-0.5 rounded-xs font-mono text-[10px]">
                RLS PROTECTED
              </span>
            </div>
            <p className="text-carbon/80">
              Transferring will upload selected local cartridges to your private cloud storage.
              Records are encrypted at rest and accessible only by this authenticated account.
              Your local browser copies remain untouched.
            </p>
          </div>

          {/* Results State */}
          {result ? (
            <div className="space-y-3">
              <div
                className={`p-3.5 hardware-bevel ${
                  result.failed === 0
                    ? "bg-systems-teal/15 border border-systems-teal text-carbon"
                    : "bg-games-red/10 border border-games-red text-carbon"
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>{result.failed === 0 ? "✓ TRANSFER COMPLETE" : "⚠ PARTIAL TRANSFER"}</span>
                  <span className="font-mono text-[11px]">
                    ({result.succeeded} uploaded, {result.skipped} skipped/duplicate, {result.failed} failed)
                  </span>
                </div>
                <div className="text-xs text-carbon/90 space-y-1 max-h-36 overflow-y-auto font-mono">
                  {result.results.map((r) => (
                    <div key={r.localId} className="flex items-center justify-between text-[11px]">
                      <span className="truncate max-w-xs">{r.title}</span>
                      <span
                        className={
                          r.success
                            ? r.skipped
                              ? "text-amber font-bold"
                              : "text-systems-teal font-bold"
                            : "text-games-red font-bold"
                        }
                      >
                        {r.success
                          ? r.skipped
                            ? "ALREADY IN CLOUD"
                            : "UPLOADED"
                          : `FAILED: ${r.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purge Local Option */}
              {purgedCount === null ? (
                <div className="bg-canvas-soft/40 hardware-inset p-3 text-xs space-y-2">
                  <div className="font-bold uppercase tracking-wider text-carbon">
                    LOCAL CARTRIDGE RETENTION
                  </div>
                  <p className="text-carbon/80">
                    Your local cartridges are still saved in this browser. You can keep them as an
                    offline copy or clean them up now that they are securely stored in your cloud account.
                  </p>
                  {confirmPurgeLocal ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handlePurgeLocal}
                        className="bg-games-red text-surface px-3 py-1 hardware-bevel font-bold text-xs uppercase"
                      >
                        CONFIRM: PURGE LOCAL COPIES
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeLocal(false)}
                        className="bg-carbon text-platinum px-3 py-1 hardware-bevel text-xs uppercase"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmPurgeLocal(true)}
                      className="bg-carbon hover:bg-black text-platinum px-3 py-1 hardware-bevel text-xs uppercase font-bold"
                    >
                      REMOVE MIGRATED LOCAL COPIES
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-systems-teal text-surface p-2 hardware-bevel text-xs font-bold uppercase">
                  ✓ Removed {purgedCount} local cartridge(s). Cloud copies remain safe in your account.
                </div>
              )}
            </div>
          ) : (
            /* Pre-Transfer Candidate List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-carbon">
                <span>
                  FOUND {plan?.totalLocalCount ?? 0} LOCAL CARTRIDGE(S) ({plan?.candidates.length ?? 0} SELECTED)
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer font-normal text-xs">
                  <input
                    type="checkbox"
                    checked={includeDemo}
                    onChange={(e) => setIncludeDemo(e.target.checked)}
                    className="accent-nav-gold"
                  />
                  <span>Include demo specimens ({plan?.demoCount ?? 0})</span>
                </label>
              </div>

              {/* Candidate Items Box */}
              <div className="bg-surface hardware-inset p-2.5 max-h-48 overflow-y-auto space-y-1.5">
                {plan?.candidates.length === 0 ? (
                  <p className="text-xs text-carbon/60 italic p-2 text-center">
                    No matching local cartridges found to migrate.
                  </p>
                ) : (
                  plan?.candidates.map((cand) => (
                    <div
                      key={cand.localId}
                      className="bg-platinum px-2.5 py-1.5 hardware-bevel flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-nav-gold shrink-0" />
                        <span className="font-bold truncate text-carbon">{cand.title}</span>
                        {cand.isDemoFixture && (
                          <span className="bg-ink-soft text-canvas-soft px-1 text-[10px] rounded-xs uppercase">
                            DEMO
                          </span>
                        )}
                        {cand.jobTarget && (
                          <span className="bg-systems-teal/20 text-carbon px-1 text-[10px] rounded-xs uppercase font-mono">
                            + JOB TARGET
                          </span>
                        )}
                      </div>
                      <span
                        className={
                          cand.isValid
                            ? "text-systems-teal font-bold text-[10px] uppercase font-mono"
                            : "text-games-red font-bold text-[10px] uppercase font-mono"
                        }
                      >
                        {cand.isValid ? "SCHEMA VALID" : "INVALID SHAPE"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Progress Bar during transfer */}
              {isMigrating && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span>UPLOADING TO SUPABASE...</span>
                    <span>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-carbon hardware-inset h-2.5 overflow-hidden">
                    <div
                      className="bg-nav-gold h-full transition-all duration-200"
                      style={{
                        width: `${
                          progress.total > 0
                            ? Math.round((progress.current / progress.total) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-carbon/95 p-3 px-5 flex items-center justify-between hardware-bevel shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isMigrating}
            className="text-platinum hover:text-nav-gold text-xs uppercase font-bold tracking-wider"
          >
            {result ? "DONE" : "CANCEL // STAY IN LOCAL"}
          </button>

          {!result && (
            <button
              type="button"
              onClick={handleStartMigration}
              disabled={isMigrating || !plan || plan.candidates.length === 0}
              className="bg-primary hover:bg-nav-gold text-carbon font-bold px-4 py-1.5 hardware-bevel text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isMigrating ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-carbon animate-ping" />
                  <span>MIGRATING SECTORS…</span>
                </>
              ) : (
                <>
                  <span>☁</span>
                  <span>MIGRATE {plan?.candidates.length ?? 0} CARTRIDGES TO CLOUD</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
