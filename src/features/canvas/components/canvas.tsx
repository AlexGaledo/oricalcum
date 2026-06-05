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
import { ShapeGlyph } from "@/features/nodes/components/node-shapes";
import { EdgeBezier } from "@/features/edges/components/edge-bezier";
import { useContextMenuStore } from "@/shared/components/ui/context-menu.store";
import { SHAPES } from "@/shared/constants/shapes";
import { ACCENT_SWATCHES } from "@/config/theme.config";
import {
  PlusIcon,
  TrashIcon,
  SlidersIcon,
  ExpandIcon,
  FitIcon,
} from "@/shared/components/icons";
import { freePath } from "@/features/edges/utils/edge-path";
import { getPortPosition, getNearestPort } from "@/features/nodes/utils/port-positions";
import { EmptyState } from "@/features/toolbar/components/empty-state";
import { useKeyboardShortcuts } from "../hooks/use-keyboard";
import { useViewportTracking } from "../hooks/use-viewport";
import { clamp } from "@/shared/lib/clamp";
import { cn } from "@/shared/lib/cn";
import { APP } from "@/config/app.config";
import type { PortSide } from "@/shared/types";

export function Canvas({ readOnly = false }: { readOnly?: boolean }) {
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
  const resizeNode = useNodeStore((s) => s.resizeNode);
  const removeNode = useNodeStore((s) => s.removeNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const duplicateNode = useNodeStore((s) => s.duplicateNode);
  const hoverConnectTargetId = useNodeStore((s) => s.hoverConnectTargetId);
  const setHoverConnectTarget = useNodeStore((s) => s.setHoverConnectTarget);

  const edges = useEdgeStore((s) => s.edges);
  const addEdge = useEdgeStore((s) => s.addEdge);
  const removeEdge = useEdgeStore((s) => s.removeEdge);
  const removeEdgesForNode = useEdgeStore((s) => s.removeEdgesForNode);
  const selectedEdgeId = useEdgeStore((s) => s.selectedEdgeId);
  const setSelectedEdge = useEdgeStore((s) => s.setSelectedEdge);

  const setOpenDocId = useCanvasStore((s) => s.setOpenDocId);
  const openDocId = useCanvasStore((s) => s.openDocId);

  const openMenu = useContextMenuStore((s) => s.open);

  const bgMode = useThemeStore((s) => s.bgMode);
  const nodeScale = useThemeStore((s) => s.nodeScale);
  const connectionsAnimated = useThemeStore((s) => s.connectionsAnimated);
  const connectionStyle = useThemeStore((s) => s.connectionStyle);
  const connectionSpeed = useThemeStore((s) => s.connectionSpeed);
  const nodeFloating = useThemeStore((s) => s.nodeFloating);
  const nodePulsing = useThemeStore((s) => s.nodePulsing);

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

  // Wheel: zoom in/out toward mouse pointer
  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const r = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      setCamera((c) => {
        const factor = Math.exp(-e.deltaY * 0.005);
        const newZoom = clamp(c.zoom * factor, APP.zoom.min, APP.zoom.max);
        const real = newZoom / c.zoom;
        return {
          x: mx - real * (mx - c.x),
          y: my - real * (my - c.y),
          zoom: newZoom,
        };
      });
    },
    [setCamera],
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Touch gestures: one-finger pan, two-finger pinch-zoom. Drives the same
  // camera as mouse/wheel, so it works in view-only (mobile) and desktop touch
  // alike. Single-finger pans only when the gesture starts on the background,
  // leaving taps on nodes/UI to their own handlers. Camera is read from the
  // store at gesture start to avoid stale-closure jitter.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let mode: "none" | "pan" | "pinch" = "none";
    let sx = 0, sy = 0, camX = 0, camY = 0;
    let startDist = 0, startZoom = 1, midX = 0, midY = 0, baseX = 0, baseY = 0;

    const isBackground = (t: EventTarget | null) => {
      const node = t as HTMLElement | null;
      return node === el || !!node?.classList?.contains("canvas-bg");
    };

    const onStart = (e: TouchEvent) => {
      const cam = useCanvasStore.getState().camera;
      if (e.touches.length === 1) {
        if (!isBackground(e.target)) return;
        mode = "pan";
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
        camX = cam.x;
        camY = cam.y;
      } else if (e.touches.length === 2) {
        mode = "pinch";
        const [a, b] = [e.touches[0], e.touches[1]];
        startDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
        const r = el.getBoundingClientRect();
        midX = (a.clientX + b.clientX) / 2 - r.left;
        midY = (a.clientY + b.clientY) / 2 - r.top;
        startZoom = cam.zoom;
        baseX = cam.x;
        baseY = cam.y;
      }
    };

    const onMove = (e: TouchEvent) => {
      if (mode === "pan" && e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - sx;
        const dy = e.touches[0].clientY - sy;
        setCamera((c) => ({ x: camX + dx, y: camY + dy, zoom: c.zoom }));
      } else if (mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const newZoom = clamp(
          startZoom * (dist / startDist),
          APP.zoom.min,
          APP.zoom.max,
        );
        const real = newZoom / startZoom;
        setCamera(() => ({
          x: midX - real * (midX - baseX),
          y: midY - real * (midY - baseY),
          zoom: newZoom,
        }));
      }
    };

    const onEnd = (e: TouchEvent) => {
      mode = e.touches.length === 0 ? "none" : mode === "pinch" ? "none" : mode;
    };

    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [setCamera]);

  // Canvas mousedown
  const onCanvasDown = (e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget && !target.classList?.contains("canvas-bg")) return;
    if (tool === "select") {
      setSelected(null);
      setSelectedEdge(null);
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
    if (readOnly) return;
    if (tool === "delete") {
      removeNode(nodeId);
      removeEdgesForNode(nodeId);
      if (openDocId === nodeId) setOpenDocId(null);
      return;
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (tool === "connect") {
      const cp = screenToCanvas(e.clientX, e.clientY);
      const side = getNearestPort(node, cp.x, cp.y);
      const pos = getPortPosition(node, side);
      setDrag({
        kind: "connect",
        from: nodeId,
        fromPort: side,
        x: pos.x,
        y: pos.y,
      });
      return;
    }
    setSelected(nodeId);
    setSelectedEdge(null);
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
    if (readOnly) return;
    setOpenDocId(nodeId);
    setSelected(nodeId);
  };

  const onNodeResizeDown = (e: ReactMouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (readOnly || tool !== "select") return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelected(nodeId);
    setDrag({
      kind: "resize",
      id: nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origW: node.w,
      origH: node.h,
    });
  };

  const onPortDown = (e: ReactMouseEvent, nodeId: string, side: PortSide) => {
    e.stopPropagation();
    e.preventDefault();
    if (readOnly) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setTool("connect");
    const pos = getPortPosition(node, side);
    setDrag({
      kind: "connect",
      from: nodeId,
      fromPort: side,
      x: pos.x,
      y: pos.y,
    });
  };

  // ── Context menus ────────────────────────────────────────────────
  const onNodeContextMenu = (e: ReactMouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (readOnly) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelected(nodeId);
    setSelectedEdge(null);
    const curFloat = node.floating ?? nodeFloating;
    const curPulse = node.pulsing ?? nodePulsing;
    openMenu(e.clientX, e.clientY, [
      {
        kind: "action",
        id: "edit",
        label: "Edit content",
        icon: <ExpandIcon />,
        onSelect: () => {
          setOpenDocId(nodeId);
          setSelected(nodeId);
        },
      },
      {
        kind: "action",
        id: "duplicate",
        label: "Duplicate",
        icon: <PlusIcon />,
        onSelect: () => duplicateNode(nodeId),
      },
      {
        kind: "submenu",
        id: "customize",
        label: "Customize",
        icon: <SlidersIcon />,
        items: [
          { kind: "custom", id: "color", render: <NodeColorRow nodeId={nodeId} /> },
          { kind: "custom", id: "opacity", render: <NodeOpacityRow nodeId={nodeId} /> },
          {
            kind: "submenu",
            id: "shape",
            label: "Shape",
            items: SHAPES.map((s) => ({
              kind: "action" as const,
              id: s.id,
              label: s.label,
              icon: <ShapeGlyph id={s.id} />,
              onSelect: () => updateNode(nodeId, { shape: s.id }),
            })),
          },
          { kind: "separator", id: "sep-anim" },
          {
            kind: "checkbox",
            id: "floating",
            label: "Floating",
            checked: curFloat,
            onSelect: () => updateNode(nodeId, { floating: !curFloat }),
          },
          {
            kind: "checkbox",
            id: "pulsing",
            label: "Pulsing",
            checked: curPulse,
            onSelect: () => updateNode(nodeId, { pulsing: !curPulse }),
          },
        ],
      },
      { kind: "separator", id: "sep" },
      {
        kind: "action",
        id: "delete",
        label: "Delete node",
        icon: <TrashIcon />,
        danger: true,
        onSelect: () => {
          removeNode(nodeId);
          removeEdgesForNode(nodeId);
          if (openDocId === nodeId) setOpenDocId(null);
        },
      },
    ]);
  };

  const onEdgeContextMenu = (e: ReactMouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (readOnly) return;
    setSelectedEdge(edgeId);
    setSelected(null);
    openMenu(e.clientX, e.clientY, [
      {
        kind: "action",
        id: "delete",
        label: "Delete connection",
        icon: <TrashIcon />,
        danger: true,
        onSelect: () => removeEdge(edgeId),
      },
    ]);
  };

  const onCanvasContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const p = screenToCanvas(e.clientX, e.clientY);
    openMenu(e.clientX, e.clientY, [
      {
        kind: "submenu",
        id: "add",
        label: "Add node here",
        icon: <PlusIcon />,
        items: SHAPES.map((s) => ({
          kind: "action" as const,
          id: s.id,
          label: s.label,
          icon: <ShapeGlyph id={s.id} />,
          onSelect: () => createNode(s.id, p.x, p.y, scale),
        })),
      },
      { kind: "separator", id: "sep" },
      {
        kind: "action",
        id: "reset",
        label: "Reset view",
        icon: <FitIcon />,
        onSelect: () => setCamera({ x: 0, y: 0, zoom: 1 }),
      },
    ]);
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
      } else if (drag.kind === "resize") {
        const dw = (e.clientX - drag.startX) / camera.zoom;
        const dh = (e.clientY - drag.startY) / camera.zoom;
        const nextW = Math.max(40, Math.round(drag.origW + dw));
        const nextH = Math.max(28, Math.round(drag.origH + dh));
        resizeNode(drag.id, nextW, nextH);
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
        if (id && id !== drag.from) {
          const targetNode = useNodeStore.getState().nodes.find((n) => n.id === id);
          if (targetNode) {
            const cp = screenToCanvas(e.clientX, e.clientY);
            const toPort = getNearestPort(targetNode, cp.x, cp.y);
            addEdge(drag.from, id, drag.fromPort, toPort);
          }
        }
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
    resizeNode,
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
      onContextMenu={onCanvasContextMenu}
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
              isSelected={selectedEdgeId === edge.id}
              onClick={(e) => {
                e.stopPropagation();
                if (readOnly) return;
                if (tool === "delete") {
                  removeEdge(edge.id);
                  return;
                }
                setSelectedEdge(edge.id);
                setSelected(null);
              }}
              onContextMenu={(e) => onEdgeContextMenu(e, edge.id)}
            />
          );
        })}
        {drag?.kind === "connect" &&
          (() => {
            const a = nodeMap[drag.from];
            if (!a) return null;
            const sp = getPortPosition(a, drag.fromPort);
            const target = hoverConnectTargetId ? nodeMap[hoverConnectTargetId] : null;
            let tp: { x: number; y: number };
            let tpSide: PortSide | undefined;
            if (target) {
              tpSide = getNearestPort(target, drag.x, drag.y);
              tp = getPortPosition(target, tpSide);
            } else {
              tp = { x: drag.x, y: drag.y };
            }
            return <path className="edge-line is-temp" d={freePath(sp.x, sp.y, tp.x, tp.y, drag.fromPort, tpSide)} />;
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
            floating={n.floating ?? nodeFloating}
            pulsing={n.pulsing ?? nodePulsing}
            onPointerDown={(e) => onNodeDown(e, n.id)}
            onDoubleClick={(e) => onNodeDouble(e, n.id)}
            onContextMenu={(e) => onNodeContextMenu(e, n.id)}
            onPortDown={(e, side) => onPortDown(e, n.id, side)}
            onResizeDown={(e) => onNodeResizeDown(e, n.id)}
          />
        ))}
      </div>

      {nodes.length === 0 && !readOnly && <EmptyState onCreate={onCreateFirst} />}
    </div>
  );
}

