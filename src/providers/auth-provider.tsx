"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/data/api/endpoints/api-client";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useFilesStore } from "@/features/files/store/files.store";

/** Wipe every per-user cached store so one user never sees another's data. */
function clearUserCaches() {
  useWorkspacesStore.getState().clearAll();
  useFilesStore.getState().reset();
}

const isPublicRoute = (path: string) =>
  path === "/login" || path === "/auth/callback" || path.startsWith("/share/");

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        apiClient.setAuthToken(session.access_token);
        // Bind cache to this user; wipes it if the browser held another user's.
        useWorkspacesStore.getState().syncUser(session.user.id);
      } else if (!isPublicRoute(pathname)) {
        router.replace("/login");
      }
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        apiClient.setAuthToken(session.access_token);
        useWorkspacesStore.getState().syncUser(session.user.id);
      } else {
        apiClient.clearAuthToken();
        clearUserCaches();
        if (!isPublicRoute(pathname)) {
          router.replace("/login");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // block protected pages until session check completes — prevents content flash
  if (!ready && !isPublicRoute(pathname)) return null;

  return <>{children}</>;
}
