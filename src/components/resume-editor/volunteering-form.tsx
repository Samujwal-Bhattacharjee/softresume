/**
 * RS-075 — Volunteering Form Component
 *
 * Repeatable section for community service, volunteer work, and board roles.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2 } from "lucide-react";

export function VolunteeringForm() {
  const volunteering = useEditorStore((s) => s.draft.volunteering || []);
  const addVolunteering = useEditorStore((s) => s.addVolunteering);
  const updateVolunteering = useEditorStore((s) => s.updateVolunteering);
  const removeVolunteering = useEditorStore((s) => s.removeVolunteering);

  const handleAddBullet = (id: string, bullets: string[] = []) => {
    updateVolunteering(id, { bullets: [...bullets, ""] });
  };

  const handleUpdateBullet = (
    id: string,
    bullets: string[] = [],
    idx: number,
    text: string
  ) => {
    const next = [...bullets];
    next[idx] = text;
    updateVolunteering(id, { bullets: next });
  };

  const handleRemoveBullet = (
    id: string,
    bullets: string[] = [],
    idx: number
  ) => {
    updateVolunteering(id, {
      bullets: bullets.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Volunteering &amp; Community Service</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Non-profit leadership, community organizing, open-source maintainership, and civic contributions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addVolunteering()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Volunteering
        </button>
      </div>

      {volunteering.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No volunteer experience added yet. Volunteering showcases leadership and core values to employers.
          </p>
          <button
            type="button"
            onClick={() => addVolunteering()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Volunteering Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {volunteering.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Volunteering #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeVolunteering(entry.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition"
                  title="Remove volunteering entry"
                  aria-label={`Remove volunteering ${index + 1} (${entry.role || "Untitled"})`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`vol-role-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Role / Title *
                  </label>
                  <input
                    id={`vol-role-${entry.id}`}
                    type="text"
                    value={entry.role}
                    onChange={(e) => updateVolunteering(entry.id, { role: e.target.value })}
                    placeholder="e.g. Lead Technical Mentor / Event Organizer"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`vol-org-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Organization / Cause *
                  </label>
                  <input
                    id={`vol-org-${entry.id}`}
                    type="text"
                    value={entry.organization}
                    onChange={(e) => updateVolunteering(entry.id, { organization: e.target.value })}
                    placeholder="e.g. Code for Good Foundation"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`vol-start-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    id={`vol-start-${entry.id}`}
                    type="text"
                    value={entry.startDate || ""}
                    onChange={(e) => updateVolunteering(entry.id, { startDate: e.target.value })}
                    placeholder="YYYY-MM (e.g. 2022-09)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`vol-end-${entry.id}`}
                      className="block text-xs font-medium text-neutral-700"
                    >
                      End Date
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.current || false}
                        onChange={(e) =>
                          updateVolunteering(entry.id, {
                            current: e.target.checked,
                            endDate: e.target.checked ? "" : entry.endDate,
                          })
                        }
                        className="rounded border-neutral-300 text-lavender-600 focus:ring-lavender-500"
                      />
                      <span>Ongoing</span>
                    </label>
                  </div>
                  <input
                    id={`vol-end-${entry.id}`}
                    type="text"
                    disabled={entry.current}
                    value={entry.current ? "Present" : entry.endDate || ""}
                    onChange={(e) => updateVolunteering(entry.id, { endDate: e.target.value })}
                    placeholder="YYYY-MM (e.g. 2023-06)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500 disabled:bg-neutral-50 disabled:text-neutral-400"
                  />
                </div>
              </div>

              {/* Impact Bullets */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-neutral-700">
                    Key Contributions &amp; Impact
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(entry.id, entry.bullets)}
                    className="text-xs text-lavender-600 hover:text-lavender-700 font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Bullet
                  </button>
                </div>

                {(entry.bullets || []).map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) =>
                        handleUpdateBullet(entry.id, entry.bullets, bIdx, e.target.value)
                      }
                      placeholder="e.g. Organized weekly coding workshops for 40+ local high school students."
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(entry.id, entry.bullets, bIdx)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition"
                      aria-label="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
