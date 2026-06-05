"use client";

import { useEffect } from "react";

interface CalendarContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  items: { label: string; onClick: () => void; danger?: boolean }[];
  onClose: () => void;
}

export function CalendarContextMenu({ x, y, visible, items, onClose }: CalendarContextMenuProps) {
  useEffect(() => {
    if (!visible) return;
    const handleClick = () => onClose();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const left = Math.min(x, typeof window !== "undefined" ? window.innerWidth - 160 : x);
  const top = Math.min(y, typeof window !== "undefined" ? window.innerHeight - 100 : y);

  return (
    <div
      className="calendar-context-menu"
      style={{ position: "fixed", left, top, zIndex: 100 }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          className={`calendar-context-menu-item${item.danger ? " is-danger" : ""}`}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
