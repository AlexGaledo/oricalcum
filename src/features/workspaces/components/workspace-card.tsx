"use client";

import { useEffect, useRef, useState } from "react";
import { fetchNodes } from "@/data/api/endpoints/nodes.api";
import { fetchEdges } from "@/data/api/endpoints/edges.api";
import { fetchProject } from "@/data/api/endpoints/projects.api";
import { prefetchCache } from "@/shared/lib/prefetch-cache";
import type { WorkspaceRecord } from "../types/workspaces.types";

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface Props {
  workspace: WorkspaceRecord;
  onClick: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

export function WorkspaceCard({ workspace, onClick, onDelete, onRename }: Props) {
  const [dropOpen, setDropOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(workspace.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHoverStart = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (prefetchCache.has(workspace.id)) return;
    hoverTimer.current = setTimeout(() => {
      Promise.all([
        fetchNodes(workspace.id),
        fetchEdges(workspace.id),
        fetchProject(workspace.id),
      ])
        .then(([nodes, edges, project]) => {
          prefetchCache.set(workspace.id, {
            nodes: nodes as Record<string, unknown>[],
            edges: edges as Record<string, unknown>[],
            project: project as Record<string, unknown>,
          });
        })
        .catch(() => {
          /* prefetch failure is non-critical */
        });
    }, 300);
  };

  const handleHoverEnd = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  const commitRename = () => {
    const trimmed = nameVal.trim();
    if (trimmed) onRename(trimmed);
    else setNameVal(workspace.name);
    setRenaming(false);
  };

  return (
    <div className="ws-card" onClick={renaming ? undefined : onClick} onMouseEnter={handleHoverStart} onMouseLeave={handleHoverEnd}>
      <div className="ws-card-accent" style={{ background: workspace.accentColor }} />
      <div className="ws-card-body">
        <span className="hud-tag ws-card-tag" aria-hidden="true">
          WS&nbsp;//&nbsp;{workspace.id.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase()}
        </span>
        {renaming ? (
          <input
            ref={inputRef}
            className="ws-card-rename"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setNameVal(workspace.name); setRenaming(false); }
              e.stopPropagation();
            }}
            onBlur={commitRename}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="ws-card-name">{workspace.name}</div>
        )}
        <div className="ws-card-desc">{workspace.description || <span style={{ opacity: 0.35 }}>No description</span>}</div>
        <div className="ws-card-meta">
          <span>
            <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="5" r="2.5" />
              <path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" />
            </svg>
            {workspace.userCount}
          </span>
          <span>
            <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="12" height="12" rx="2" />
              <path d="M4 5h6M4 7h4" />
            </svg>
            {workspace.nodeCount}
          </span>
          <span style={{ marginLeft: "auto" }}>{relativeTime(workspace.updatedAt)}</span>
        </div>
      </div>

      <button
        type="button"
        className="ws-card-more"
        title="More options"
        onClick={(e) => { e.stopPropagation(); setDropOpen((v) => !v); }}
      >
        ···
      </button>

      {dropOpen && (
        <div ref={dropRef} className="ws-card-drop" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setDropOpen(false); setRenaming(true); }}
          >
            Rename
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => { setDropOpen(false); onDelete(); }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
