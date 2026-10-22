/**
 * RS-075 — Custom Sections Form Component
 *
 * User-defined custom resume sections with flexible entries, bullets, and bounds checking.
 * Cleanly integrates with Console Chrome design tokens and undo/redo history.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2, FolderPlus, Layers } from "lucide-react";

export function CustomSectionsForm() {
  const customSections = useEditorStore((s) => s.draft.customSections || []);
  const addCustomSection = useEditorStore((s) => s.addCustomSection);
  const updateCustomSection = useEditorStore((s) => s.updateCustomSection);
  const removeCustomSection = useEditorStore((s) => s.removeCustomSection);
  const addCustomSectionItem = useEditorStore((s) => s.addCustomSectionItem);
  const updateCustomSectionItem = useEditorStore((s) => s.updateCustomSectionItem);
  const removeCustomSectionItem = useEditorStore((s) => s.removeCustomSectionItem);

  const handleAddBullet = (sectionId: string, itemId: string, bullets: string[] = []) => {
    updateCustomSectionItem(sectionId, itemId, { bullets: [...bullets, ""] });
  };

  const handleUpdateBullet = (
    sectionId: string,
    itemId: string,
    bullets: string[] = [],
    idx: number,
    text: string
  ) => {
    const next = [...bullets];
    next[idx] = text;
    updateCustomSectionItem(sectionId, itemId, { bullets: next });
  };

  const handleRemoveBullet = (
    sectionId: string,
    itemId: string,
    bullets: string[] = [],
    idx: number
  ) => {
    updateCustomSectionItem(sectionId, itemId, {
      bullets: bullets.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Custom Sections</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Add specialized sections such as Patents, Speaking Engagements, Military Service, or Open Source Projects.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addCustomSection("New Custom Section")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Add Section
        </button>
      </div>

      {customSections.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <Layers className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs text-neutral-500 mb-3">
            No custom sections created yet. Tailor your resume by adding your own unique section headers.
          </p>
          <button
            type="button"
            onClick={() => addCustomSection("Key Achievements")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Custom Section
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {customSections.map((section, sIdx) => (
            <div
              key={section.id}
              className="p-5 rounded-xl border-2 border-neutral-200 bg-white shadow-xs space-y-5"
            >
              {/* Section Header & Title input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`section-title-${section.id}`}
                      className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                    >
                      Section #{sIdx + 1} Heading
                    </label>
                    <span className="text-[10px] text-neutral-400">
                      {section.title.length}/80
                    </span>
                  </div>
                  <input
                    id={`section-title-${section.id}`}
                    type="text"
                    maxLength={80}
                    value={section.title}
                    onChange={(e) => updateCustomSection(section.id, { title: e.target.value })}
                    placeholder="e.g. Speaking Engagements &amp; Workshops"
                    className="w-full text-sm font-bold text-neutral-800 px-2.5 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => addCustomSectionItem(section.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomSection(section.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                    title="Delete entire custom section"
                    aria-label={`Delete custom section ${section.title || sIdx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items list */}
              {(!section.items || section.items.length === 0) ? (
                <div className="p-4 bg-neutral-50 rounded-lg text-center border border-dashed border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">
                    This section has no entries yet. Empty sections will not be shown on exported resumes.
                  </p>
                  <button
                    type="button"
                    onClick={() => addCustomSectionItem(section.id)}
                    className="text-xs text-lavender-600 font-semibold hover:underline"
                  >
                    + Add entry to {section.title || "section"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                        <span className="text-[11px] font-medium text-neutral-500">
                          Entry #{itemIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCustomSectionItem(section.id, item.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition"
                          title="Remove entry"
                          aria-label={`Remove entry ${itemIdx + 1} from ${section.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor={`item-title-${item.id}`}
                            className="block text-xs font-medium text-neutral-700 mb-0.5"
                          >
                            Title / Subject
                          </label>
                          <input
                            id={`item-title-${item.id}`}
                            type="text"
                            value={item.title || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="e.g. Keynote Speaker: Future of AI Systems"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-lavender-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`item-sub-${item.id}`}
                            className="block text-xs font-medium text-neutral-700 mb-0.5"
                          >
                            Subtitle / Context
                          </label>
                          <input
                            id={`item-sub-${item.id}`}
                            type="text"
                            value={item.subtitle || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                subtitle: e.target.value,
                              })
                            }
                            placeholder="e.g. Global Tech Summit (San Francisco, CA)"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-lavender-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`item-date-${item.id}`}
                            className="block text-xs font-medium text-neutral-700 mb-0.5"
                          >
                            Date
                          </label>
                          <input
                            id={`item-date-${item.id}`}
                            type="text"
                            value={item.date || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                date: e.target.value,
                              })
                            }
                            placeholder="YYYY-MM (e.g. 2024-04)"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-lavender-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`item-url-${item.id}`}
                            className="block text-xs font-medium text-neutral-700 mb-0.5"
                          >
                            URL / Reference Link (Optional)
                          </label>
                          <input
                            id={`item-url-${item.id}`}
                            type="url"
                            value={item.url || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                url: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-lavender-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <label
                              htmlFor={`item-desc-${item.id}`}
                              className="block text-xs font-medium text-neutral-700"
                            >
                              Description
                            </label>
                            <span className="text-[10px] text-neutral-400">
                              {(item.description || "").length}/2000
                            </span>
                          </div>
                          <textarea
                            id={`item-desc-${item.id}`}
                            maxLength={2000}
                            rows={2}
                            value={item.description || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Details or takeaways from this item..."
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-lavender-500 resize-y"
                          />
                        </div>
                      </div>

                      {/* Optional Bullets within Item */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-neutral-600">
                            Bullet Points (Optional)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddBullet(section.id, item.id, item.bullets)}
                            className="text-[11px] text-lavender-600 hover:text-lavender-700 font-medium inline-flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Add Bullet
                          </button>
                        </div>

                        {(item.bullets || []).map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) =>
                                handleUpdateBullet(
                                  section.id,
                                  item.id,
                                  item.bullets,
                                  bIdx,
                                  e.target.value
                                )
                              }
                              placeholder="Add an achievement or takeaway..."
                              className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-lavender-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveBullet(section.id, item.id, item.bullets, bIdx)
                              }
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
          ))}
        </div>
      )}
    </div>
  );
}
