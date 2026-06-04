"use client";

import { create } from "zustand";

interface CommandPaletteStore {
  open: boolean;
  query: string;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
}

export const useCommandPaletteStore = create<CommandPaletteStore>((set) => ({
  open: false,
  query: "",
  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),
  setQuery: (query) => set({ query }),
}));
