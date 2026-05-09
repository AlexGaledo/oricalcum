"use client";

import { useEffect, useState } from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { TrashIcon, CloseIcon } from "@/shared/components/icons";
import type { OriNode } from "@/shared/types";

const fmtTime = (ts?: number) => {
  if (!ts) return "—";
  return new Date(ts).toISOString().slice(0, 16).replace("T", " ");
};

export function EditorPanel() {
  const openDocId = useCanvasStore((s) => s.openDocId);
  const setOpenDocId = useCanvasStore((s) => s.setOpenDocId);
  const node = useNodeStore((s) => s.nodes.find((n) => n.id === openDocId) ?? null);
  const updateNode = useNodeStore((s) => s.updateNode);
  const removeNode = useNodeStore((s) => s.removeNode);
  const removeEdgesForNode = useEdgeStore((s) => s.removeEdgesForNode);

  // Hold last node so panel can close-animate without flashing empty
  const [snapshot, setSnapshot] = useState<OriNode | null>(node);
  useEffect(() => {
    if (node) setSnapshot(node);
  }, [node]);
  const display = node ?? snapshot;
  const open = !!node;

  const handleDelete = () => {
    if (!openDocId) return;
    removeNode(openDocId);
    removeEdgesForNode(openDocId);
    setOpenDocId(null);
  };

  const charCount = display ? (display.body || "").length : 0;

  return (
    <aside className={`docpanel${open ? " is-open" : ""}`}>
      {display && (
        <>
          <div className="docpanel-head">
            <div className="docpanel-tag">
              <span className="dot" />
              NODE · {display.id}
            </div>
            <div className="docpanel-actions">
              <button
                type="button"
                className="docpanel-btn"
                title="Delete"
                onClick={handleDelete}
              >
                <TrashIcon />
              </button>
              <button
                type="button"
                className="docpanel-btn"
                title="Close"
                onClick={() => setOpenDocId(null)}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="docpanel-body">
            <textarea
              className="docpanel-title"
              rows={2}
              value={display.title || ""}
              placeholder="untitled"
              onChange={(e) =>
                openDocId && updateNode(openDocId, { title: e.target.value })
              }
            />
            <div className="docpanel-meta">
              <span>
                <span className="k">SHAPE</span>
                <span className="v">{display.shape}</span>
              </span>
              <span>
                <span className="k">CREATED</span>
                <span className="v">{fmtTime(display.createdAt)}</span>
              </span>
              <span>
                <span className="k">EDITED</span>
                <span className="v">{fmtTime(display.updatedAt)}</span>
              </span>
            </div>
            <textarea
              className="body"
              value={display.body || ""}
              placeholder="markdown / notes / spec / scratch ..."
              onChange={(e) =>
                openDocId && updateNode(openDocId, { body: e.target.value })
              }
            />
          </div>
          <div className="docpanel-foot">
            <span className="doc-shape-tag">{display.shape}</span>
            <span style={{ marginLeft: "auto" }}>{charCount} chars · autosaved</span>
          </div>
        </>
      )}
    </aside>
  );
}
