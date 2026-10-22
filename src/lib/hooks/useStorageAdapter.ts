/**
 * useStorageAdapter — picks the correct persistence adapter (RS-040, RS-041)
 *
 * Returns:
 * - The Supabase cloud adapter when cloud mode is active and a session exists.
 * - The local localStorage adapter when Supabase is unconfigured (demo mode).
 *
 * Also exposes the current user and auth state for UI (e.g. showing sign-out).
 *
 * Note: Cloud adapter methods are async; local adapter methods are sync.
 * Callers must await all adapter calls for forward-compatibility.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { localAdapter } from "@/lib/resume/local-adapter";
import { getSupabaseBrowserClient, isCloudModeEnabled } from "@/lib/supabase/client";
import { createSupabaseAdapter } from "@/lib/resume/supabase-adapter";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export type AdapterMode = "local" | "cloud";

export interface StorageState {
  /** Current adapter — local or Supabase cloud */
  adapter: typeof localAdapter | ReturnType<typeof createSupabaseAdapter>;
  mode: AdapterMode;
  /** Current authenticated user (null in local mode or when signed out) */
  user: User | null;
  /** True while session is being resolved */
  loading: boolean;
}

export function useStorageAdapter(): StorageState {
  const [user, setUser] = useState<User | null>(null);
  const cloudEnabled = isCloudModeEnabled();
  const [loading, setLoading] = useState(
    () => isCloudModeEnabled() && !!getSupabaseBrowserClient()
  );

  const getAdapter = useCallback(
    (resolvedUser: User | null) => {
      if (cloudEnabled && resolvedUser) {
        const supabase = getSupabaseBrowserClient()!;
        return {
          adapter: createSupabaseAdapter(supabase, resolvedUser.id),
          mode: "cloud" as const,
        };
      }
      return { adapter: localAdapter, mode: "local" as const };
    },
    [cloudEnabled]
  );

  const [adapterState, setAdapterState] = useState<{
    adapter: typeof localAdapter | ReturnType<typeof createSupabaseAdapter>;
    mode: AdapterMode;
  }>(() => getAdapter(null));

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!cloudEnabled || !supabase) {
      return;
    }

    // Resolve initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const resolvedUser = data.session?.user ?? null;
      setUser(resolvedUser);
      setAdapterState(getAdapter(resolvedUser));
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const resolvedUser = session?.user ?? null;
      setUser(resolvedUser);
      setAdapterState(getAdapter(resolvedUser));
    });

    return () => subscription.unsubscribe();
  }, [cloudEnabled, getAdapter]);

  return {
    ...adapterState,
    user,
    loading,
  };
}
