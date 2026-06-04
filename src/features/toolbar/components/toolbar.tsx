"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useCanvasStore, type ToolbarSide } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { SHAPES } from "@/shared/constants/shapes";
import {
  CursorIcon,
  HexIcon,
  LinkIcon,
  TrashIcon,
  SlidersIcon,
  ShareIcon,
} from "@/shared/components/icons";
import { ShapeGlyph } from "@/features/nodes/components/node-shapes";
import { useContextMenuStore } from "@/shared/components/ui/context-menu.store";
import { fetchProject, patchProjectShare } from "@/data/api/endpoints/projects.api";
import type { ShapeId } from "@/shared/types";

const EDGE_SNAP = 80;

function nearEdgeSide(
  x: number,
  y: number,
  w: number,
  h: number,
): ToolbarSide | null {
  const candidates = [
    { s: "left" as const, v: x },
    { s: "right" as const, v: w - x },
    { s: "top" as const, v: y },
    { s: "bottom" as const, v: h - y },
  ];
  candidates.sort((a, b) => a.v - b.v);
  return candidates[0].v <= EDGE_SNAP ? candidates[0].s : null;
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
  const toolbarPos = useCanvasStore((s) => s.toolbarPos);
  const setToolbarPos = useCanvasStore((s) => s.setToolbarPos);
  const hasNodes = useNodeStore((s) => s.nodes.length > 0);
  const visible = useThemeStore((s) => s.showToolbar && !s.hideAllUi);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const openMenu = useContextMenuStore((s) => s.open);

  const onToolbarContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sides: ToolbarSide[] = ["left", "right", "top", "bottom"];
    openMenu(e.clientX, e.clientY, [
      ...sides.map((s) => ({
        kind: "checkbox" as const,
        id: `dock-${s}`,
        label: `Dock ${s}`,
        checked: !toolbarPos && toolbarSide === s,
        onSelect: () => {
          setToolbarSide(s);
          setToolbarPos(null);
        },
      })),
      { kind: "separator", id: "sep" },
      {
        kind: "action",
        id: "reset-pos",
        label: "Reset position",
        onSelect: () => setToolbarPos(null),
      },
    ]);
  };

  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const grabOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const rootRef = useRef<HTMLDivElement>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareOpen || !activeId) return;
    fetchProject(activeId)
      .then((p) => setIsPublic(!!(p as Record<string, unknown>).is_public))
      .catch(() => {});
  }, [shareOpen, activeId]);

  useEffect(() => {
    if (!shareOpen) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [shareOpen]);

  const handleShareToggle = async () => {
    if (!activeId || shareLoading) return;
    setShareLoading(true);
    try {
      await patchProjectShare(activeId, !isPublic);
      setIsPublic((v) => !v);
    } catch {
      // ignore
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeId) return;
    navigator.clipboard.writeText(`${window.location.origin}/share/${activeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onShapeDragStart = (e: MouseEvent, shapeId: ShapeId) => {
    e.preventDefault();
    setDrag({ kind: "spawn", shape: shapeId, x: e.clientX, y: e.clientY });
    setShapeMenuOpen(false);
  };

  const onGripDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = rootRef.current?.getBoundingClientRect();
    grabOffsetRef.current = rect
      ? { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
      : { dx: 0, dy: 0 };
    setGhost({ x: e.clientX - grabOffsetRef.current.dx, y: e.clientY - grabOffsetRef.current.dy });
  };

  useEffect(() => {
    if (!ghost) return;
    const onMove = (e: globalThis.MouseEvent) => {
      setGhost({
        x: e.clientX - grabOffsetRef.current.dx,
        y: e.clientY - grabOffsetRef.current.dy,
      });
    };
    const onUp = (e: globalThis.MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dropX = e.clientX - grabOffsetRef.current.dx;
      const dropY = e.clientY - grabOffsetRef.current.dy;
      const edge = nearEdgeSide(e.clientX, e.clientY, w, h);
      if (edge) {
        setToolbarSide(edge);
        setToolbarPos(null);
      } else {
        const rect = rootRef.current?.getBoundingClientRect();
        const tw = rect?.width ?? 200;
        const th = rect?.height ?? 40;
        const clampedX = Math.max(8, Math.min(w - tw - 8, dropX));
        const clampedY = Math.max(8, Math.min(h - th - 8, dropY));
        setToolbarPos({ x: clampedX, y: clampedY });
      }
      setGhost(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [ghost, setToolbarSide, setToolbarPos, toolbarSide]);

  const previewEdge = ghost
    ? nearEdgeSide(
        ghost.x + grabOffsetRef.current.dx,
        ghost.y + grabOffsetRef.current.dy,
        typeof window !== "undefined" ? window.innerWidth : 1280,
        typeof window !== "undefined" ? window.innerHeight : 720,
      )
    : null;
  const previewSide = previewEdge ?? toolbarSide;
  const useFreePos = !!toolbarPos && !ghost;
  const freeStyle =
    ghost
      ? {
          left: `${ghost.x}px`,
          top: `${ghost.y}px`,
          right: "auto" as const,
          bottom: "auto" as const,
          transform: "none" as const,
        }
      : useFreePos
        ? {
            left: `${toolbarPos!.x}px`,
            top: `${toolbarPos!.y}px`,
            right: "auto" as const,
            bottom: "auto" as const,
            transform: "none" as const,
          }
        : undefined;

  if (!visible) return null;

  return (
    <>
      <div
        ref={rootRef}
        className="toolbar"
        data-side={previewSide}
        data-dragging={ghost ? "1" : "0"}
        style={freeStyle}
        onContextMenu={onToolbarContextMenu}
      >
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
        <button
          type="button"
          className="tool-btn"
          data-active={isPublic ? "1" : "0"}
          onClick={() => setShareOpen((s) => !s)}
        >
          <ShareIcon />
          <span className="tool-tip">Share</span>
        </button>

        {shareOpen && (
          <div className="share-flyout" onClick={(e) => e.stopPropagation()}>
            <div className="share-flyout-label">// share.access</div>
            <div className="share-row">
              <span>Public link</span>
              <button
                className={`share-toggle${isPublic ? " on" : ""}`}
                onClick={handleShareToggle}
                disabled={shareLoading}
              >
                {isPublic ? "on" : "off"}
              </button>
            </div>
            {isPublic && (
              <button className="share-copy-btn" onClick={handleCopyLink}>
                {copied ? "// copied" : "// copy link"}
              </button>
            )}
          </div>
        )}

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
      {ghost && previewEdge && (
        <div className="toolbar-snap-hint" data-side={previewEdge} />
      )}
    </>
  );
}
