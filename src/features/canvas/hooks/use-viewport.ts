"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";

export function useViewportTracking() {
  const setViewport = useCanvasStore((s) => s.setViewport);
  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setViewport]);
}
