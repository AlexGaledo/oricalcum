"use client";

import { useState, useCallback, type DragEvent } from "react";
import { useStorage } from "../hooks/use-storage";
import { StorageToolbar } from "./storage-toolbar";
import { FolderRow, FileRow } from "./file-row";
import { FilePreview } from "./file-preview";
import type { StorageFile } from "../types/storage.types";

interface Props {
  workspaceId: string;
}

/** Split the current prefix into clickable breadcrumb segments. */
function crumbsFromPrefix(prefix: string): { label: string; path: string }[] {
  const parts = prefix.split("/").filter(Boolean);
  const crumbs = [{ label: "Storage", path: "" }];
  let acc = "";
  for (const part of parts) {
    acc += `${part}/`;
    crumbs.push({ label: part, path: acc });
  }
  return crumbs;
}

export function StorageBrowser({ workspaceId }: Props) {
  const s = useStorage(workspaceId);
  const [preview, setPreview] = useState<StorageFile | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) s.upload(files);
    },
    [s],
  );

  const newFolder = () => {
    const name = window.prompt("New folder name");
    if (name) s.makeFolder(name);
  };

  const renameFile = (file: StorageFile) => {
    const next = window.prompt("New path (relative to workspace root)", file.path);
    if (next && next !== file.path) s.rename(file.path, next);
  };

  const renameFolder = (path: string, name: string) => {
    const next = window.prompt("New folder path (relative to workspace root)", path);
    if (!next) return;
    const normalized = next.endsWith("/") ? next : `${next}/`;
    if (normalized !== path) s.rename(path, normalized);
  };

  const isEmpty = !s.loading && s.folders.length === 0 && s.files.length === 0;

  return (
    <div className="hub-view">
      <div className="hub-eyebrow">// WORKSPACE_STORAGE</div>
      <header className="hub-hero">
        <h1 className="hub-hero-title">Storage</h1>
        <p className="hub-hero-desc">Files & folders for this workspace, backed by S3.</p>
      </header>

      <StorageToolbar onUpload={s.upload} onNewFolder={newFolder} onRefresh={s.refresh} />

      <nav className="storage-crumbs" aria-label="Folder path">
        {crumbsFromPrefix(s.prefix).map((c, i, arr) => (
          <span key={c.path} className="storage-crumb">
            <button
              type="button"
              className="storage-crumb-link"
              onClick={() => s.navigate(c.path)}
              disabled={i === arr.length - 1}
            >
              {c.label}
            </button>
            {i < arr.length - 1 && <span className="storage-crumb-sep">/</span>}
          </span>
        ))}
      </nav>

      {s.error && <div className="storage-error">{s.error}</div>}

      {s.uploads.length > 0 && (
        <div className="storage-uploads">
          {s.uploads.map((u) => (
            <div key={u.name} className="storage-upload" data-error={u.error ? "1" : "0"}>
              <span className="storage-upload-name">{u.name}</span>
              <span className="storage-upload-status">
                {u.error ? u.error : `${Math.round(u.fraction * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        className="storage-dropzone"
        data-dragover={dragOver ? "1" : "0"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {s.loading && <div className="storage-empty">Loading…</div>}
        {isEmpty && <div className="storage-empty">Empty folder — drop files here or use Upload.</div>}

        {!s.loading && (
          <div className="storage-list">
            {s.folders.map((f) => (
              <FolderRow
                key={f.path}
                folder={f}
                onOpen={() => s.navigate(f.path)}
                onRename={() => renameFolder(f.path, f.name)}
                onDelete={() => {
                  if (window.confirm(`Delete folder "${f.name}" and all its contents?`)) s.remove(f.path);
                }}
              />
            ))}
            {s.files.map((file) => (
              <FileRow
                key={file.path}
                file={file}
                onPreview={() => setPreview(file)}
                onDownload={() => s.download(file.path)}
                onRename={() => renameFile(file)}
                onDelete={() => {
                  if (window.confirm(`Delete "${file.name}"?`)) s.remove(file.path);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {preview && (
        <FilePreview file={preview} getPreviewUrl={s.getPreviewUrl} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
