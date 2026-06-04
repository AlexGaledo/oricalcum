"use client";

import { useRef } from "react";

interface Props {
  onUpload: (files: File[]) => void;
  onNewFolder: () => void;
  onRefresh: () => void;
}

export function StorageToolbar({ onUpload, onNewFolder, onRefresh }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="storage-toolbar">
      <button type="button" className="storage-btn is-primary" onClick={() => inputRef.current?.click()}>
        Upload
      </button>
      <button type="button" className="storage-btn" onClick={onNewFolder}>
        New folder
      </button>
      <button type="button" className="storage-btn" onClick={onRefresh} title="Refresh">
        Refresh
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onUpload(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
