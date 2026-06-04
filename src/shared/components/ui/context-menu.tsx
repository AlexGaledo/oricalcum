"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useContextMenuStore } from "./context-menu.store";
import type { ContextMenuItem } from "@/shared/types";

const MENU_W = 200;
const EDGE_PAD = 8;

/** Single globally-mounted context menu. Reads target/items from the store. */
export function ContextMenu() {
  const menu = useContextMenuStore((s) => s.menu);
  const close = useContextMenuStore((s) => s.close);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      const root = document.getElementById("ctx-menu-root");
      if (root && !root.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();
    // defer so the opening contextmenu/mousedown doesn't immediately close it
    const t = setTimeout(() => {
      window.addEventListener("mousedown", onDown);
      window.addEventListener("keydown", onKey);
      window.addEventListener("wheel", onScroll, { passive: true });
    }, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onScroll);
    };
  }, [menu, close]);

  if (!mounted || !menu) return null;

  return createPortal(
    <div id="ctx-menu-root">
      <MenuPanel x={menu.x} y={menu.y} items={menu.items} onClose={close} />
    </div>,
    document.body,
  );
}

function MenuPanel({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [subPos, setSubPos] = useState({ x: 0, y: 0 });

  // clamp into viewport after measuring
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth || MENU_W;
    const h = el.offsetHeight;
    let nx = x;
    let ny = y;
    if (nx + w > window.innerWidth - EDGE_PAD) nx = window.innerWidth - w - EDGE_PAD;
    if (ny + h > window.innerHeight - EDGE_PAD) ny = window.innerHeight - h - EDGE_PAD;
    setPos({ x: Math.max(EDGE_PAD, nx), y: Math.max(EDGE_PAD, ny) });
  }, [x, y, items]);

  return (
    <div
      ref={ref}
      className="ctx-menu"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item) => {
        if (item.kind === "separator") {
          return <div key={item.id} className="ctx-sep" />;
        }
        if (item.kind === "custom") {
          return (
            <div key={item.id} className="ctx-custom">
              {item.render}
            </div>
          );
        }
        if (item.kind === "submenu") {
          return (
            <div
              key={item.id}
              className="ctx-item ctx-has-sub"
              data-open={openSub === item.id ? "1" : "0"}
              onMouseEnter={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setSubPos({ x: r.right - 4, y: r.top - 6 });
                setOpenSub(item.id);
              }}
            >
              <ItemBody icon={item.icon} label={item.label} />
              <span className="ctx-chevron">›</span>
              {openSub === item.id && (
                <MenuPanel
                  x={subPos.x}
                  y={subPos.y}
                  items={item.items}
                  onClose={onClose}
                />
              )}
            </div>
          );
        }
        if (item.kind === "checkbox") {
          return (
            <button
              key={item.id}
              type="button"
              className="ctx-item"
              onMouseEnter={() => setOpenSub(null)}
              onClick={() => {
                item.onSelect();
                onClose();
              }}
            >
              <span className="ctx-check" data-on={item.checked ? "1" : "0"}>
                {item.checked ? "✓" : ""}
              </span>
              <span className="ctx-label">{item.label}</span>
            </button>
          );
        }
        // action
        return (
          <button
            key={item.id}
            type="button"
            className="ctx-item"
            data-danger={item.danger ? "1" : "0"}
            disabled={item.disabled}
            onMouseEnter={() => setOpenSub(null)}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            <ItemBody icon={item.icon} label={item.label} />
          </button>
        );
      })}
    </div>
  );
}

function ItemBody({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <>
      {icon ? <span className="ctx-icon">{icon}</span> : <span className="ctx-icon" />}
      <span className="ctx-label">{label}</span>
    </>
  );
}
