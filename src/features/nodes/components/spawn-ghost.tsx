"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { SHAPE_BY_ID } from "@/shared/constants/shapes";

export function SpawnGhost() {
  const drag = useCanvasStore((s) => s.drag);
  const nodeScale = useThemeStore((s) => s.nodeScale);
  if (drag?.kind !== "spawn") return null;

  const sh = SHAPE_BY_ID[drag.shape];
  const scale = nodeScale / 100;
  const w = Math.round(sh.w * scale);
  const h = Math.round(sh.h * scale);

  return (
    <div
      className="ghost"
      style={{ left: drag.x - w / 2, top: drag.y - h / 2, width: w, height: h }}
    >
      {sh.label}
    </div>
  );
}
