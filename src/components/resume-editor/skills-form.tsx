/**
 * RS-030 — Skills Form Component
 *
 * Grouped technical and domain skills (e.g. Languages, Frameworks, Cloud, Tools).
 * Each group has a category and comma-separated items.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2, Tag } from "lucide-react";

export function SkillsForm() {
  const skills = useEditorStore((s) => s.draft.skills);
  const addSkillGroup = useEditorStore((s) => s.addSkillGroup);
  const updateSkillGroup = useEditorStore((s) => s.updateSkillGroup);
  const removeSkillGroup = useEditorStore((s) => s.removeSkillGroup);

  const handleItemsChange = (id: string, text: string) => {
    const items = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateSkillGroup(id, { items });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Skills & Competencies</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize skills by category for clear readability and high ATS keyword density.
          </p>
        </div>
        <button
          type="button"
          onClick={addSkillGroup}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Category
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No skill categories added yet. Grouping skills (e.g., Languages, Frameworks, Cloud) makes them easier to scan.
          </p>
          <button
            type="button"
            onClick={addSkillGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((group) => (
            <div
              key={group.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <label htmlFor={`skill-cat-${group.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`skill-cat-${group.id}`}
                    type="text"
                    required
                    value={group.category}
                    onChange={(e) => updateSkillGroup(group.id, { category: e.target.value })}
                    placeholder="e.g. Languages, Cloud & DevOps, Databases, Soft Skills"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSkillGroup(group.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition mt-4"
                  title="Remove category"
                  aria-label={`Remove skill category ${group.category || "Untitled"}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label htmlFor={`skill-items-${group.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                  Skills in this category (comma-separated)
                </label>
                <input
                  id={`skill-items-${group.id}`}
                  type="text"
                  value={group.items.join(", ")}
                  onChange={(e) => handleItemsChange(group.id, e.target.value)}
                  placeholder="e.g. TypeScript, Python, Go, Rust, SQL"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Tag preview */}
              {group.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {group.items.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                    >
                      <Tag className="w-2.5 h-2.5 text-neutral-400" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
