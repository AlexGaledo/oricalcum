"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * The landing page's primary button. It reads the Supabase session once on
 * mount so a signed-in visitor goes straight to their dashboard while everyone
 * else lands on sign-in. Until the check resolves (or if Supabase is not
 * configured, e.g. a preview build without env vars) it behaves as signed out,
 * which is always a safe destination: /login bounces a live session onward.
 */
export function EnterCta({ className = "" }: { className?: string }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (!cancelled) setSignedIn(Boolean(session));
        })
        .catch(() => {});
    } catch {
      // Supabase env missing: stay signed out.
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href={signedIn ? "/dashboard" : "/login"}
      className={`lp-btn lp-btn--primary lp-corners ${className}`}
      data-testid="landing-enter"
    >
      {signedIn ? "Open your workspace" : "Enter Oricalcum"}
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}
