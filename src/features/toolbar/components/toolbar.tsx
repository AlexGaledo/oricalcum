"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useCanvasStore, type ToolbarSide } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { SHAPES } from "@/shared/constants/shapes";
import {
  CursorIcon,
  HexIcon,
  LinkIcon,
  TrashIcon,
  SlidersIcon,
} from "@/shared/components/icons";
import { ShapeGlyph } from "@/features/nodes/components/node-shapes";
import type { ShapeId } from "@/shared/types";

function nearestSide(x: number, y: number, w: number, h: number): ToolbarSide {
  const d = [
    { s: "left" as const, v: x },
    { s: "right" as const, v: w - x },
    { s: "top" as const, v: y },
    { s: "bottom" as const, v: h - y },
  ];
  d.sort((a, b) => a.v - b.v);
  return d[0].s;
}

export function Toolbar() {
  const tool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);
  const shapeMenuOpen = useCanvasStore((s) => s.shapeMenuOpen);
  const setShapeMenuOpen = useCanvasStore((s) => s.setShapeMenuOpen);
  const setDrag = useCanvasStore((s) => s.setDrag);
  const tweaksOpen = useCanvasStore((s) => s.tweaksOpen);
  const setTweaksOpen = useCanvasStore((s) => s.setTweaksOpen);
  const toolbarSide = useCanvasStore((s) => s.toolbarSide);
  const setToolbarSide = useCanvasStore((s) => s.setToolbarSide);
  const hasNodes = useNodeStore((s) => s.nodes.length > 0);

  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const onShapeDragStart = (e: MouseEvent, shapeId: ShapeId) => {
    e.preventDefault();
    setDrag({ kind: "spawn", shape: shapeId, x: e.clientX, y: e.clientY });
    setShapeMenuOpen(false);
  };

  const onGripDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGhost({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!ghost) return;
    const onMove = (e: globalThis.MouseEvent) => {
      setGhost({ x: e.clientX, y: e.clientY });
    };
    const onUp = (e: globalThis.MouseEvent) => {
      const side = nearestSide(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
      setToolbarSide(side);
      setGhost(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [ghost, setToolbarSide]);

  const previewSide = ghost
    ? nearestSide(ghost.x, ghost.y, typeof window !== "undefined" ? window.innerWidth : 1280, typeof window !== "undefined" ? window.innerHeight : 720)
    : toolbarSide;

  return (
    <>
      <div ref={rootRef} className="toolbar" data-side={previewSide}>
        <button
          type="button"
          className="tool-grip"
          onMouseDown={onGripDown}
          aria-label="Drag toolbar"
        >
          <span /><span /><span /><span /><span /><span />
        </button>
        <div className="tool-divider" />
        <button
          type="button"
          className="tool-btn"
          data-active={tool === "select" ? "1" : "0"}
          onClick={() => setTool("select")}
        >
          <CursorIcon />
          <span className="tool-tip">
            Select <kbd>V</kbd>
          </span>
        </button>
        <button
          type="button"
          className="tool-btn"
          data-active={shapeMenuOpen ? "1" : "0"}
          onClick={() => setShapeMenuOpen((s) => !s)}
        >
          <HexIcon />
          <span className="tool-tip">
            Nodes <kbd>N</kbd>
          </span>
        </button>
        <button
          type="button"
          className="tool-btn"
          data-active={tool === "connect" ? "1" : "0"}
          onClick={() => setTool(tool === "connect" ? "select" : "connect")}
          disabled={!hasNodes}
          style={{ opacity: hasNodes ? 1 : 0.4 }}
        >
          <LinkIcon />
          <span className="tool-tip">
            Connect <kbd>C</kbd>
          </span>
        </button>
        <div className="tool-divider" />
        <button
          type="button"
          className="tool-btn"
          data-active={tool === "delete" ? "1" : "0"}
          onClick={() => setTool(tool === "delete" ? "select" : "delete")}
        >
          <TrashIcon />
          <span className="tool-tip">
            Delete <kbd>D</kbd>
          </span>
        </button>
        <div className="tool-divider" />
        <button
          type="button"
          className="tool-btn"
          data-active={tweaksOpen ? "1" : "0"}
          onClick={() => setTweaksOpen((s) => !s)}
        >
          <SlidersIcon />
          <span className="tool-tip">
            Tweaks <kbd>T</kbd>
          </span>
        </button>

        {shapeMenuOpen && (
          <div className="shape-flyout" onClick={(e) => e.stopPropagation()}>
            <div className="shape-flyout-label">// node.kinds — drag onto canvas</div>
            {SHAPES.map((s) => (
              <div
                key={s.id}
                className="shape-pill"
                onMouseDown={(e) => onShapeDragStart(e, s.id)}
              >
                <ShapeGlyph id={s.id} />
                <span className="lbl">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {ghost && <div className="toolbar-snap-hint" data-side={previewSide} />}
    </>
  );
}
