"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useCalendarStore } from "@/features/calendar/store/calendar.store";
import { useFilesStore } from "../store/files.store";
import { ACCENT_SWATCHES } from "@/config/theme.config";
import { FileTreeItem } from "./file-tree-item";

export function FileExplorer() {
  const router = useRouter();
  const navGuard = useRef(false);
  const [transitioning, setTransitioning] = useState(false);
  const open = useCanvasStore((s) => s.fileTreeOpen);
  const hideAll = useThemeStore((s) => s.hideAllUi);
  const tree = useFilesStore((s) => s.tree);
  const createFile = useFilesStore((s) => s.createFile);
  const createFolder = useFilesStore((s) => s.createFolder);
  const saveCurrentSnapshot = useWorkspacesStore((s) => s.saveCurrentSnapshot);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const updateMeta = useWorkspacesStore((s) => s.updateMeta);
  const setFileTreeOpen = useCanvasStore((s) => s.setFileTreeOpen);
  const activeWorkspace = workspaces.find((w) => w.id === activeId);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen]);

  const roots = tree.filter((n) => n.parentId === null);

  const handleDashboard = () => {
    if (navGuard.current) return;
    navGuard.current = true;
    setTransitioning(true);
    saveCurrentSnapshot();
    router.push("/dashboard");
  };

  return (
    <>
      {transitioning && (
        <div className="dash-transition">
          <div className="loading-screen-spinner" />
        </div>
      )}
      <div
      className="file-explorer"
      data-open={open && !hideAll ? "1" : "0"}
      aria-hidden={!open || hideAll}
    >
      <div className="file-explorer-header">
        <span>// files</span>
        <div className="file-explorer-actions">
          <button
            type="button"
            onClick={() => createFile(null)}
            title="New file"
            aria-label="New file"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => createFolder(null)}
            title="New folder"
            aria-label="New folder"
          >
            ▣
          </button>
        </div>
      </div>
      <div className="file-explorer-body">
        {roots.map((n) => (
          <FileTreeItem key={n.id} node={n} depth={0} />
        ))}
      </div>
      <ToolsSection />
      <div className="file-explorer-footer">
        <div ref={settingsRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="fe-footer-btn"
            data-active={settingsOpen ? "1" : "0"}
            onClick={() => setSettingsOpen((v) => !v)}
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="2.5" />
              <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2M3.4 3.4l1.4 1.4M9.2 9.2l1.4 1.4M3.4 10.6l1.4-1.4M9.2 4.8l1.4-1.4" />
            </svg>
            Project Settings
          </button>
          {settingsOpen && activeWorkspace && (
            <div className="fe-settings-popup">
              <div className="fe-settings-popup-field">
                <label>Name</label>
                <input
                  type="text"
                  value={activeWorkspace.name}
                  onChange={(e) => updateMeta(activeWorkspace.id, { name: e.target.value })}
                />
              </div>
              <div className="fe-settings-popup-field">
                <label>Description</label>
                <input
                  type="text"
                  value={activeWorkspace.description}
                  onChange={(e) => updateMeta(activeWorkspace.id, { description: e.target.value })}
                />
              </div>
              <div className="fe-settings-popup-field">
                <label>Accent</label>
                <div className="fe-settings-popup-colors">
                  {ACCENT_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="fe-settings-popup-swatch"
                      style={{ background: c }}
                      data-active={activeWorkspace.accentColor === c ? "1" : "0"}
                      onClick={() => updateMeta(activeWorkspace.id, { accentColor: c })}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="fe-footer-btn"
          onClick={handleDashboard}
        >
          <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
          Go to Dashboard
        </button>
      </div>
    </div>
    </>
  );
}

function ToolsSection() {
  const [collapsed, setCollapsed] = useState(false);
  const openCalendar = useCalendarStore((s) => s.openCalendar);
  const fetchEvents = useCalendarStore((s) => s.fetchEvents);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const setFileTreeOpen = useCanvasStore((s) => s.setFileTreeOpen);

  const handleCalendarClick = () => {
    setFileTreeOpen(false);
    openCalendar();
    if (activeId) fetchEvents(activeId);
  };

  return (
    <div className="tools-section">
      <div
        className="tools-section-header"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="tools-section-chevron">{collapsed ? "▸" : "▾"}</span>
        <span>// tools</span>
      </div>
      {!collapsed && (
        <div className="tools-section-body">
          <div className="tools-item" onClick={handleCalendarClick}>
            <span className="tools-item-icon">📅</span>
            <span className="tools-item-label">Calendar</span>
          </div>
        </div>
      )}
    </div>
  );
}
