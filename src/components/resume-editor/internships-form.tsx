/**
 * RS-031 — Internships Form Component
 *
 * Repeatable section for internships, student placements, and traineeships.
 * Crucial for student and fresher resumes.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2 } from "lucide-react";

export function InternshipsForm() {
  const internships = useEditorStore((s) => s.draft.internships || []);
  const addInternship = useEditorStore((s) => s.addInternship);
  const updateInternship = useEditorStore((s) => s.updateInternship);
  const removeInternship = useEditorStore((s) => s.removeInternship);

  const handleAddBullet = (id: string, bullets: string[]) => {
    updateInternship(id, { bullets: [...bullets, ""] });
  };

  const handleUpdateBullet = (
    id: string,
    bullets: string[],
    idx: number,
    text: string
  ) => {
    const next = [...bullets];
    next[idx] = text;
    updateInternship(id, { bullets: next });
  };

  const handleRemoveBullet = (
    id: string,
    bullets: string[],
    idx: number
  ) => {
    updateInternship(id, {
      bullets: bullets.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Internships & Traineeships</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Industry placements, summer internships, and graduate trainee programs.
          </p>
        </div>
        <button
          type="button"
          onClick={addInternship}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Internship
        </button>
      </div>

      {internships.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No internships added yet. If you have completed an internship, add it here to showcase applied industry experience.
          </p>
          <button
            type="button"
            onClick={addInternship}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Internship
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {internships.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Internship #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeInternship(entry.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition"
                  title="Remove internship"
                  aria-label={`Remove internship ${index + 1} (${entry.role || "Untitled"})`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`intern-role-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Role / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`intern-role-${entry.id}`}
                    type="text"
                    required
                    value={entry.role}
                    onChange={(e) => updateInternship(entry.id, { role: e.target.value })}
                    placeholder="e.g. Software Engineering Intern"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`intern-employer-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Employer / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`intern-employer-${entry.id}`}
                    type="text"
                    required
                    value={entry.employer}
                    onChange={(e) => updateInternship(entry.id, { employer: e.target.value })}
                    placeholder="e.g. DataFlow Technologies"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`intern-location-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Location
                  </label>
                  <input
                    id={`intern-location-${entry.id}`}
                    type="text"
                    value={entry.location || ""}
                    onChange={(e) => updateInternship(entry.id, { location: e.target.value })}
                    placeholder="e.g. London, UK (Remote)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <span id={`intern-dates-label-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Dates
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      id={`intern-start-${entry.id}`}
                      aria-label={`Start date for internship ${index + 1}`}
                      type="text"
                      value={entry.startDate || ""}
                      onChange={(e) => updateInternship(entry.id, { startDate: e.target.value })}
                      placeholder="YYYY-MM"
                      className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="text-neutral-400 text-xs">–</span>
                    <input
                      id={`intern-end-${entry.id}`}
                      aria-label={`End date for internship ${index + 1}`}
                      type="text"
                      disabled={entry.current}
                      value={entry.current ? "Present" : entry.endDate || ""}
                      onChange={(e) => updateInternship(entry.id, { endDate: e.target.value })}
                      placeholder="YYYY-MM"
                      className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bullets */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700">
                    Key Contributions & Learnings
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
                        aria-label={`Contribution bullet ${bIdx + 1} for ${entry.role || `Internship ${index + 1}`}`}
                        onChange={(e) =>
                          handleUpdateBullet(entry.id, entry.bullets, bIdx, e.target.value)
                        }
                        placeholder="Project worked on, tools used, and business outcome"
                        className="flex-1 p-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(entry.id, entry.bullets, bIdx)}
                        aria-label={`Remove contribution bullet ${bIdx + 1}`}
                        className="p-1 text-neutral-400 hover:text-red-500 mt-1"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
