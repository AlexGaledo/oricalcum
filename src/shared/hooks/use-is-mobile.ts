"use client";

import { useEffect, useState } from "react";

/**
 * True when the viewport is at/below `breakpoint` px. SSR-safe: returns false
 * on the server and the first client render, then syncs on mount to avoid a
 * hydration mismatch. Default 767px = the phone breakpoint (tablets ≥768 keep
 * the desktop layout per the responsive plan).
 */
export function useIsMobile(breakpoint = 767): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [breakpoint]);

  return isMobile;
}
