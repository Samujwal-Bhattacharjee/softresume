/**
 * RS-075 — Certifications Form Component
 *
 * Repeatable section for professional certifications, licenses, and accreditations.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2 } from "lucide-react";

export function CertificationsForm() {
  const certifications = useEditorStore((s) => s.draft.certifications || []);
  const addCertification = useEditorStore((s) => s.addCertification);
  const updateCertification = useEditorStore((s) => s.updateCertification);
  const removeCertification = useEditorStore((s) => s.removeCertification);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Certifications &amp; Licenses</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Industry certifications, vendor credentials, and state or professional licenses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addCertification()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No certifications added yet. Add credentials like AWS, PMP, Cisco, or professional bar/medical licenses.
          </p>
          <button
            type="button"
            onClick={() => addCertification()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Certification
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {certifications.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Certification #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCertification(entry.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition"
                  title="Remove certification"
                  aria-label={`Remove certification ${index + 1} (${entry.name || "Untitled"})`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`cert-name-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Certification Name *
                  </label>
                  <input
                    id={`cert-name-${entry.id}`}
                    type="text"
                    value={entry.name}
                    onChange={(e) => updateCertification(entry.id, { name: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`cert-issuer-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Issuing Organization
                  </label>
                  <input
                    id={`cert-issuer-${entry.id}`}
                    type="text"
                    value={entry.issuer || ""}
                    onChange={(e) => updateCertification(entry.id, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`cert-date-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Issue Date
                  </label>
                  <input
                    id={`cert-date-${entry.id}`}
                    type="text"
                    value={entry.date || ""}
                    onChange={(e) => updateCertification(entry.id, { date: e.target.value })}
                    placeholder="YYYY-MM (e.g. 2024-03)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`cert-expiry-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Expiration Date (Optional)
                  </label>
                  <input
                    id={`cert-expiry-${entry.id}`}
                    type="text"
                    value={entry.expiryDate || ""}
                    onChange={(e) => updateCertification(entry.id, { expiryDate: e.target.value })}
                    placeholder="YYYY-MM (e.g. 2027-03)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`cert-id-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Credential ID / License # (Optional)
                  </label>
                  <input
                    id={`cert-id-${entry.id}`}
                    type="text"
                    value={entry.credentialId || ""}
                    onChange={(e) => updateCertification(entry.id, { credentialId: e.target.value })}
                    placeholder="e.g. ABC-123456"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`cert-url-${entry.id}`}
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Verification URL (Optional)
                  </label>
                  <input
                    id={`cert-url-${entry.id}`}
                    type="url"
                    value={entry.url || ""}
                    onChange={(e) => updateCertification(entry.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-lavender-500"
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
