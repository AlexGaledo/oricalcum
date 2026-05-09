"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { ThemePicker } from "@/features/themes/components/theme-picker";
import { APP } from "@/config/app.config";

export function Topbar() {
  const themeOpen = useCanvasStore((s) => s.themeOpen);
  const setThemeOpen = useCanvasStore((s) => s.setThemeOpen);
  const themeName = useThemeStore((s) => s.themeName);

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M3 1 L9 1 L11 6 L9 11 L3 11 L1 6 Z"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="6" r="1.4" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-name">{APP.name}</div>
          <div className="brand-meta">{APP.version}</div>
        </div>
        <div className="topbar-right">
          <button
            type="button"
            className="iconbtn-pill"
            data-active={themeOpen ? "1" : "0"}
            onClick={() => setThemeOpen((s) => !s)}
            title="Theme"
          >
            <span className="swatch" />
            <span className="lbl">{themeName}</span>
          </button>
        </div>
      </div>
      {themeOpen && (
        <div style={{ position: "fixed", top: 56, right: 24, zIndex: 50 }}>
          <ThemePicker onClose={() => setThemeOpen(false)} />
        </div>
      )}
    </>
  );
}
