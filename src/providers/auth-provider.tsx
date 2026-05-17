"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/data/api/endpoints/api-client";

const isPublicRoute = (path: string) =>
  path === "/login" || path.startsWith("/share/");

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        apiClient.setAuthToken(session.access_token);
      } else if (!isPublicRoute(pathname)) {
        router.replace("/login");
      }
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        apiClient.setAuthToken(session.access_token);
      } else {
        apiClient.clearAuthToken();
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
