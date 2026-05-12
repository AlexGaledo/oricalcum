"use client";

import { useCallback, useEffect, useState } from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { TrashIcon, CloseIcon, ExpandIcon } from "@/shared/components/icons";
import type { OriNode } from "@/shared/types";
import type { Editor } from "@tiptap/react";
import { RichEditor } from "./rich-editor";
import { EditorToolbar } from "./editor-toolbar";

const fmtTime = (ts?: number) => {
  if (!ts) return "—";
  return new Date(ts).toISOString().slice(0, 16).replace("T", " ");
};

interface DocBodyProps {
  display: OriNode;
  openDocId: string | null;
  updateNode: (id: string, patch: Partial<OriNode>) => void;
  handleDelete: () => void;
  setOpenDocId: (id: string | null) => void;
  setDocExpanded: (b: boolean) => void;
  expanded: boolean;
}

function DocBody({
  display, openDocId, updateNode, handleDelete,
  setOpenDocId, setDocExpanded, expanded,
}: DocBodyProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleEditorReady = useCallback((e: Editor) => setEditor(e), []);
  const handleBodyChange = useCallback(
    (html: string) => {
      if (!openDocId) return;
      updateNode(openDocId, { body: html });
      setCharCount(editor?.getText().length ?? 0);
    },
    [openDocId, updateNode, editor],
  );

  useEffect(() => {
    if (editor) setCharCount(editor.getText().length);
  }, [editor]);

  return (
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
            title={expanded ? "Collapse to panel" : "Expand"}
            onClick={() => setDocExpanded(!expanded)}
          >
            <ExpandIcon />
          </button>
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
        <EditorToolbar editor={editor} />
        <RichEditor
          key={display.id}
          value={display.body || ""}
          onChange={handleBodyChange}
          onEditorReady={handleEditorReady}
        />
      </div>
      <div className="docpanel-foot">
        <span className="doc-shape-tag">{display.shape}</span>
        <span style={{ marginLeft: "auto" }}>{charCount} chars · autosaved</span>
      </div>
    </>
  );
}

export function EditorPanel() {
  const openDocId = useCanvasStore((s) => s.openDocId);
  const setOpenDocId = useCanvasStore((s) => s.setOpenDocId);
  const docExpanded = useCanvasStore((s) => s.docExpanded);
  const setDocExpanded = useCanvasStore((s) => s.setDocExpanded);
  const node = useNodeStore((s) => s.nodes.find((n) => n.id === openDocId) ?? null);
  const updateNode = useNodeStore((s) => s.updateNode);
  const removeNode = useNodeStore((s) => s.removeNode);
  const removeEdgesForNode = useEdgeStore((s) => s.removeEdgesForNode);

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

  const docBodyProps = display
    ? {
        display,
        openDocId,
        updateNode,
        handleDelete,
        setOpenDocId,
        setDocExpanded,
      }
    : null;

  return (
    <>
      <aside className={`docpanel${open && !docExpanded ? " is-open" : ""}`}>
        {docBodyProps && <DocBody {...docBodyProps} expanded={false} />}
      </aside>

      {open && docExpanded && docBodyProps && (
        <div className="doc-overlay">
          <div
            className="doc-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <DocBody {...docBodyProps} expanded={true} />
          </div>
        </div>
      )}
    </>
  );
}
