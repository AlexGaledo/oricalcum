"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/shared/components/icons/logo";
import { NeuralOrbLazy } from "@/features/canvas/components/neural-orb.lazy";

/**
 * Cinematic entry: the orb assembles from scattered particles, logo and
 * tagline fade in, then the camera pushes into the core and routes onward.
 * A click anywhere skips straight to the destination.
 */
export default function Home() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);
  const destRef = useRef<string | null>(null);
  const cinematicDoneRef = useRef(false);
  const navigatedRef = useRef(false);

  const tryNavigate = () => {
    if (navigatedRef.current || !destRef.current || !cinematicDoneRef.current) return;
    navigatedRef.current = true;
    setFadeOut(true);
    const dest = destRef.current;
    window.setTimeout(() => router.push(dest), 320);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      destRef.current = session ? "/dashboard" : "/login";
      tryNavigate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishCinematic = () => {
    cinematicDoneRef.current = true;
    tryNavigate();
  };

  return (
    <main
      className={`splash splash-cinematic ${fadeOut ? "fade-out" : ""}`}
      onClick={finishCinematic}
      role="presentation"
    >
      <NeuralOrbLazy accent="#10A37F" glow={70} cinematic onCinematicDone={finishCinematic} />
      <div className="splash-inner">
        <div className="splash-logo" aria-hidden="true">
          <Logo />
        </div>
        <h1 className="splash-title">Oricalcum</h1>
        <p className="splash-motto">An Oracle for work, teams, and hobbies.</p>
        <p className="splash-skip">click to enter</p>
      </div>
    </main>
  );
}
