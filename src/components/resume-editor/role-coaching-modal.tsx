/**
 * RS-093 — Role-Specific Coaching Modal & Section Reorder Preview
 *
 * Provides a visible role selector and coaching guidance deck.
 * Allows candidates to preview recommended section reordering before applying,
 * ensuring no candidate content is ever discarded or overwritten.
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ROLE_PRESET_IDS,
  ROLE_PRESETS,
  type RolePresetId,
  getRolePreset,
} from "@/lib/coaching/presets";
import { useEditorStore } from "@/lib/resume/editor-store";

interface RoleCoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetId?: RolePresetId;
  onSelectPreset?: (id: RolePresetId) => void;
}

export function RoleCoachingModal({
  isOpen,
  onClose,
  activePresetId = "general",
  onSelectPreset,
}: RoleCoachingModalProps) {
  const [selectedId, setSelectedId] = useState<RolePresetId>(activePresetId);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const draft = useEditorStore((s) => s.draft);
  const updateSettings = useEditorStore((s) => s.updateSettings);

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const preset = getRolePreset(selectedId);
  const currentSectionOrder = draft.settings.sectionOrder?.length
    ? draft.settings.sectionOrder
    : ["summary", "experience", "education", "projects", "skills"];

  const hasOrderDifference =
    JSON.stringify(currentSectionOrder) !==
    JSON.stringify(preset.recommendedSectionOrder);

  function handleApplyReorder() {
    updateSettings({
      sectionOrder: [...preset.recommendedSectionOrder],
    });
    if (onSelectPreset) {
      onSelectPreset(selectedId);
    }
    setAppliedNotice("Recommended section order applied! You can undo this change anytime via Undo (Ctrl+Z).");
    setTimeout(() => {
      setAppliedNotice(null);
      onClose();
    }, 1500);
  }

  function handleKeepOrder() {
    if (onSelectPreset) {
      onSelectPreset(selectedId);
    }
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-coaching-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        className="bg-surface border-2 border-hairline w-full max-w-2xl max-h-[90vh] flex flex-col hardware-bevel text-carbon overflow-hidden shadow-2xl"
      >
        {/* Header Bar */}
        <div className="bg-carbon text-platinum px-4 py-3 flex items-center justify-between hardware-bevel shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nav-gold hardware-inset animate-pulse" />
            <h2
              id="role-coaching-modal-title"
              className="font-headline-sm text-sm uppercase tracking-wider text-nav-gold"
            >
              ROLE COACHING & SECTION ARCHITECTURE (RS-093)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-platinum hover:text-nav-gold font-mono text-sm px-2 py-0.5 hardware-bevel bg-ink-soft cursor-pointer"
            aria-label="Close role coaching modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-canvas-soft">
          {/* Preset Selector */}
          <div>
            <label
              htmlFor="role-preset-dropdown"
              className="block font-ui-label text-xs uppercase tracking-wider font-bold mb-1.5 text-carbon"
            >
              SELECT TARGET ROLE PRESET
            </label>
            <select
              id="role-preset-dropdown"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value as RolePresetId)}
              className="w-full bg-surface border-2 border-hairline px-3 py-2 text-sm font-medium hardware-inset focus:ring-2 focus:ring-systems-teal focus:outline-none"
            >
              {ROLE_PRESET_IDS.map((id) => (
                <option key={id} value={id}>
                  {ROLE_PRESETS[id].name}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-600 mt-1.5 italic">
              {preset.shortDescription} — <span className="font-semibold">{preset.suits}</span>
            </p>
          </div>

          {/* Applied notification */}
          {appliedNotice && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 p-3 hardware-bevel text-xs font-mono font-bold">
              ✓ {appliedNotice}
            </div>
          )}

          {/* Section Ordering Preview */}
          <div className="bg-surface p-4 border border-hairline hardware-bevel space-y-3">
            <h3 className="font-ui-label text-xs uppercase tracking-wider text-carbon font-bold flex items-center justify-between">
              <span>SECTION ARCHITECTURE COMPARISON</span>
              {hasOrderDifference ? (
                <span className="text-amber-700 font-mono text-[10px] bg-amber-50 px-2 py-0.5 border border-amber-300">
                  REORDER AVAILABLE
                </span>
              ) : (
                <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                  ORDER MATCHES PRESET
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-container p-2.5 hardware-inset">
                <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                  CURRENT SECTION ORDER:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 font-mono text-neutral-800">
                  {currentSectionOrder.map((s, i) => (
                    <li key={i} className="capitalize">
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-secondary-container/40 p-2.5 hardware-inset border border-nav-gold/30">
                <span className="font-mono text-[11px] font-bold text-carbon uppercase block mb-1">
                  RECOMMENDED ORDER FOR {preset.name.toUpperCase()}:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 font-mono text-carbon font-semibold">
                  {preset.recommendedSectionOrder.map((s, i) => (
                    <li key={i} className="capitalize">
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <p className="text-[11px] text-neutral-600">
              ℹ️ Applying a recommended section order only changes the presentation sequence.
              <strong className="text-carbon"> It NEVER deletes, overwrites, or modifies any of your entered resume data.</strong>
            </p>
          </div>

          {/* Evidence Expectations & AI Coaching Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-surface p-3 border border-hairline hardware-bevel space-y-2">
              <h4 className="font-ui-label font-bold uppercase tracking-wider text-carbon text-[11px]">
                KEY EVIDENCE EXPECTATIONS
              </h4>
              <ul className="space-y-1 list-disc list-inside text-neutral-700">
                {preset.evidenceExpectations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>

            <div className="bg-surface p-3 border border-hairline hardware-bevel space-y-2">
              <h4 className="font-ui-label font-bold uppercase tracking-wider text-carbon text-[11px]">
                COMMON TOOLS & SKILLS
              </h4>
              <div className="flex flex-wrap gap-1">
                {preset.commonToolsAndSkills.map((tool, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-surface-container hardware-bevel text-[10px] font-mono text-carbon"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Synthetic Example Bullet Pattern */}
          <div className="bg-amber-50/60 p-3.5 border border-amber-200 hardware-bevel space-y-1.5">
            <span className="font-ui-label font-bold text-[11px] uppercase text-amber-900 tracking-wider flex items-center gap-1">
              <span>✦</span> SYNTHETIC EXAMPLE BULLET PATTERN (FOR INSPIRATION)
            </span>
            <p className="font-mono text-xs text-neutral-900 bg-surface p-2 hardware-inset border border-amber-300">
              &quot;{preset.exampleSyntheticBullet.bullet}&quot;
            </p>
            <p className="text-[11px] text-neutral-700 italic">
              <strong>Why it works:</strong> {preset.exampleSyntheticBullet.whyItWorks}
            </p>
          </div>

          {/* Fresher vs Experienced Applicant Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface p-3 border border-hairline hardware-bevel">
            <div>
              <span className="font-bold uppercase text-[11px] text-carbon block mb-1">
                JUNIOR / FRESHER ADVICE:
              </span>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                {preset.fresherVsExperienced.fresherTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-bold uppercase text-[11px] text-carbon block mb-1">
                EXPERIENCED PROFESSIONAL ADVICE:
              </span>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                {preset.fresherVsExperienced.experiencedTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-carbon px-4 py-3 flex flex-wrap items-center justify-between gap-2 hardware-bevel shrink-0">
          <span className="text-[11px] font-mono text-neutral-400">
            ACTIVE PRESET: <strong className="text-nav-gold">{preset.name.toUpperCase()}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleKeepOrder}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-platinum hover:text-nav-gold hardware-bevel bg-ink-soft cursor-pointer"
            >
              KEEP CURRENT ORDER
            </button>

            <button
              type="button"
              onClick={handleApplyReorder}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-carbon bg-nav-gold hover:bg-amber hardware-bevel cursor-pointer shadow-md"
            >
              APPLY RECOMMENDED ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
