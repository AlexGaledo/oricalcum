"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { ZoomInIcon, ZoomOutIcon, FitIcon } from "@/shared/components/icons";
import { clamp } from "@/shared/lib/clamp";
import { APP } from "@/config/app.config";

const fmt = (n: number) =>
  (n >= 0 ? "+" : "") + n.toFixed(1).padStart(6, "0");

export function StatusBar() {
  const camera = useCanvasStore((s) => s.camera);
  const setCamera = useCanvasStore((s) => s.setCamera);
  const mouse = useCanvasStore((s) => s.mouse);
  const nodes = useNodeStore((s) => s.nodes);
  const edges = useEdgeStore((s) => s.edges);

  const zoomBy = (dir: number) => {
    setCamera((c) => {
      const newZoom = clamp(c.zoom + 0.1 * dir, APP.zoom.min, APP.zoom.max);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = w / 2;
      const my = h / 2;
      const real = newZoom / c.zoom;
      return { x: mx - real * (mx - c.x), y: my - real * (my - c.y), zoom: newZoom };
    });
  };

  const fit = () => {
    if (!nodes.length) {
      setCamera({ x: 0, y: 0, zoom: 1 });
      return;
    }
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.w));
    const maxY = Math.max(...nodes.map((n) => n.y + n.h));
    const pad = APP.fitPad;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const zoom = clamp(Math.min(vw / w, vh / h), APP.zoom.min, 2);
    setCamera({
      x: vw / 2 - (minX + (maxX - minX) / 2) * zoom,
      y: vh / 2 - (minY + (maxY - minY) / 2) * zoom,
      zoom,
    });
  };

  return (
    <div className="statusbar">
      <div className="status-chip">
        <span className="k">CUR</span>
        <span className="v">
          {fmt(mouse.x)}, {fmt(mouse.y)}
        </span>
      </div>
      <div className="status-chip">
        <span className="k">Σ</span>
        <span className="v">
          {nodes.length.toString().padStart(2, "0")}n ·{" "}
          {edges.length.toString().padStart(2, "0")}e
        </span>
      </div>
      <div className="status-chip">
        <button onClick={() => zoomBy(-1)} title="Zoom out">
          <ZoomOutIcon />
        </button>
        <span className="v" style={{ minWidth: 38, textAlign: "center" }}>
          {Math.round(camera.zoom * 100)}%
        </span>
        <button onClick={() => zoomBy(1)} title="Zoom in">
          <ZoomInIcon />
        </button>
        <button onClick={fit} title="Reset view">
          <FitIcon />
        </button>
      </div>
    </div>
  );
}
