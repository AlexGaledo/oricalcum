"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/shared/components/icons/logo";

export default function Home() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startFade = window.setTimeout(() => setFadeOut(true), 600);
    const navigate = window.setTimeout(() => router.push("/dashboard"), 900);
    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(navigate);
    };
  }, [router]);

  return (
    <main className={`splash ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-inner">
        <div className="splash-logo" aria-hidden="true">
          <Logo />
        </div>
        <h1 className="splash-title">Oricalcum</h1>
        <p className="splash-motto">Visual systems canvas — nodes, edges, themes.</p>
        <div className="splash-spinner" aria-hidden="true"></div>
      </div>
    </main>
  );
}
