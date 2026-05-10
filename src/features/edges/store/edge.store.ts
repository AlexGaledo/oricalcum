"use client";

import { create } from "zustand";
import { uid } from "@/shared/lib/uid";
import type { OriEdge, PortSide } from "@/shared/types";

interface EdgeStore {
  edges: OriEdge[];
  addEdge: (from: string, to: string, fromPort: PortSide, toPort: PortSide) => void;
  removeEdge: (id: string) => void;
  removeEdgesForNode: (nodeId: string) => void;
  clear: () => void;
}

export const useEdgeStore = create<EdgeStore>((set) => ({
  edges: [],
  addEdge: (from, to, fromPort, toPort) => set((s) => {
    if (from === to) return s;
    const exists = s.edges.some((e) => e.from === from && e.to === to);
    if (exists) return s;
    return { edges: [...s.edges, { id: uid("e"), from, to, fromPort, toPort }] };
  }),
  removeEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),
  removeEdgesForNode: (nodeId) => set((s) => ({ edges: s.edges.filter((e) => e.from !== nodeId && e.to !== nodeId) })),
  clear: () => set({ edges: [] }),
}));
