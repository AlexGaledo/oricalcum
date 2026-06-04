"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listStorage,
  presignUpload,
  presignDownload,
  deleteStorageItem,
  type StorageFile,
} from "@/data/api/endpoints/storage.api";
import { uploadToPresigned } from "@/shared/lib/s3-upload";

interface Props {
  projectId: string;
  nodeId: string;
}

/**
 * Attachments for a node. They live in S3 under `_attachments/{nodeId}/`, so the
 * list is just that prefix — no extra node persistence needed. Survives reloads
 * and travels with the workspace.
 */
export function NodeAttachments({ projectId, nodeId }: Props) {
  const prefix = `uploded-node-media/${nodeId}/`;
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const listing = await listStorage(projectId, prefix);
      setFiles(listing.files);
    } catch {
      setFiles([]);
    }
  }, [projectId, prefix]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onUpload = async (picked: File[]) => {
    if (!picked.length) return;
    setBusy(true);
    try {
      for (const file of picked) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const { url } = await presignUpload(projectId, {
          path: `${prefix}${safeName}`,
          content_type: file.type || "application/octet-stream",
          size: file.size,
        });
        await uploadToPresigned(url, file);
      }
      await refresh();
    } catch (err) {
      console.error("Attachment upload failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const onDownload = async (path: string) => {
    const { url } = await presignDownload(projectId, path, true);
    window.open(url, "_blank");
  };

  const onDelete = async (path: string) => {
    await deleteStorageItem(projectId, path);
    await refresh();
  };

  return (
    <div className="node-attach">
      <div className="node-attach-head">
        <span className="node-attach-label">Attachments</span>
        <button
          type="button"
          className="node-attach-add"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? "Uploading…" : "+ Add"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            onUpload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <div className="node-attach-list">
          {files.map((f) => (
            <div key={f.path} className="node-attach-chip">
              <button type="button" className="node-attach-name" onClick={() => onDownload(f.path)} title={f.name}>
                {f.name}
              </button>
              <button
                type="button"
                className="node-attach-del"
                onClick={() => onDelete(f.path)}
                aria-label={`Delete ${f.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
