"use client";

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent } from "react";
import { useFilesStore } from "../store/files.store";
import type { FsNode } from "../types/files.types";

interface Props {
  node: FsNode;
  depth: number;
}

export function FileTreeItem({ node, depth }: Props) {
  const tree = useFilesStore((s) => s.tree);
  const activeFileId = useFilesStore((s) => s.activeFileId);
  const setActiveFile = useFilesStore((s) => s.setActiveFile);
  const toggleFolder = useFilesStore((s) => s.toggleFolder);
  const remove = useFilesStore((s) => s.remove);
  const rename = useFilesStore((s) => s.rename);
  const move = useFilesStore((s) => s.move);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.name);
  const [dropTarget, setDropTarget] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(node.name);
    setEditing(true);
  };
  const commit = () => {
    const v = draft.trim();
    if (v && v !== node.name) rename(node.id, v);
    setEditing(false);
  };
  const cancel = () => setEditing(false);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
  };

  const onRowClick = () => {
    if (editing) return;
    if (node.kind === "folder") toggleFolder(node.id);
    else setActiveFile(node.id);
  };

  const onDelete = (e: MouseEvent) => {
    e.stopPropagation();
    remove(node.id);
  };

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const isFolder = node.kind === "folder";
  // Folders adopt the dragged item; files place it as a sibling (into their parent).
  const dropParentId = isFolder ? node.id : node.parentId;

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    // Only folders get the highlight (they're the visible "container" target).
    if (isFolder && !dropTarget) setDropTarget(true);
  };

  const onDragLeave = () => {
    if (dropTarget) setDropTarget(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== node.id) move(draggedId, dropParentId);
  };

  const isActive = node.kind === "file" && activeFileId === node.id;
  const children =
    node.kind === "folder" && node.expanded
      ? tree.filter((n) => n.parentId === node.id)
      : [];

  return (
    <>
      <div
        className="fs-row"
        data-active={isActive ? "1" : "0"}
        data-drop={dropTarget ? "1" : "0"}
        style={{ paddingLeft: 8 + depth * 14 }}
        draggable={!editing}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onRowClick}
        onDoubleClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
      >
        <span className="chev">
          {node.kind === "folder" ? (node.expanded ? "▾" : "▸") : ""}
        </span>
        <span className="glyph">{node.kind === "folder" ? "▣" : "▢"}</span>
        {editing ? (
          <input
            ref={inputRef}
            className="rename-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKey}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="name">{node.name}</span>
        )}
        <button type="button" className="del" onClick={onDelete} aria-label="Delete">
          ✕
        </button>
      </div>
      {children.map((c) => (
        <FileTreeItem key={c.id} node={c} depth={depth + 1} />
      ))}
    </>
  );
}
