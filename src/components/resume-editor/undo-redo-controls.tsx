/**
 * RS-072 — Undo/Redo Controls & Keyboard Shortcuts
 *
 * Compact Nintendo 2001 Console Chrome styled undo/redo buttons.
 * Supports Ctrl+Z, Ctrl+Y, and Ctrl+Shift+Z keyboard shortcuts.
 * Emits polite live region announcements for screen reader users.
 */
"use client";

import React, { useEffect } from "react";
import { useEditorStore } from "@/lib/resume/editor-store";

export function UndoRedoControls() {
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const lastActionDescription = useEditorStore((s) => s.lastActionDescription);

  // Global keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when actively focused in input or textarea unless Ctrl/Cmd+Z/Y is pressed
      const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      // When user is typing inside text input, native browser undo handles per-character editing.
      // However, if the user explicitly presses Ctrl+Shift+Z or Ctrl+Y, or is outside an input, handle here.
      if (e.key === "z" || e.key === "Z") {
        if (e.shiftKey) {
          // Redo: Ctrl+Shift+Z
          if (!isInput && canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          // Undo: Ctrl+Z
          if (!isInput && canUndo) {
            e.preventDefault();
            undo();
          }
        }
      } else if (e.key === "y" || e.key === "Y") {
        // Redo: Ctrl+Y
        if (!isInput && canRedo) {
          e.preventDefault();
          redo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return (
    <div className="flex items-center gap-1">
      {/* Screen-reader polite live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {lastActionDescription}
      </div>

      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        className={`px-2 py-1 text-xs font-mono uppercase tracking-wider hardware-bevel flex items-center gap-1 transition-all ${
          canUndo
            ? "bg-ink-soft hover:bg-tertiary text-platinum cursor-pointer"
            : "bg-carbon/40 text-neutral-500 cursor-not-allowed opacity-50 border border-neutral-700/50"
        }`}
        aria-label="Undo last edit (Ctrl+Z)"
        title="Undo last edit (Ctrl+Z)"
      >
        <span>↶</span>
        <span className="hidden sm:inline">UNDO</span>
      </button>

      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        className={`px-2 py-1 text-xs font-mono uppercase tracking-wider hardware-bevel flex items-center gap-1 transition-all ${
          canRedo
            ? "bg-ink-soft hover:bg-tertiary text-platinum cursor-pointer"
            : "bg-carbon/40 text-neutral-500 cursor-not-allowed opacity-50 border border-neutral-700/50"
        }`}
        aria-label="Redo last undone edit (Ctrl+Y or Ctrl+Shift+Z)"
        title="Redo last undone edit (Ctrl+Y or Ctrl+Shift+Z)"
      >
        <span>↷</span>
        <span className="hidden sm:inline">REDO</span>
      </button>
    </div>
  );
}
