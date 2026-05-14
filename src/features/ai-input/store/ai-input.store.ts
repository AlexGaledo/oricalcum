"use client";

import { create } from "zustand";
import type { AiInputState } from "../types/ai-input.types";

interface AiInputStore extends AiInputState {
  setInput: (val: string) => void;
  setProcessing: (val: boolean) => void;
  pushHistory: (entry: string) => void;
  cycleHistory: (dir: "up" | "down") => string | null;
  clearInput: () => void;
}

export const useAiInputStore = create<AiInputStore>((set, get) => ({
  input: "",
  isProcessing: false,
  history: [],
  historyIndex: -1,
  setInput: (val) => set({ input: val }),
  setProcessing: (val) => set({ isProcessing: val }),
  pushHistory: (entry) =>
    set((s) => ({
      history: [entry, ...s.history].slice(0, 50),
      historyIndex: -1,
    })),
  cycleHistory: (dir) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return null;
    const next =
      dir === "up"
        ? Math.min(historyIndex + 1, history.length - 1)
        : Math.max(historyIndex - 1, -1);
    set({ historyIndex: next });
    return next === -1 ? "" : history[next];
  },
  clearInput: () => set({ input: "", historyIndex: -1 }),
}));
