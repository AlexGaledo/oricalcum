"use client";

import { create } from "zustand";
import type { Camera } from "@/shared/types";

/**
 * Skill-tree focus mode: clicking a node dives the camera into it, direct
 * neighbors stay lit, everything else dims. Hopping between nodes builds a
 * breadcrumb trail; exiting restores the camera from before the first dive.
 */
interface FocusStore {
  focusedId: string | null;
  /** Camera before the first dive — restored on exit. */
  returnCamera: Camera | null;
  /** Hop history, oldest → current (current is always the last entry). */
  trail: string[];
  enter: (id: string, returnCamera: Camera) => void;
  /** Move focus to another node. Revisiting a trail node truncates the trail back to it. */
  hop: (id: string) => void;
  exit: () => void;
}

export const useFocusStore = create<FocusStore>((set) => ({
  focusedId: null,
  returnCamera: null,
  trail: [],
  enter: (id, returnCamera) => set({ focusedId: id, returnCamera, trail: [id] }),
  hop: (id) =>
    set((s) => {
      const i = s.trail.indexOf(id);
      const trail = i >= 0 ? s.trail.slice(0, i + 1) : [...s.trail, id];
      return { focusedId: id, trail };
    }),
  exit: () => set({ focusedId: null, returnCamera: null, trail: [] }),
}));
