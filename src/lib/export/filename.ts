/**
 * RS-115 — Safe Filename Sanitizer
 *
 * Produces predictable, safe filenames for resume exports across all operating systems.
 * - Strips path traversal sequences (../, ./)
 * - Strips control characters (ASCII 0-31, 127)
 * - Transliterates common accented Latin characters deterministically
 * - Guards against Windows reserved device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
 * - Enforces length boundaries (max 80 chars before extension)
 * - Replaces whitespace and unsafe chars with underscores
 * - Falls back to a deterministic safe default if empty
 */

const WINDOWS_RESERVED_NAMES = new Set([
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
]);

/**
 * Transliterates common accented Latin characters to their ASCII base.
 */
function normalizeLatinCharacters(str: string): string {
  return str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/ø/g, "o")
    .replace(/Ø/g, "O")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Sanitizes a raw string to be a safe, clean filename component.
 */
export function sanitizeFilename(raw: string, fallback = "resume"): string {
  if (!raw || typeof raw !== "string") {
    return fallback;
  }

  // 1. Replace control characters, null bytes, and path separators with space
  let clean = raw
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/[/\\]/g, " ");

  // 2. Convert all whitespace sequences to underscores
  clean = clean.replace(/\s+/g, "_");

  // 4. Transliterate accented Latin characters
  clean = normalizeLatinCharacters(clean);

  // 5. Remove all characters except safe alphanumerics, hyphens, underscores, and dots
  // Disallows: < > : " / \ | ? *
  clean = clean.replace(/[^a-zA-Z0-9_\-.]/g, "_");

  // 6. Clean up mixed connectors (e.g. "_-_", "-_", "_-") into a single hyphen or underscore
  clean = clean
    .replace(/_+[-]+_+/g, "-")
    .replace(/_+[-]+/g, "-")
    .replace(/[-]+_+/g, "-")
    .replace(/_{2,}/g, "_")
    .replace(/-{2,}/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/[_\-]+(?=\.)/g, "") // remove trailing underscore/hyphen before a dot (e.g. "test_.pdf" -> "test.pdf")
    .replace(/(?<=\.)[_\-]+/g, ""); // remove leading underscore/hyphen after a dot

  // 7. Trim leading and trailing underscores, hyphens, dots
  clean = clean.replace(/^[._\-]+|[._\-]+$/g, "");

  // 8. Check for Windows reserved device names
  const baseUpper = clean.toUpperCase().split(".")[0];
  if (WINDOWS_RESERVED_NAMES.has(baseUpper)) {
    clean = `${clean}_doc`;
  }

  // 9. Bound length (80 chars max)
  if (clean.length > 80) {
    clean = clean.slice(0, 80).replace(/[._\-]+$/, "");
  }

  // 10. If empty or only symbols after sanitization, use fallback
  if (!clean || clean.length === 0) {
    return fallback;
  }

  return clean;
}

export interface BuildExportFilenameOptions {
  candidateName?: string | null;
  resumeTitle?: string | null;
  extension: "pdf" | "docx" | "txt" | "json";
}

/**
 * Constructs a human-readable, safe filename for resume download.
 * E.g., "Alex_Chen_Resume.pdf" or "Renee_Muller_Senior_Engineer.docx"
 */
export function buildExportFilename({
  candidateName,
  resumeTitle,
  extension,
}: BuildExportFilenameOptions): string {
  const parts: string[] = [];

  if (candidateName && candidateName.trim()) {
    const safeName = sanitizeFilename(candidateName.trim(), "");
    if (safeName) parts.push(safeName);
  }

  if (resumeTitle && resumeTitle.trim()) {
    const safeTitle = sanitizeFilename(resumeTitle.trim(), "");
    // Avoid duplicating if title already equals candidate name or "Resume"
    if (safeTitle && !parts.includes(safeTitle)) {
      parts.push(safeTitle);
    }
  }

  let base = parts.join("_");
  if (!base) {
    base = "Resume";
  }

  // Ensure extension is clean
  const cleanExt = extension.replace(/^\./, "").toLowerCase();
  return `${base}.${cleanExt}`;
}

export function sanitizeResumeFilename(
  candidateName?: string | null,
  extension: "pdf" | "docx" | "txt" | "json" = "pdf"
): string {
  return buildExportFilename({ candidateName, extension });
}
