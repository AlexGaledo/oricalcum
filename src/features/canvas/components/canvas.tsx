"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { NodeCard } from "@/features/nodes/components/node-card";
import { EdgeBezier } from "@/features/edges/components/edge-bezier";
import { freePath } from "@/features/edges/utils/edge-path";
import { EmptyState } from "@/features/toolbar/components/empty-state";
import { useKeyboardShortcuts } from "../hooks/use-keyboard";
import { useViewportTracking } from "../hooks/use-viewport";
import { clamp } from "@/shared/lib/clamp";
import { cn } from "@/shared/lib/cn";
import { APP } from "@/config/app.config";

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const camera = useCanvasStore((s) => s.camera);
  const setCamera = useCanvasStore((s) => s.setCamera);
  const tool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);
  const drag = useCanvasStore((s) => s.drag);
  const setDrag = useCanvasStore((s) => s.setDrag);
  const setMouse = useCanvasStore((s) => s.setMouse);

  const nodes = useNodeStore((s) => s.nodes);
  const selectedId = useNodeStore((s) => s.selectedId);
  const setSelected = useNodeStore((s) => s.setSelected);
  const createNode = useNodeStore((s) => s.createNode);
  const moveNode = useNodeStore((s) => s.moveNode);
  const removeNode = useNodeStore((s) => s.removeNode);
  const hoverConnectTargetId = useNodeStore((s) => s.hoverConnectTargetId);
  const setHoverConnectTarget = useNodeStore((s) => s.setHoverConnectTarget);

  const edges = useEdgeStore((s) => s.edges);
  const addEdge = useEdgeStore((s) => s.addEdge);
  const removeEdge = useEdgeStore((s) => s.removeEdge);
  const removeEdgesForNode = useEdgeStore((s) => s.removeEdgesForNode);

  const setOpenDocId = useCanvasStore((s) => s.setOpenDocId);
  const openDocId = useCanvasStore((s) => s.openDocId);

  const bgMode = useThemeStore((s) => s.bgMode);
  const nodeScale = useThemeStore((s) => s.nodeScale);
  const connectionsAnimated = useThemeStore((s) => s.connectionsAnimated);
  const connectionStyle = useThemeStore((s) => s.connectionStyle);
  const connectionSpeed = useThemeStore((s) => s.connectionSpeed);

  useKeyboardShortcuts();
  useViewportTracking();

  const scale = nodeScale / 100;

  const screenToCanvas = useCallback(
    (sx: number, sy: number) => {
      const r = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
      return {
        x: (sx - r.left - camera.x) / camera.zoom,
        y: (sy - r.top - camera.y) / camera.zoom,
      };
    },
    [camera],
  );

  // Mouse coord readout
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right) return;
      setMouse(screenToCanvas(e.clientX, e.clientY));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [screenToCanvas, setMouse]);

  // Wheel: zoom (ctrl/meta) or pan
  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const r = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const my = e.clientY - r.top;
        setCamera((c) => {
          const factor = Math.exp(-e.deltaY * 0.01);
          const newZoom = clamp(c.zoom * factor, APP.zoom.min, APP.zoom.max);
          const real = newZoom / c.zoom;
          return {
            x: mx - real * (mx - c.x),
            y: my - real * (my - c.y),
            zoom: newZoom,
          };
        });
      } else {
        setCamera((c) => ({ ...c, x: c.x - e.deltaX, y: c.y - e.deltaY }));
      }
    },
    [setCamera],
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Canvas mousedown
  const onCanvasDown = (e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget && !target.classList?.contains("canvas-bg")) return;
    if (tool === "select") {
      setSelected(null);
      setDrag({
        kind: "pan",
        startX: e.clientX,
        startY: e.clientY,
        camX: camera.x,
        camY: camera.y,
      });
    }
  };

  const onNodeDown = (e: ReactMouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (tool === "delete") {
      removeNode(nodeId);
      removeEdgesForNode(nodeId);
      if (openDocId === nodeId) setOpenDocId(null);
      return;
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (tool === "connect") {
      setDrag({
        kind: "connect",
        from: nodeId,
        x: node.x + node.w,
        y: node.y + node.h / 2,
      });
      return;
    }
    setSelected(nodeId);
    setDrag({
      kind: "node",
      id: nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y,
    });
  };

  const onNodeDouble = (e: ReactMouseEvent, nodeId: string) => {
    e.stopPropagation();
    setOpenDocId(nodeId);
    setSelected(nodeId);
  };

  const onPortDown = (e: ReactMouseEvent, nodeId: string, side: "l" | "r") => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setTool("connect");
    setDrag({
      kind: "connect",
      from: nodeId,
      x: side === "r" ? node.x + node.w : node.x,
      y: node.y + node.h / 2,
    });
  };

  // Global drag handler
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      if (drag.kind === "pan") {
        setCamera((c) => ({
          ...c,
          x: drag.camX + (e.clientX - drag.startX),
          y: drag.camY + (e.clientY - drag.startY),
        }));
      } else if (drag.kind === "node") {
        const dx = (e.clientX - drag.startX) / camera.zoom;
        const dy = (e.clientY - drag.startY) / camera.zoom;
        moveNode(drag.id, Math.round(drag.origX + dx), Math.round(drag.origY + dy));
      } else if (drag.kind === "spawn") {
        setDrag((d) => (d?.kind === "spawn" ? { ...d, x: e.clientX, y: e.clientY } : d));
      } else if (drag.kind === "connect") {
        const p = screenToCanvas(e.clientX, e.clientY);
        setDrag((d) => (d?.kind === "connect" ? { ...d, x: p.x, y: p.y } : d));
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const nodeEl = (el as HTMLElement | null)?.closest?.(".node") as HTMLElement | null;
        const id = nodeEl?.dataset.id ?? null;
        setHoverConnectTarget(id && id !== drag.from ? id : null);
      }
    };
    const onUp = (e: MouseEvent) => {
      if (drag.kind === "spawn") {
        const r = canvasRef.current!.getBoundingClientRect();
        if (
          e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top && e.clientY <= r.bottom
        ) {
          const p = screenToCanvas(e.clientX, e.clientY);
          createNode(drag.shape, p.x, p.y, scale);
        }
      } else if (drag.kind === "connect") {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const nodeEl = (el as HTMLElement | null)?.closest?.(".node") as HTMLElement | null;
        const id = nodeEl?.dataset.id;
        if (id && id !== drag.from) addEdge(drag.from, id);
        setHoverConnectTarget(null);
        setTool("select");
      }
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    drag,
    camera.zoom,
    screenToCanvas,
    setCamera,
    setDrag,
    moveNode,
    createNode,
    addEdge,
    setHoverConnectTarget,
    setTool,
    scale,
  ]);

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  const gridSize = 32 * camera.zoom;
  const bgStyle: CSSProperties = {
    backgroundSize:
      bgMode === "grid"
        ? `${gridSize}px ${gridSize}px`
        : bgMode === "paper"
          ? `100% ${24 * camera.zoom}px`
          : bgMode === "collage"
            ? `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px, ${480 * camera.zoom}px ${480 * camera.zoom}px`
            : undefined,
    backgroundPosition: `${camera.x}px ${camera.y}px`,
  };

  const stageStyle: CSSProperties = {
    transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
  };

  const onCreateFirst = () => {
    const r = canvasRef.current!.getBoundingClientRect();
    const cx = (r.width / 2 - camera.x) / camera.zoom;
    const cy = (r.height / 2 - camera.y) / camera.zoom;
    createNode("hexagon", cx, cy, scale);
    useCanvasStore.getState().setShapeMenuOpen(true);
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "canvas",
        drag?.kind === "pan" && "is-panning",
        (tool === "connect" || drag?.kind === "connect") && "is-connect",
        tool === "delete" && "is-delete",
      )}
      onMouseDown={onCanvasDown}
    >
      <div className={`canvas-bg bg-${bgMode}`} style={bgStyle} />

      <svg className="edges-svg" style={stageStyle} width="1" height="1">
        {edges.map((edge) => {
          const a = nodeMap[edge.from];
          const b = nodeMap[edge.to];
          if (!a || !b) return null;
          return (
            <EdgeBezier
              key={edge.id}
              edge={edge}
              a={a}
              b={b}
              animated={connectionsAnimated}
              style={connectionStyle}
              speed={connectionSpeed}
              onClick={(e) => {
                e.stopPropagation();
                if (tool === "delete") removeEdge(edge.id);
              }}
            />
          );
        })}
        {drag?.kind === "connect" &&
          (() => {
            const a = nodeMap[drag.from];
            if (!a) return null;
            const ax = a.x + a.w;
            const ay = a.y + a.h / 2;
            const target = hoverConnectTargetId ? nodeMap[hoverConnectTargetId] : null;
            const bx = target ? target.x : drag.x;
            const by = target ? target.y + target.h / 2 : drag.y;
            return <path className="edge-line is-temp" d={freePath(ax, ay, bx, by)} />;
          })()}
      </svg>

      <div className="stage" style={stageStyle}>
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            node={n}
            isSelected={selectedId === n.id}
            isConnectSource={drag?.kind === "connect" && drag.from === n.id}
            isDragging={drag?.kind === "node" && drag.id === n.id}
            onPointerDown={(e) => onNodeDown(e, n.id)}
            onDoubleClick={(e) => onNodeDouble(e, n.id)}
            onPortDown={(e, side) => onPortDown(e, n.id, side)}
          />
        ))}
      </div>

      {nodes.length === 0 && <EmptyState onCreate={onCreateFirst} />}
    </div>
  );
}
