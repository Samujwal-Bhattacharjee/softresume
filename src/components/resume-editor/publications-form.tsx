/**
 * RS-075 — Publications Form Component
 *
 * Repeatable section for research papers, articles, book chapters, and patents.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2 } from "lucide-react";

export function PublicationsForm() {
  const publications = useEditorStore((s) => s.draft.publications || []);
  const addPublication = useEditorStore((s) => s.addPublication);
  const updatePublication = useEditorStore((s) => s.updatePublication);
  const removePublication = useEditorStore((s) => s.removePublication);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Publications &amp; Research</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Peer-reviewed papers, conference proceedings, preprints, books, or technical patents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addPublication()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Publication
        </button>
      </div>

      {publications.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No publications added yet. Ideal for researchers, academics, PhD candidates, and specialist engineers.
          </p>
          <button
            type="button"
            onClick={() => addPublication()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Publication
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {publications.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Publication #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePublication(entry.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition"
                  title="Remove publication"
                  aria-label={`Remove publication ${index + 1} (${entry.title || "Untitled"})`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label
                    htmlFor={`pub-title-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Publication / Paper Title *
                  </label>
                  <input
                    id={`pub-title-${entry.id}`}
                    type="text"
                    value={entry.title}
                    onChange={(e) => updatePublication(entry.id, { title: e.target.value })}
                    placeholder="e.g. Scalable Graph Transformers for Heterogeneous Knowledge Bases"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`pub-venue-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Journal / Conference / Publisher
                  </label>
                  <input
                    id={`pub-venue-${entry.id}`}
                    type="text"
                    value={entry.venue || ""}
                    onChange={(e) => updatePublication(entry.id, { venue: e.target.value })}
                    placeholder="e.g. NeurIPS 2024 / IEEE Transactions"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`pub-date-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Publication Date
                  </label>
                  <input
                    id={`pub-date-${entry.id}`}
                    type="text"
                    value={entry.date || ""}
                    onChange={(e) => updatePublication(entry.id, { date: e.target.value })}
                    placeholder="YYYY-MM (e.g. 2024-11)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`pub-authors-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Authors
                  </label>
                  <input
                    id={`pub-authors-${entry.id}`}
                    type="text"
                    value={entry.authors || ""}
                    onChange={(e) => updatePublication(entry.id, { authors: e.target.value })}
                    placeholder="e.g. S. Smith, J. Doe, et al."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`pub-url-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    DOI / Paper Link (Optional)
                  </label>
                  <input
                    id={`pub-url-${entry.id}`}
                    type="url"
                    value={entry.url || ""}
                    onChange={(e) => updatePublication(entry.id, { url: e.target.value })}
                    placeholder="https://doi.org/..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor={`pub-desc-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Abstract or Brief Summary (Optional)
                  </label>
                  <textarea
                    id={`pub-desc-${entry.id}`}
                    rows={2}
                    value={entry.description || ""}
                    onChange={(e) => updatePublication(entry.id, { description: e.target.value })}
                    placeholder="One-line summary of contributions or core results."
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
