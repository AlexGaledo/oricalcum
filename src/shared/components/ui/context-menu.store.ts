"use client";

import { create } from "zustand";
import type { ContextMenuItem, ContextMenuState } from "@/shared/types";

interface ContextMenuStore {
  menu: ContextMenuState | null;
  open: (x: number, y: number, items: ContextMenuItem[]) => void;
  close: () => void;
}

export const useContextMenuStore = create<ContextMenuStore>((set) => ({
  menu: null,
  open: (x, y, items) => set({ menu: { x, y, items } }),
  close: () => set({ menu: null }),
}));
