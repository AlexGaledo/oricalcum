"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 1 L9 1 L11 6 L9 11 L3 11 L1 6 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="6" cy="6" r="1.4" fill="currentColor" />
          </svg>
        </div>
        <h1 className="splash-title">Oricalcum</h1>
        <p className="splash-motto">Visual systems canvas — nodes, edges, themes.</p>
        <div className="splash-spinner" aria-hidden="true"></div>
      </div>
    </main>
  );
}
