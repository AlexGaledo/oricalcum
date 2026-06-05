"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth return target. The supabase-js client (detectSessionInUrl) parses the
 * session out of the URL on load; we wait for it, then route to the dashboard.
 * Errors (cancelled consent, provider failure) come back as ?error= and bounce
 * to /login with a message.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error_description") ?? params.get("error");
    if (err) {
      router.replace(`/login?error=${encodeURIComponent(err)}`);
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      router.replace("/dashboard");
    };

    // Session may already be parsed, or arrive via the auth event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish();
    });

    // Safety net: if no session resolves, return to login rather than hang.
    const timeout = setTimeout(() => {
      if (!done) router.replace("/login?error=Sign-in%20did%20not%20complete");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="loading-screen">
      <div className="loading-screen-inner">
        <div className="loading-screen-spinner" />
      </div>
    </div>
  );
}
