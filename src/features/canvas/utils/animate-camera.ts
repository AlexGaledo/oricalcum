"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import type { Camera } from "@/shared/types";

let raf = 0;

export function cancelCameraAnimation() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

/** Glide the canvas camera to `target`. Aborts if the user grabs the canvas. */
export function animateCameraTo(target: Camera, ms = 450) {
  cancelCameraAnimation();
  const store = useCanvasStore.getState();
  const start = { ...store.camera };
  const t0 = performance.now();

  const step = (now: number) => {
    // A drag gesture mid-flight means the user took over — yield immediately.
    if (useCanvasStore.getState().drag) {
      raf = 0;
      return;
    }
    const p = Math.min(1, (now - t0) / ms);
    const k = easeInOutCubic(p);
    useCanvasStore.getState().setCamera({
      x: start.x + (target.x - start.x) * k,
      y: start.y + (target.y - start.y) * k,
      zoom: start.zoom + (target.zoom - start.zoom) * k,
    });
    raf = p < 1 ? requestAnimationFrame(step) : 0;
  };
  raf = requestAnimationFrame(step);
}

/** Camera that centers a node in the viewport at the focus zoom level. */
export function cameraForNode(
  n: { x: number; y: number; w: number; h: number },
  vp: { w: number; h: number },
  zoom = 1.6,
): Camera {
  return {
    x: vp.w / 2 - (n.x + n.w / 2) * zoom,
    y: vp.h / 2 - (n.y + n.h / 2) * zoom,
    zoom,
  };
}
