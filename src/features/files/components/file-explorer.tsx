"use client";

import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useFilesStore } from "../store/files.store";
import { ACCENT_SWATCHES } from "@/config/theme.config";
import { FileTreeItem } from "./file-tree-item";
import { exportActiveNodespace, importNodespaceFromFile } from "../utils/nodespace-io";

export function FileExplorer() {
  const router = useRouter();
  const navGuard = useRef(false);
  const [transitioning, setTransitioning] = useState(false);
  const open = useCanvasStore((s) => s.fileTreeOpen);
  const hideAll = useThemeStore((s) => s.hideAllUi);
  const tree = useFilesStore((s) => s.tree);
  const createFile = useFilesStore((s) => s.createFile);
  const createFolder = useFilesStore((s) => s.createFolder);
  const move = useFilesStore((s) => s.move);
  const activeFileId = useFilesStore((s) => s.activeFileId);
  const [rootDrop, setRootDrop] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (file) void importNodespaceFromFile(file);
  };
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

  const handleBackToHub = () => {
    if (navGuard.current) return;
    navGuard.current = true;
    setTransitioning(true);
    saveCurrentSnapshot();
    router.push(`/workspace/${activeId}`);
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
        <span>// Nodespaces</span>
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
          <button
            type="button"
            onClick={exportActiveNodespace}
            disabled={!activeFileId}
            title="Export nodespace as JSON"
            aria-label="Export nodespace"
          >
            ⭳
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            title="Import nodespace from JSON"
            aria-label="Import nodespace"
          >
            ⭱
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportPick}
            style={{ display: "none" }}
          />
        </div>
      </div>
      <div
        className="file-explorer-body"
        data-drop={rootDrop ? "1" : "0"}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (!rootDrop) setRootDrop(true);
        }}
        onDragLeave={(e) => {
          // Ignore leaves into child rows; only clear when leaving the body itself.
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setRootDrop(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setRootDrop(false);
          const draggedId = e.dataTransfer.getData("text/plain");
          if (draggedId) move(draggedId, null);
        }}
      >
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
          onClick={handleBackToHub}
        >
          <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
          Back to workspace hub
        </button>
      </div>
    </div>
    </>
  );
}

function ToolsSection() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const setFileTreeOpen = useCanvasStore((s) => s.setFileTreeOpen);

  const handleCalendarClick = () => {
    setFileTreeOpen(false);
    router.push(`/workspace/${activeId}/calendar`);
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
