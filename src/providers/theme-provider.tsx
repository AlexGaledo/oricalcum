"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { hexToRgb } from "@/shared/lib/hex-to-rgb";

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
    document.documentElement.style.setProperty(
      "--node-font",
      fontMode === "inter" ? "var(--font-ui)" : "var(--font-mono)",
    );
  }, [fontMode]);

  return <>{children}</>;
}
