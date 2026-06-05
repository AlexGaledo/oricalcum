"use client";

import { create } from "zustand";

/**
 * Open/close state for the hub's mobile navigation drawer (the ws-sidebar
 * rendered as a slide-in panel on phones). The hamburger in the breadcrumb bar
 * toggles it; the scrim and route changes close it.
 */
interface MobileNavStore {
  hubNavOpen: boolean;
  openHubNav: () => void;
  closeHubNav: () => void;
  toggleHubNav: () => void;
}

export const useMobileNavStore = create<MobileNavStore>((set) => ({
  hubNavOpen: false,
  openHubNav: () => set({ hubNavOpen: true }),
  closeHubNav: () => set({ hubNavOpen: false }),
  toggleHubNav: () => set((s) => ({ hubNavOpen: !s.hubNavOpen })),
}));
