import type { ThemePreset } from "@/shared/types";

export const THEME_PRESETS: ThemePreset[] = [
  { id: "mono", name: "Mono", color: "#10A37F" },
  { id: "purple", name: "Oracle", color: "#8B5CF6" },
  { id: "cyan", name: "Cyber", color: "#06B6D4" },
  { id: "amber", name: "Solar", color: "#F59E0B" },
];

export const ACCENT_SWATCHES = [
  "#10A37F",
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#EF4444",
  "#FFFFFF",
];

export const TWEAK_DEFAULTS = {
  accent: "#10A37F",
  themeName: "Mono",
  bgMode: "grid",
  fontMode: "mono",
  connectionsAnimated: true,
  connectionStyle: "flow",
  connectionSpeed: 50,
  showMinimap: true,
  nodeScale: 100,
  glow: 60,
} as const;

export type TweakState = {
  accent: string;
  themeName: string;
  bgMode: "plain" | "grid" | "paper" | "collage";
  fontMode: "mono" | "inter";
  connectionsAnimated: boolean;
  connectionStyle: "flow" | "pulse" | "orbit";
  connectionSpeed: number;
  showMinimap: boolean;
  nodeScale: number;
  glow: number;
};
