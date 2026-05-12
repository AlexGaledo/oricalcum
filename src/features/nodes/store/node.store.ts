"use client";

import { create } from "zustand";
import { SHAPE_BY_ID, SHAPE_TITLES } from "@/shared/constants/shapes";
import { uid } from "@/shared/lib/uid";
import { measureTextWidth } from "@/shared/lib/measure-text";
import type { OriNode, ShapeId } from "@/shared/types";

const NODE_PADDING = 28;

interface NodeStore {
  nodes: OriNode[];
  selectedId: string | null;
  hoverConnectTargetId: string | null;
  createNode: (shape: ShapeId, cx: number, cy: number, scale: number) => string;
  moveNode: (id: string, x: number, y: number) => void;
  resizeNode: (id: string, w: number, h: number) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, patch: Partial<OriNode>) => void;
  setSelected: (id: string | null) => void;
  setHoverConnectTarget: (id: string | null) => void;
  clear: () => void;
}

export const useNodeStore = create<NodeStore>((set) => ({
  nodes: [],
  selectedId: null,
  hoverConnectTargetId: null,
  createNode: (shape, cx, cy, scale) => {
    const sh = SHAPE_BY_ID[shape] ?? SHAPE_BY_ID.rectangle;
    const w = Math.round(sh.w * scale);
    const h = Math.round(sh.h * scale);
    const id = uid("n");
    const now = Date.now();
    const node: OriNode = {
      id,
      x: Math.round(cx - w / 2),
      y: Math.round(cy - h / 2),
      w,
      h,
      baseW: w,
      baseH: h,
      shape,
      title: SHAPE_TITLES[shape] ?? "node",
      body: "",
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ nodes: [...s.nodes, node], selectedId: id }));
    return id;
  },
  moveNode: (id, x, y) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    })),
  resizeNode: (id, w, h) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, w, h, baseW: w, baseH: h, updatedAt: Date.now() }
          : n,
      ),
    })),
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  updateNode: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== id) return n;
        const merged = { ...n, ...patch, updatedAt: Date.now() };
        if ("title" in patch) {
          const textWidth = measureTextWidth(patch.title ?? "");
          merged.w = Math.max(n.baseW, Math.round(textWidth + NODE_PADDING));
        }
        return merged;
      }),
    })),
  setSelected: (id) => set({ selectedId: id }),
  setHoverConnectTarget: (id) => set({ hoverConnectTargetId: id }),
  clear: () => set({ nodes: [], selectedId: null }),
}));
