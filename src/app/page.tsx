"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/shared/components/icons/logo";

export default function Home() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startFade = window.setTimeout(() => setFadeOut(true), 600);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const destination = session ? "/dashboard" : "/login";
      const navigate = window.setTimeout(() => router.push(destination), 900);
      return () => window.clearTimeout(navigate);
    });

    return () => {
      window.clearTimeout(startFade);
    };
  }, [router]);

  return (
    <main className={`splash ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-inner">
        <div className="splash-logo" aria-hidden="true">
          <Logo />
        </div>
        <h1 className="splash-title">Oricalcum</h1>
        <p className="splash-motto">An Oracle for work, teams, and hobbies.</p>
        <div className="splash-spinner" aria-hidden="true"></div>
      </div>
    </main>
  );
}
