"use client";

import { useCallback, useEffect, useState } from "react";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { TrashIcon, CloseIcon, ExpandIcon } from "@/shared/components/icons";
import type { OriNode, ShapeId } from "@/shared/types";
import { SHAPES } from "@/shared/constants/shapes";
import { ACCENT_SWATCHES } from "@/config/theme.config";
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

  const [styleOpen, setStyleOpen] = useState(false);

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
        <div className="docpanel-tweak-toggle">
          <button
            type="button"
            className="docpanel-tweak-trigger"
            onClick={() => setStyleOpen((v) => !v)}
          >
            <span>Node Style</span>
            <span className={`docpanel-chevron ${styleOpen ? "is-open" : ""}`}>
              ▸
            </span>
          </button>
          {styleOpen && (
            <div className="docpanel-tweak-body">
              <div className="docpanel-tweak-row">
                <span className="docpanel-tweak-label">Shape</span>
                <div className="docpanel-shape-picker">
                  {SHAPES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`docpanel-shape-btn ${display.shape === s.id ? "is-active" : ""}`}
                      onClick={() => openDocId && updateNode(openDocId, { shape: s.id })}
                      title={s.label}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="docpanel-tweak-row">
                <span className="docpanel-tweak-label">Color</span>
                <div className="docpanel-swatches">
                  <input
                    type="color"
                    className="docpanel-color-input"
                    value={display.color ?? "#10A37F"}
                    onChange={(e) =>
                      openDocId && updateNode(openDocId, { color: e.target.value })
                    }
                  />
                  {ACCENT_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="docpanel-swatch-btn"
                      style={{ background: c }}
                      onClick={() => openDocId && updateNode(openDocId, { color: c })}
                      title={c}
                    >
                      {c.toLowerCase() === (display.color ?? "").toLowerCase() && (
                        <svg viewBox="0 0 14 14" aria-hidden>
                          <path d="M3 7.2 5.8 10 11 4.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="docpanel-swatch-btn docpanel-swatch-reset"
                    onClick={() => openDocId && updateNode(openDocId, { color: undefined })}
                    title="Reset to theme accent"
                  >
                    ↺
                  </button>
                </div>
              </div>
              <div className="docpanel-tweak-row">
                <span className="docpanel-tweak-label">Opacity</span>
                <div className="docpanel-tweak-slider-wrap">
                  <input
                    type="range"
                    className="docpanel-tweak-slider"
                    min={10}
                    max={100}
                    step={5}
                    value={display.opacity ?? 100}
                    onChange={(e) =>
                      openDocId && updateNode(openDocId, { opacity: Number(e.target.value) })
                    }
                  />
                  <span className="docpanel-tweak-val">{display.opacity ?? 100}%</span>
                </div>
              </div>
            </div>
          )}
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
