"use client";

import { useEffect, useRef, useState } from "react";
import { useSnapshotsStore } from "../store/snapshots.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useThemeStore } from "@/features/themes/store/theme.store";

const fmtTime = (ts: number) =>
  ts ? new Date(ts).toISOString().slice(0, 16).replace("T", " ") : "—";

export function SnapshotsPanel() {
  const activeId = useWorkspacesStore((s) => s.activeId);
  const hideAll = useThemeStore((s) => s.hideAllUi);
  const items = useSnapshotsStore((s) => s.items);
  const loading = useSnapshotsStore((s) => s.loading);
  const refresh = useSnapshotsStore((s) => s.refresh);
  const capture = useSnapshotsStore((s) => s.capture);
  const restore = useSnapshotsStore((s) => s.restore);
  const remove = useSnapshotsStore((s) => s.remove);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && activeId) refresh(activeId);
  }, [open, activeId, refresh]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (hideAll || !activeId) return null;

  const handleCapture = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await capture(activeId, `snapshot ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await restore(activeId, id);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="snapshots-root" ref={rootRef}>
      <button
        type="button"
        className="iconbtn-pill"
        data-active={open ? "1" : "0"}
        onClick={() => setOpen((v) => !v)}
        title="Snapshots / history"
      >
        <span className="lbl">history</span>
      </button>

      {open && (
        <div className="snapshots-flyout" onClick={(e) => e.stopPropagation()}>
          <div className="snapshots-head">
            <span className="snapshots-label">// snapshots</span>
            <button
              type="button"
              className="snapshots-capture-btn"
              onClick={handleCapture}
              disabled={busy}
            >
              + capture
            </button>
          </div>

          <div className="snapshots-list">
            {loading && <div className="snapshots-empty">loading…</div>}
            {!loading && items.length === 0 && (
              <div className="snapshots-empty">no snapshots yet</div>
            )}
            {items.map((s) => (
              <div key={s.id} className="snapshots-item">
                <div className="snapshots-item-meta">
                  <span className="snapshots-item-name">{s.name || "untitled"}</span>
                  <span className="snapshots-item-time">{fmtTime(s.createdAt)}</span>
                </div>
                <div className="snapshots-item-actions">
                  <button
                    type="button"
                    className="snapshots-action"
                    onClick={() => handleRestore(s.id)}
                    disabled={busy}
                  >
                    restore
                  </button>
                  <button
                    type="button"
                    className="snapshots-action snapshots-action-danger"
                    onClick={() => remove(activeId, s.id)}
                    disabled={busy}
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
