"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { THEME_PRESETS, ACCENT_SWATCHES, FONT_PRESETS } from "@/config/theme.config";
import { isLightHex } from "@/shared/lib/hex-to-rgb";
import { TWEAKS_STYLE } from "../constants/tweaks-styles";

const PAD = 16;

export function TweaksPanel({
  title = "Tweaks",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const open = useCanvasStore((s) => s.tweaksOpen);
  const setOpen = useCanvasStore((s) => s.setTweaksOpen);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  const clampToViewport = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = `${offsetRef.current.x}px`;
    panel.style.bottom = `${offsetRef.current.y}px`;
  }, []);

  useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", clampToViewport);
      return () => window.removeEventListener("resize", clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  // Host postMessage protocol — listens but is a no-op fallback when host absent
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const t = (e.data as { type?: string } | null)?.type;
      if (t === "__activate_edit_mode") setOpen(true);
      else if (t === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent?.postMessage({ type: "__edit_mode_available" }, "*");
    } catch {
      // no-op
    }
    return () => window.removeEventListener("message", onMsg);
  }, [setOpen]);

  const onDragStart = (e: ReactMouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!open) return null;
  return (
    <>
      <style>{TWEAKS_STYLE}</style>
      <div
        ref={dragRef}
        className="twk-panel"
        style={{
          right: offsetRef.current.x,
          bottom: offsetRef.current.y,
        }}
      >
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button
            type="button"
            className="twk-x"
            aria-label="Close tweaks"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="twk-body">{children}</div>
      </div>
    </>
  );
}

export function TweakSection({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function Row({
  label,
  value,
  inline,
  children,
}: {
  label: string;
  value?: string | number;
  inline?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={inline ? "twk-row twk-row-h" : "twk-row"}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Row label={label} value={`${value}${unit}`}>
      <input
        type="range"
        className="twk-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Row>
  );
}

export function TweakToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="twk-toggle"
        data-on={value ? "1" : "0"}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

export function TweakRadio<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (v: T) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const n = options.length;

  const segAt = (clientX: number): T => {
    const r = trackRef.current!.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return options[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e: ReactMouseEvent) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev: PointerEvent) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <Row label={label}>
      <div
        ref={trackRef}
        role="radiogroup"
        onPointerDown={onPointerDown}
        className={dragging ? "twk-seg dragging" : "twk-seg"}
      >
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Row>
  );
}

export function TweakSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <Row label={label}>
      <select
        className="twk-field"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Row>
  );
}

export function TweakColor({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options?: string[];
  onChange: (v: string) => void;
}) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl">
          <span>{label}</span>
        </div>
        <input
          type="color"
          className="twk-swatch"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  const cur = value.toLowerCase();
  return (
    <Row label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((c) => {
          const on = c.toLowerCase() === cur;
          const chipStyle: CSSProperties = { background: c };
          return (
            <button
              key={c}
              type="button"
              className="twk-chip"
              role="radio"
              aria-checked={on}
              data-on={on ? "1" : "0"}
              aria-label={c}
              title={c}
              style={chipStyle}
              onClick={() => onChange(c)}
            >
              {on && (
                <svg viewBox="0 0 14 14" aria-hidden>
                  <path
                    d="M3 7.2 5.8 10 11 4.2"
                    fill="none"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke={isLightHex(c) ? "rgba(0,0,0,.78)" : "#fff"}
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </Row>
  );
}

// ── Composed panel for Oricalcum ───────────────────────────────────
export function OricalcumTweaks() {
  const t = useThemeStore();

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
        <TweakColor
          label="Accent"
          value={t.accent}
          options={ACCENT_SWATCHES}
          onChange={(v) => {
            const preset = THEME_PRESETS.find(
              (p) => p.color.toLowerCase() === v.toLowerCase(),
            );
            t.setTheme(v, preset ? preset.name : "Custom");
          }}
        />
      </TweakSection>
      <TweakSection label="Canvas">
        <TweakSelect
          label="Background"
          value={t.bgMode}
          options={[
            { value: "plain", label: "Plain" },
            { value: "grid", label: "Grid" },
            { value: "paper", label: "Paper" },
            { value: "collage", label: "Collage" },
          ]}
          onChange={(v) => t.setTweak("bgMode", v)}
        />
        <TweakSelect
          label="Font"
          value={t.fontMode}
          options={FONT_PRESETS.map((f) => ({ value: f.value, label: f.label }))}
          onChange={(v) => t.setTweak("fontMode", v)}
        />
        <TweakToggle
          label="Minimap"
          value={t.showMinimap}
          onChange={(v) => t.setTweak("showMinimap", v)}
        />
      </TweakSection>
      <TweakSection label="Nodes">
        <TweakSlider
          label="Size"
          value={t.nodeScale}
          min={70}
          max={140}
          step={5}
          unit="%"
          onChange={(v) => t.setTweak("nodeScale", v)}
        />
        <TweakSlider
          label="Glow"
          value={t.glow}
          min={0}
          max={120}
          step={5}
          onChange={(v) => t.setTweak("glow", v)}
        />
      </TweakSection>
      <TweakSection label="Connections">
        <TweakToggle
          label="Animated"
          value={t.connectionsAnimated}
          onChange={(v) => t.setTweak("connectionsAnimated", v)}
        />
        <TweakRadio
          label="Style"
          value={t.connectionStyle}
          options={[
            { value: "flow", label: "Flow" },
            { value: "pulse", label: "Pulse" },
            { value: "orbit", label: "Orbit" },
          ]}
          onChange={(v) => t.setTweak("connectionStyle", v)}
        />
        <TweakSlider
          label="Speed"
          value={t.connectionSpeed}
          min={20}
          max={100}
          step={5}
          onChange={(v) => t.setTweak("connectionSpeed", v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}