// ── Context-menu custom rows ───────────────────────────────────────
function NodeColorRow({ nodeId }: { nodeId: string }) {
  const node = useNodeStore((s) => s.nodes.find((n) => n.id === nodeId));
  const updateNode = useNodeStore((s) => s.updateNode);
  const cur = node?.color?.toLowerCase();
  return (
    <div className="ctx-color-row">
      {ACCENT_SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          className="ctx-swatch"
          data-on={c.toLowerCase() === cur ? "1" : "0"}
          style={{ background: c }}
          aria-label={c}
          title={c}
          onClick={() => updateNode(nodeId, { color: c })}
        />
      ))}
    </div>
  );
}

function NodeOpacityRow({ nodeId }: { nodeId: string }) {
  const node = useNodeStore((s) => s.nodes.find((n) => n.id === nodeId));
  const updateNode = useNodeStore((s) => s.updateNode);
  const v = node?.opacity ?? 100;
  return (
    <div className="ctx-slider-row">
      <span className="ctx-slider-lbl">Opacity</span>
      <input
        type="range"
        min={20}
        max={100}
        step={5}
        value={v}
        onChange={(e) => updateNode(nodeId, { opacity: Number(e.target.value) })}
      />
      <span className="ctx-val">{v}</span>
    </div>
  );
}
