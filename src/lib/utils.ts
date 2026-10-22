import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a stable short ID for new resume entries */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Format a date string for display (YYYY-MM → "May 2024") */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const normalized = dateStr.trim().toLowerCase();
  if (normalized === "present" || normalized === "current") return "Present";

  const [year, month] = dateStr.split("-");
  if (!year) return dateStr;

  if (!month) return year;

  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

/** Format a date range for display */
export function formatDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  current?: boolean
): string {
  const start = formatDate(startDate);
  const end = current ? "Present" : formatDate(endDate);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

export { sanitizeFilename } from "./export/filename";

/** Debounce a function with cancel capability */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn(...args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };
  return debounced;
}

/** Truncate text to max chars with ellipsis */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

/** Check if we're running in a browser */
export const isBrowser = typeof window !== "undefined";
