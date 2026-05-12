"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useThemeStore } from "@/features/themes/store/theme.store";

export function Minimap() {
  const showMinimap = useThemeStore((s) => s.showMinimap);
  const hideAll = useThemeStore((s) => s.hideAllUi);
  const setTweak = useThemeStore((s) => s.setTweak);
  const nodes = useNodeStore((s) => s.nodes);
  const camera = useCanvasStore((s) => s.camera);
  const viewport = useCanvasStore((s) => s.viewport);

  if (!showMinimap || hideAll) return null;

  const HideBtn = (
    <button
      type="button"
      className="minimap-hide"
      onClick={() => setTweak("showMinimap", false)}
      title="Hide minimap"
      aria-label="Hide minimap"
    >
      ✕
    </button>
  );

  if (!nodes.length) {
    return (
      <div className="minimap">
        <div className="minimap-label">// minimap</div>
        {HideBtn}
      </div>
    );
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const xs2 = nodes.map((n) => n.x + n.w);
  const ys2 = nodes.map((n) => n.y + n.h);
  const vpX = -camera.x / camera.zoom;
  const vpY = -camera.y / camera.zoom;
  const vpW = viewport.w / camera.zoom;
  const vpH = viewport.h / camera.zoom;
  const minX = Math.min(...xs, vpX) - 80;
  const minY = Math.min(...ys, vpY) - 80;
  const maxX = Math.max(...xs2, vpX + vpW) + 80;
  const maxY = Math.max(...ys2, vpY + vpH) + 80;
  const w = maxX - minX;
  const h = maxY - minY;

  return (
    <div className="minimap">
      <div className="minimap-label">// minimap</div>
      {HideBtn}
      <svg
        viewBox={`${minX} ${minY} ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {nodes.map((n) => (
          <rect
            key={n.id}
            className="minimap-node"
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx="6"
            ry="6"
          />
        ))}
        <rect className="minimap-vp" x={vpX} y={vpY} width={vpW} height={vpH} />
      </svg>
    </div>
  );
}
