"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { hexToRgb } from "@/shared/lib/hex-to-rgb";
import { FONT_PRESETS } from "@/config/theme.config";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const accent = useThemeStore((s) => s.accent);
  const glow = useThemeStore((s) => s.glow);
  const fontMode = useThemeStore((s) => s.fontMode);

  useEffect(() => {
    const [r, g, b] = hexToRgb(accent);
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
  }, [accent]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--glow-strength",
      String(glow / 50),
    );
  }, [glow]);

  useEffect(() => {
    const preset = FONT_PRESETS.find((p) => p.value === fontMode) ?? FONT_PRESETS[0];
    const root = document.documentElement;
    root.style.setProperty("--node-font", preset.cssVar);
    root.style.setProperty("--app-font", preset.cssVar);
  }, [fontMode]);

  return <>{children}</>;
}
