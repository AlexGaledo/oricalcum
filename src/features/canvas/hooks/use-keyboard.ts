"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useFocusStore } from "@/features/canvas/store/focus.store";
import { animateCameraTo, cameraForNode } from "@/features/canvas/utils/animate-camera";
import type { OriNode } from "@/shared/types";

const ARROW_DIRS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

/** Of the focused node's neighbors, pick the best match for an arrow direction:
 *  within ~70° of the arrow, preferring alignment, then proximity. */
function neighborInDirection(
  focused: OriNode,
  neighbors: OriNode[],
  dir: { x: number; y: number },
): OriNode | null {
  const fx = focused.x + focused.w / 2;
  const fy = focused.y + focused.h / 2;
  let best: OriNode | null = null;
  let bestScore = -Infinity;
  for (const n of neighbors) {
    const dx = n.x + n.w / 2 - fx;
    const dy = n.y + n.h / 2 - fy;
    const dist = Math.hypot(dx, dy) || 1;
    const cos = (dx * dir.x + dy * dir.y) / dist;
    if (cos < 0.35) continue; // outside the directional cone
    const score = cos * 2 - dist / 2000;
    if (score > bestScore) {
      bestScore = score;
      best = n;
    }
  }
  return best;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;
      if (inField) return;

      const cs = useCanvasStore.getState();
      if (cs.openDocId) return;
      const ns = useNodeStore.getState();
      const es = useEdgeStore.getState();
      const fs = useFocusStore.getState();

      // Focus-mode: arrows traverse edges like a skill tree.
      if (fs.focusedId && ARROW_DIRS[e.key]) {
        const focused = ns.nodes.find((n) => n.id === fs.focusedId);
        if (focused) {
          const neighborIds = new Set(
            es.edges
              .filter((ed) => ed.from === fs.focusedId || ed.to === fs.focusedId)
              .map((ed) => (ed.from === fs.focusedId ? ed.to : ed.from)),
          );
          const target = neighborInDirection(
            focused,
            ns.nodes.filter((n) => neighborIds.has(n.id)),
            ARROW_DIRS[e.key],
          );
          if (target) {
            fs.hop(target.id);
            ns.setSelected(target.id);
            animateCameraTo(cameraForNode(target, cs.viewport));
          }
        }
        e.preventDefault();
        return;
      }

      if (e.key === "v" || e.key === "V") cs.setTool("select");
      else if (e.key === "n" || e.key === "N")
        cs.setShapeMenuOpen((s) => !s);
      else if (e.key === "c" || e.key === "C")
        cs.setTool((t) => (t === "connect" ? "select" : "connect"));
      else if (e.key === "d" || e.key === "D")
        cs.setTool((t) => (t === "delete" ? "select" : "delete"));
      else if (e.key === "t" || e.key === "T")
        cs.setTweaksOpen((s) => !s);
      else if (e.key === "Escape") {
        // Focus dive exits first: restore the pre-dive camera, keep other UI.
        if (fs.focusedId) {
          const back = fs.returnCamera;
          fs.exit();
          if (back) animateCameraTo(back);
          return;
        }
        cs.setTool("select");
        cs.setShapeMenuOpen(false);
        cs.setThemeOpen(false);
        cs.setTweaksOpen(false);
        cs.setOpenDocId(null);
        cs.setDrag(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const id = ns.selectedId;
        if (id) {
          ns.removeNode(id);
          es.removeEdgesForNode(id);
          if (cs.openDocId === id) cs.setOpenDocId(null);
          return;
        }
        if (es.selectedEdgeId) {
          es.removeEdge(es.selectedEdgeId);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
