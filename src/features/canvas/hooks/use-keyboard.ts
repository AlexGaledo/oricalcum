"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (inField) return;

      const cs = useCanvasStore.getState();
      const ns = useNodeStore.getState();
      const es = useEdgeStore.getState();

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
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
