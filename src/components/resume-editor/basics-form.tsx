/**
 * RS-025 — Basics / Contact Form Component
 *
 * Allows users to edit their name, headline, contact information,
 * and key portfolio/profile links.
 */
"use client";

import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2, Globe } from "lucide-react";

export function BasicsForm() {
  const basics = useEditorStore((s) => s.draft.basics);
  const updateBasics = useEditorStore((s) => s.updateBasics);

  const handleLinkChange = (index: number, field: "label" | "url", val: string) => {
    const nextLinks = [...basics.links];
    nextLinks[index] = { ...nextLinks[index], [field]: val };
    updateBasics({ links: nextLinks });
  };

  const handleAddLink = () => {
    updateBasics({
      links: [...basics.links, { label: "Portfolio", url: "" }],
    });
  };

  const handleRemoveLink = (index: number) => {
    updateBasics({
      links: basics.links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-800">Personal Information</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Recruiters and ATS parse contact info from the document body.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="basics-name" className="block text-xs font-medium text-neutral-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="basics-name"
            type="text"
            required
            value={basics.name}
            onChange={(e) => updateBasics({ name: e.target.value })}
            placeholder="e.g. Alex Chen"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="basics-headline" className="block text-xs font-medium text-neutral-700 mb-1">
            Professional Headline / Target Role
          </label>
          <input
            id="basics-headline"
            type="text"
            value={basics.headline || ""}
            onChange={(e) => updateBasics({ headline: e.target.value })}
            placeholder="e.g. Senior Frontend Engineer · React & Design Systems"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="basics-email" className="block text-xs font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <input
            id="basics-email"
            type="email"
            value={basics.email || ""}
            onChange={(e) => updateBasics({ email: e.target.value })}
            placeholder="alex.chen@example.com"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="basics-phone" className="block text-xs font-medium text-neutral-700 mb-1">
            Phone Number
          </label>
          <input
            id="basics-phone"
            type="tel"
            value={basics.phone || ""}
            onChange={(e) => updateBasics({ phone: e.target.value })}
            placeholder="+1 (555) 019-2834"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="basics-location" className="block text-xs font-medium text-neutral-700 mb-1">
            Location (City, Country / State)
          </label>
          <input
            id="basics-location"
            type="text"
            value={basics.location || ""}
            onChange={(e) => updateBasics({ location: e.target.value })}
            placeholder="e.g. San Francisco, CA or London, UK"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Profile Links */}
      <div className="pt-2 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            Websites & Social Links
          </span>
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
          </button>
        </div>

        {basics.links.length === 0 ? (
          <p className="text-xs text-neutral-600 italic font-medium">
            No links added yet. Add GitHub, LinkedIn, or your portfolio website.
          </p>
        ) : (
          <div className="space-y-2">
            {basics.links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  aria-label={`Link ${idx + 1} label`}
                  onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                  placeholder="Label (e.g. GitHub)"
                  className="w-1/3 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <input
                  type="url"
                  value={link.url}
                  aria-label={`Link ${idx + 1} URL`}
                  onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition rounded"
                  title="Remove link"
                  aria-label={`Remove link ${link.label || idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
