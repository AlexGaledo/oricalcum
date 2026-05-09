"use client";

import { create } from "zustand";
import { SHAPE_BY_ID, SHAPE_TITLES } from "@/shared/constants/shapes";
import { uid } from "@/shared/lib/uid";
import type { OriNode, ShapeId } from "@/shared/types";

interface NodeStore {
  nodes: OriNode[];
  selectedId: string | null;
  hoverConnectTargetId: string | null;
  createNode: (shape: ShapeId, cx: number, cy: number, scale: number) => string;
  moveNode: (id: string, x: number, y: number) => void;
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
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  updateNode: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    })),
  setSelected: (id) => set({ selectedId: id }),
  setHoverConnectTarget: (id) => set({ hoverConnectTargetId: id }),
  clear: () => set({ nodes: [], selectedId: null }),
}));
