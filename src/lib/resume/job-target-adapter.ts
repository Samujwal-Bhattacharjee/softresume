/**
 * RS-090 — Local Job Target Persistence Adapter
 *
 * Persists job targets and extracted requirements in client-side localStorage.
 * Guaranteed 100% user-owned, zero server data retention.
 */

import {
  type JobTarget,
  JobTargetSchema,
  createEmptyJobTarget,
} from "@/lib/schemas/job-target";

const STORAGE_PREFIX = "softcv_job_target_";

export const localJobTargetAdapter = {
  /**
   * Retrieves the job target associated with a given resume ID.
   */
  getJobTarget(resumeId: string): JobTarget | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${resumeId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const validated = JobTargetSchema.safeParse(parsed);
      return validated.success ? validated.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Saves or updates a job target for a given resume.
   */
  saveJobTarget(target: JobTarget): JobTarget {
    const validated = JobTargetSchema.parse({
      ...target,
      updatedAt: new Date().toISOString(),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `${STORAGE_PREFIX}${validated.resumeId}`,
        JSON.stringify(validated)
      );
    }
    return validated;
  },

  /**
   * Permanently deletes the job target associated with a resume.
   */
  deleteJobTarget(resumeId: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${STORAGE_PREFIX}${resumeId}`);
    }
  },

  /**
   * Returns a fresh blank job target for the given resume ID.
   */
  createBlank(resumeId: string): JobTarget {
    return createEmptyJobTarget(resumeId);
  },
};
