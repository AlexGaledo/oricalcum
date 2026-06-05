"use client";

import { useCanvasStore } from "../store/canvas.store";

/**
 * Subtle, non-blocking background-sync indicator. A small pulsing dot shown while
 * the active nodespace's graph is being revalidated against the backend. Never
 * gates the canvas — the (cached) graph stays interactive underneath.
 */
export function SyncPulse() {
  const syncing = useCanvasStore((s) => s.syncing);
  if (!syncing) return null;
  return <div className="sync-pulse" aria-hidden="true" />;
}
