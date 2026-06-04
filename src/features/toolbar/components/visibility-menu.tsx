"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { EyeIcon, EyeOffIcon } from "@/shared/components/icons";

export function VisibilityMenu() {
  const t = useThemeStore();
  const openDocId = useCanvasStore((s) => s.openDocId);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        popRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const allHidden = t.hideAllUi;

  return (
    <div className={`vis-group${openDocId ? " vis-group--shifted" : ""}`}>
      <button
        ref={btnRef}
        type="button"
        className="vis-btn"
        data-active={open ? "1" : "0"}
        onClick={() => setOpen((s) => !s)}
        aria-label="Visibility"
        title="Visibility"
      >
        {allHidden ? <EyeOffIcon /> : <EyeIcon />}
      </button>

      {open && (
        <div ref={popRef} className="vis-pop">
          <div className="vis-pop-hd">// visibility</div>
          <Row
            label="Coordinates"
            value={t.showStatusBar}
            disabled={allHidden}
            onChange={(v) => t.setTweak("showStatusBar", v)}
          />
          <Row
            label="Minimap"
            value={t.showMinimap}
            disabled={allHidden}
            onChange={(v) => t.setTweak("showMinimap", v)}
          />
          <Row
            label="Node toolbar"
            value={t.showToolbar}
            disabled={allHidden}
            onChange={(v) => t.setTweak("showToolbar", v)}
          />
          <div className="vis-pop-divider" />
          <Row
            label="Hide all UI"
            value={t.hideAllUi}
            onChange={(v) => t.setTweak("hideAllUi", v)}
          />
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="vis-row" data-disabled={disabled ? "1" : "0"}>
      <span>{label}</span>
      <button
        type="button"
        className="vis-toggle"
        data-on={value ? "1" : "0"}
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}
