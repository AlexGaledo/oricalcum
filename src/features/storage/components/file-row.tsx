"use client";

import type { StorageFile, StorageFolder } from "../types/storage.types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let val = bytes / 1024;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 ? 1 : 0)} ${units[i]}`;
}

const FolderIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M1.5 4.5A1.5 1.5 0 013 3h3l1.5 1.5H13A1.5 1.5 0 0114.5 6v6A1.5 1.5 0 0113 13.5H3A1.5 1.5 0 011.5 12z" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M4 1.5h5L13 5.5V14a.5.5 0 01-.5.5h-9A.5.5 0 013 14V2a.5.5 0 01.5-.5z" />
    <path d="M9 1.5V5.5H13" />
  </svg>
);

export function FolderRow({ folder, onOpen, onRename, onDelete }: {
  folder: StorageFolder;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="storage-row" data-kind="folder">
      <button type="button" className="storage-row-main" onClick={onOpen}>
        <span className="storage-row-icon"><FolderIcon /></span>
        <span className="storage-row-name">{folder.name}</span>
      </button>
      <span className="storage-row-meta">folder</span>
      <div className="storage-row-actions">
        <button type="button" onClick={onRename} title="Rename / move">Rename</button>
        <button type="button" onClick={onDelete} title="Delete folder" className="is-danger">Delete</button>
      </div>
    </div>
  );
}

export function FileRow({ file, onPreview, onDownload, onRename, onDelete }: {
  file: StorageFile;
  onPreview: () => void;
  onDownload: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="storage-row" data-kind="file">
      <button type="button" className="storage-row-main" onClick={onPreview}>
        <span className="storage-row-icon"><FileIcon /></span>
        <span className="storage-row-name">{file.name}</span>
      </button>
      <span className="storage-row-meta">{formatBytes(file.size)}</span>
      <div className="storage-row-actions">
        <button type="button" onClick={onDownload} title="Download">Download</button>
        <button type="button" onClick={onRename} title="Rename / move">Rename</button>
        <button type="button" onClick={onDelete} title="Delete" className="is-danger">Delete</button>
      </div>
    </div>
  );
}
