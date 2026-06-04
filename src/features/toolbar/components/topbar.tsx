"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { ThemePicker } from "@/features/themes/components/theme-picker";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { Breadcrumbs } from "@/features/navigation/components/breadcrumbs";
import { APP } from "@/config/app.config";

export function Topbar() {
  const router = useRouter();
  const navGuard = useRef(false);
  const [transitioning, setTransitioning] = useState(false);
  const themeOpen = useCanvasStore((s) => s.themeOpen);
  const setThemeOpen = useCanvasStore((s) => s.setThemeOpen);
  const fileTreeOpen = useCanvasStore((s) => s.fileTreeOpen);
  const setFileTreeOpen = useCanvasStore((s) => s.setFileTreeOpen);
  const themeName = useThemeStore((s) => s.themeName);
  const hideAll = useThemeStore((s) => s.hideAllUi);
  const saveCurrentSnapshot = useWorkspacesStore((s) => s.saveCurrentSnapshot);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const activeWorkspace = workspaces.find((w) => w.id === activeId);

  const handleLogoClick = () => {
    if (navGuard.current) return;
    navGuard.current = true;
    setTransitioning(true);
    saveCurrentSnapshot();
    router.push("/dashboard");
  };

  if (hideAll) return null;

  return (
    <>
      {transitioning && (
        <div className="dash-transition">
          <div className="loading-screen-spinner" />
        </div>
      )}
      <div className="topbar">
        <div className="brand">
          <button
            type="button"
            className="hamburger-btn"
            data-active={fileTreeOpen ? "1" : "0"}
            onClick={() => setFileTreeOpen((s) => !s)}
            aria-label="Toggle file explorer"
            title="Files"
          >
            <span /><span /><span />
          </button>
          <button
            type="button"
            className="brand-mark brand-mark-btn"
            onClick={handleLogoClick}
            title="Back to dashboard"
            aria-label="Back to dashboard"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M3 1 L9 1 L11 6 L9 11 L3 11 L1 6 Z"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="6" r="1.4" fill="currentColor" />
            </svg>
          </button>
          {activeId ? (
            <Breadcrumbs workspaceId={activeId} />
          ) : (
            <div className="brand-name">{APP.name}</div>
          )}
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
          <div className="brand-meta">{APP.version}</div>
        </div>
      </div>
      {themeOpen && (
        <div style={{ position: "fixed", top: 56, left: 24, zIndex: 50 }}>
          <ThemePicker onClose={() => setThemeOpen(false)} />
        </div>
      )}
    </>
  );
}
