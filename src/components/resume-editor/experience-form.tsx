/**
 * RS-027 — Work Experience Form Component
 *
 * Repeatable section for professional employment history.
 * Supports bullets, dates, roles, employer, and reordering.
 */
"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { BulletImproverModal } from "./bullet-improver-modal";

export function ExperienceForm() {
  const experience = useEditorStore((s) => s.draft.experience);
  const addExperience = useEditorStore((s) => s.addExperience);
  const updateExperience = useEditorStore((s) => s.updateExperience);
  const removeExperience = useEditorStore((s) => s.removeExperience);
  const reorderExperience = useEditorStore((s) => s.reorderExperience);

  const [activeAiModal, setActiveAiModal] = useState<{
    expId: string;
    bulletIdx: number;
    bulletText: string;
    role?: string;
    employer?: string;
  } | null>(null);

  const handleAddBullet = (expId: string, bullets: string[]) => {
    updateExperience(expId, { bullets: [...bullets, ""] });
  };

  const handleUpdateBullet = (
    expId: string,
    bullets: string[],
    idx: number,
    text: string
  ) => {
    const next = [...bullets];
    next[idx] = text;
    updateExperience(expId, { bullets: next });
  };

  const handleRemoveBullet = (
    expId: string,
    bullets: string[],
    idx: number
  ) => {
    updateExperience(expId, {
      bullets: bullets.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Work Experience</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            List your relevant roles in reverse-chronological order.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Role
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No work experience added yet. Add full-time, part-time, or contract positions.
          </p>
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experience.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4 relative group"
            >
              {/* Item header with reorder & delete */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Role #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderExperience(index, index - 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
                    title="Move up"
                    aria-label={`Move role ${index + 1} (${entry.role || "Untitled"}) up`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === experience.length - 1}
                    onClick={() => reorderExperience(index, index + 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
                    title="Move down"
                    aria-label={`Move role ${index + 1} (${entry.role || "Untitled"}) down`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExperience(entry.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition ml-1"
                    title="Remove role"
                    aria-label={`Remove role ${index + 1} (${entry.role || "Untitled"})`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`exp-role-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Job Title / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`exp-role-${entry.id}`}
                    type="text"
                    required
                    value={entry.role}
                    onChange={(e) => updateExperience(entry.id, { role: e.target.value })}
                    placeholder="e.g. Lead Software Engineer"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`exp-employer-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Company / Employer <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`exp-employer-${entry.id}`}
                    type="text"
                    required
                    value={entry.employer}
                    onChange={(e) => updateExperience(entry.id, { employer: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`exp-location-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Location
                  </label>
                  <input
                    id={`exp-location-${entry.id}`}
                    type="text"
                    value={entry.location || ""}
                    onChange={(e) => updateExperience(entry.id, { location: e.target.value })}
                    placeholder="e.g. London, UK or Remote"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <span id={`exp-timeline-label-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Timeline
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      id={`exp-start-${entry.id}`}
                      aria-label={`Start date for role ${index + 1}`}
                      type="text"
                      value={entry.startDate || ""}
                      onChange={(e) => updateExperience(entry.id, { startDate: e.target.value })}
                      placeholder="YYYY-MM (e.g. 2021-03)"
                      className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="text-neutral-400 text-xs">–</span>
                    <input
                      id={`exp-end-${entry.id}`}
                      aria-label={`End date for role ${index + 1}`}
                      type="text"
                      disabled={entry.current}
                      value={entry.current ? "Present" : entry.endDate || ""}
                      onChange={(e) => updateExperience(entry.id, { endDate: e.target.value })}
                      placeholder="YYYY-MM"
                      className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-neutral-100 disabled:text-neutral-500"
                    />
                  </div>
                  <label className="inline-flex items-center gap-1.5 mt-1 text-[11px] text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!entry.current}
                      onChange={(e) => updateExperience(entry.id, { current: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    I currently work here
                  </label>
                </div>
              </div>

              {/* Bullet points */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700">
                    Accomplishments & Responsibilities (Bullet Points)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(entry.id, entry.bullets)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-3 h-3" />
                    Add Bullet
                  </button>
                </div>

                <div className="space-y-2">
                  {entry.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-neutral-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        aria-label={`Accomplishment bullet ${bIdx + 1} for ${entry.role || `Role ${index + 1}`}`}
                        onChange={(e) =>
                          handleUpdateBullet(entry.id, entry.bullets, bIdx, e.target.value)
                        }
                        placeholder="Action verb + Context + Measurable outcome (e.g. Architected microservices pipeline reducing latency by 35%)"
                        className="flex-1 p-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setActiveAiModal({
                            expId: entry.id,
                            bulletIdx: bIdx,
                            bulletText: bullet,
                            role: entry.role,
                            employer: entry.employer,
                          })
                        }
                        aria-label={`Improve bullet ${bIdx + 1} with AI`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 mt-1 transition shrink-0"
                        title="Improve bullet with AI"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Improve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(entry.id, entry.bullets, bIdx)}
                        aria-label={`Remove bullet ${bIdx + 1}`}
                        className="p-1 text-neutral-400 hover:text-red-500 mt-1"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {entry.bullets.length === 0 && (
                    <p className="text-[11px] text-neutral-400 italic">
                      No bullet points yet. Add quantified statements showing impact.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Bullet Improver Modal */}
      {activeAiModal && (
        <BulletImproverModal
          isOpen={true}
          onClose={() => setActiveAiModal(null)}
          originalBullet={activeAiModal.bulletText}
          context={{
            role: activeAiModal.role,
            employer: activeAiModal.employer,
          }}
          onApply={(improved) => {
            const exp = experience.find((e) => e.id === activeAiModal.expId);
            if (exp) {
              handleUpdateBullet(activeAiModal.expId, exp.bullets, activeAiModal.bulletIdx, improved);
            }
          }}
        />
      )}
    </div>
  );
}
