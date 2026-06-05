"use client";

import { useEffect, useState } from "react";
import type { StorageFile } from "../types/storage.types";

interface Props {
  file: StorageFile;
  getPreviewUrl: (path: string) => Promise<string>;
  onClose: () => void;
}

function kindOf(name: string): "image" | "pdf" | "text" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["txt", "md", "csv", "json", "log"].includes(ext)) return "text";
  return "other";
}

export function FilePreview({ file, getPreviewUrl, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const kind = kindOf(file.name);

  useEffect(() => {
    let active = true;
    getPreviewUrl(file.path).then(async (u) => {
      if (!active) return;
      setUrl(u);
      if (kind === "text") {
        try {
          const res = await fetch(u);
          if (active) setText(await res.text());
        } catch {
          if (active) setText("(failed to load preview)");
        }
      }
    });
    return () => {
      active = false;
    };
  }, [file.path, kind, getPreviewUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="storage-preview-overlay" onClick={onClose}>
      <div className="storage-preview" onClick={(e) => e.stopPropagation()}>
        <div className="storage-preview-head">
          <span className="storage-preview-name" title={file.name}>{file.name}</span>
          <button type="button" className="storage-preview-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="storage-preview-body">
          {!url && <div className="storage-preview-loading">Loading…</div>}
          {url && kind === "image" && <img src={url} alt={file.name} className="storage-preview-img" />}
          {url && kind === "pdf" && <iframe src={url} title={file.name} className="storage-preview-frame" />}
          {url && kind === "text" && <pre className="storage-preview-text">{text ?? "Loading…"}</pre>}
          {url && kind === "other" && (
            <div className="storage-preview-fallback">
              No inline preview for this file type.
              <a href={url} target="_blank" rel="noreferrer">Open in new tab</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
