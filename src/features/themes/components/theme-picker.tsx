"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "../store/theme.store";
import { THEME_PRESETS } from "@/config/theme.config";

interface ThemePickerProps {
  onClose: () => void;
}

export function ThemePicker({ onClose }: ThemePickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const accent = useThemeStore((s) => s.accent);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [onClose]);

  const isCustom = !THEME_PRESETS.some(
    (p) => p.color.toLowerCase() === accent.toLowerCase(),
  );

  return (
    <div className="theme-popover" ref={ref}>
      <div className="theme-section-label">// presets</div>
      <div className="theme-presets">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="theme-preset"
            data-active={
              !isCustom && p.color.toLowerCase() === accent.toLowerCase() ? "1" : "0"
            }
            onClick={() => setTheme(p.color, p.name)}
          >
            <span className="dot" style={{ background: p.color, color: p.color }} />
            <span className="name">{p.name}</span>
          </button>
        ))}
      </div>
      <div className="theme-section-label">// custom</div>
      <div className="theme-custom">
        <input
          type="color"
          value={accent}
          onChange={(e) => setTheme(e.target.value, "Custom")}
        />
        <input
          type="text"
          value={accent.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{6}$/.test(v)) setTheme(v, "Custom");
            else if (/^#[0-9a-fA-F]{3}$/.test(v)) {
              const [r, g, b] = v.slice(1).split("");
              setTheme(`#${r}${r}${g}${g}${b}${b}`, "Custom");
            }
          }}
        />
      </div>
    </div>
  );
}
