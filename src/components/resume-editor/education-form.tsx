/**
 * RS-028 — Education Form Component
 *
 * Repeatable section for educational degrees, coursework, grades, and dates.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export function EducationForm() {
  const education = useEditorStore((s) => s.draft.education);
  const addEducation = useEditorStore((s) => s.addEducation);
  const updateEducation = useEditorStore((s) => s.updateEducation);
  const removeEducation = useEditorStore((s) => s.removeEducation);
  const reorderEducation = useEditorStore((s) => s.reorderEducation);

  const handleCourseworkChange = (eduId: string, text: string) => {
    // Comma-separated coursework items
    const items = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateEducation(eduId, { coursework: items });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Education</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Degrees, certifications, relevant coursework, and academic milestones.
          </p>
        </div>
        <button
          type="button"
          onClick={addEducation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No education entries yet. Add your university, college, or diploma.
          </p>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              {/* Header with reordering */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Degree #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderEducation(index, index - 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition"
                    title="Move up"
                    aria-label={`Move degree ${index + 1} (${entry.degree || "Untitled"}) up`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === education.length - 1}
                    onClick={() => reorderEducation(index, index + 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition"
                    title="Move down"
                    aria-label={`Move degree ${index + 1} (${entry.degree || "Untitled"}) down`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEducation(entry.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition ml-1"
                    title="Remove entry"
                    aria-label={`Remove degree ${index + 1} (${entry.degree || "Untitled"})`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor={`edu-inst-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Institution / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`edu-inst-${entry.id}`}
                    type="text"
                    required
                    value={entry.institution}
                    onChange={(e) => updateEducation(entry.id, { institution: e.target.value })}
                    placeholder="e.g. Stanford University"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`edu-degree-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`edu-degree-${entry.id}`}
                    type="text"
                    required
                    value={entry.degree}
                    onChange={(e) => updateEducation(entry.id, { degree: e.target.value })}
                    placeholder="e.g. B.S., B.Tech, M.S."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`edu-field-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Major / Field of Study
                  </label>
                  <input
                    id={`edu-field-${entry.id}`}
                    type="text"
                    value={entry.field || ""}
                    onChange={(e) => updateEducation(entry.id, { field: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <span id={`edu-dates-label-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Dates Attended
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      id={`edu-start-${entry.id}`}
                      aria-label={`Start date for degree ${index + 1}`}
                      type="text"
                      value={entry.startDate || ""}
                      onChange={(e) => updateEducation(entry.id, { startDate: e.target.value })}
                      placeholder="Start (YYYY-MM)"
                      className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="text-neutral-400 text-xs">–</span>
                    <input
                      id={`edu-end-${entry.id}`}
                      aria-label={`Graduation date for degree ${index + 1}`}
                      type="text"
                      value={entry.endDate || ""}
                      onChange={(e) => updateEducation(entry.id, { endDate: e.target.value })}
                      placeholder="Graduation (YYYY-MM)"
                      className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`edu-grade-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Grade / GPA / Honours
                  </label>
                  <input
                    id={`edu-grade-${entry.id}`}
                    type="text"
                    value={entry.grade || ""}
                    onChange={(e) => updateEducation(entry.id, { grade: e.target.value })}
                    placeholder="e.g. 3.9 / 4.0 or First Class Honours"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor={`edu-coursework-${entry.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Relevant Coursework (comma separated)
                  </label>
                  <input
                    id={`edu-coursework-${entry.id}`}
                    type="text"
                    value={(entry.coursework || []).join(", ")}
                    onChange={(e) => handleCourseworkChange(entry.id, e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms, Distributed Systems, Machine Learning"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
