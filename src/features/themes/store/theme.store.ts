"use client";

import { create } from "zustand";
import { TWEAK_DEFAULTS, type TweakState } from "@/config/theme.config";

interface ThemeStore extends TweakState {
  setTweak: <K extends keyof TweakState>(key: K, value: TweakState[K]) => void;
  setTweaks: (patch: Partial<TweakState>) => void;
  setTheme: (color: string, name: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  ...(TWEAK_DEFAULTS as TweakState),
  setTweak: (key, value) => set({ [key]: value } as Partial<TweakState>),
  setTweaks: (patch) => set(patch),
  setTheme: (color, name) => set({ accent: color, themeName: name }),
}));
