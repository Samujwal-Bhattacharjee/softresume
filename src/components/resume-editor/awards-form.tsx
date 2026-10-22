/**
 * RS-075 — Awards Form Component
 *
 * Repeatable section for honors, scholarships, awards, and competitions.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2 } from "lucide-react";

export function AwardsForm() {
  const awards = useEditorStore((s) => s.draft.awards || []);
  const addAward = useEditorStore((s) => s.addAward);
  const updateAward = useEditorStore((s) => s.updateAward);
  const removeAward = useEditorStore((s) => s.removeAward);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Honors &amp; Awards</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Academic honors, hackathons, industry recognition, and competitive scholarships.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addAward()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Award
        </button>
      </div>

      {awards.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No awards or honors added yet. Include Dean&apos;s list, hackathon placements, or company excellence awards.
          </p>
          <button
            type="button"
            onClick={() => addAward()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Award
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {awards.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Award #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAward(entry.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition"
                  title="Remove award"
                  aria-label={`Remove award ${index + 1} (${entry.title || "Untitled"})`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label
                    htmlFor={`award-title-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Award / Honor Title *
                  </label>
                  <input
                    id={`award-title-${entry.id}`}
                    type="text"
                    value={entry.title}
                    onChange={(e) => updateAward(entry.id, { title: e.target.value })}
                    placeholder="e.g. 1st Place National AI Hackathon"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`award-date-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Date Received
                  </label>
                  <input
                    id={`award-date-${entry.id}`}
                    type="text"
                    value={entry.date || ""}
                    onChange={(e) => updateAward(entry.id, { date: e.target.value })}
                    placeholder="YYYY-MM (e.g. 2024-05)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor={`award-issuer-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Grantor / Organization
                  </label>
                  <input
                    id={`award-issuer-${entry.id}`}
                    type="text"
                    value={entry.issuer || ""}
                    onChange={(e) => updateAward(entry.id, { issuer: e.target.value })}
                    placeholder="e.g. Association for Computing Machinery (ACM)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor={`award-desc-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Brief Description (Optional)
                  </label>
                  <textarea
                    id={`award-desc-${entry.id}`}
                    rows={2}
                    value={entry.description || ""}
                    onChange={(e) => updateAward(entry.id, { description: e.target.value })}
                    placeholder="Briefly describe the criteria or significance (e.g. Awarded among 250+ collegiate teams for highest accuracy model)."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500 resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
