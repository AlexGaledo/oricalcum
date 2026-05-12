"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { useFilesStore } from "../store/files.store";
import { FileTreeItem } from "./file-tree-item";

export function FileExplorer() {
  const open = useCanvasStore((s) => s.fileTreeOpen);
  const hideAll = useThemeStore((s) => s.hideAllUi);
  const tree = useFilesStore((s) => s.tree);
  const createFile = useFilesStore((s) => s.createFile);
  const createFolder = useFilesStore((s) => s.createFolder);

  const roots = tree.filter((n) => n.parentId === null);

  return (
    <div
      className="file-explorer"
      data-open={open && !hideAll ? "1" : "0"}
      aria-hidden={!open || hideAll}
    >
      <div className="file-explorer-header">
        <span>// files</span>
        <div className="file-explorer-actions">
          <button
            type="button"
            onClick={() => createFile(null)}
            title="New file"
            aria-label="New file"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => createFolder(null)}
            title="New folder"
            aria-label="New folder"
          >
            ▣
          </button>
        </div>
      </div>
      <div className="file-explorer-body">
        {roots.map((n) => (
          <FileTreeItem key={n.id} node={n} depth={0} />
        ))}
      </div>
    </div>
  );
}
