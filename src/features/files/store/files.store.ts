"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/shared/lib/uid";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import type { FileSnapshot, FsNode } from "../types/files.types";

interface FilesStore {
  tree: FsNode[];
  activeFileId: string | null;
  snapshots: Record<string, FileSnapshot>;
  createFile: (parentId: string | null, name?: string) => string;
  createFolder: (parentId: string | null, name?: string) => string;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  toggleFolder: (id: string) => void;
  setActiveFile: (id: string) => void;
}

const ROOT_FILE_ID = "f_root_default";

function collectDescendants(tree: FsNode[], id: string): string[] {
  const out: string[] = [id];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const n of tree) {
      if (n.parentId === cur) {
        out.push(n.id);
        stack.push(n.id);
      }
    }
  }
  return out;
}

function uniqueName(tree: FsNode[], parentId: string | null, base: string): string {
  const siblings = tree.filter((n) => n.parentId === parentId).map((n) => n.name);
  if (!siblings.includes(base)) return base;
  let i = 2;
  while (siblings.includes(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export const useFilesStore = create<FilesStore>()(
  persist(
    (set, get) => ({
  tree: [
    {
      id: ROOT_FILE_ID,
      kind: "file",
      name: "untitled",
      parentId: null,
    },
  ],
  activeFileId: ROOT_FILE_ID,
  snapshots: {},

  createFile: (parentId, name) => {
    const id = uid("f");
    const finalName = uniqueName(get().tree, parentId, name ?? "untitled");
    const node: FsNode = { id, kind: "file", name: finalName, parentId };
    set((s) => ({
      tree: [...s.tree, node],
      snapshots: {
        ...s.snapshots,
        [id]: { nodes: [], edges: [], camera: { x: 0, y: 0, zoom: 1 } },
      },
    }));
    get().setActiveFile(id);
    return id;
  },

  createFolder: (parentId, name) => {
    const id = uid("d");
    const finalName = uniqueName(get().tree, parentId, name ?? "folder");
    const node: FsNode = { id, kind: "folder", name: finalName, parentId, expanded: true };
    set((s) => ({ tree: [...s.tree, node] }));
    return id;
  },

  rename: (id, name) =>
    set((s) => ({
      tree: s.tree.map((n) => (n.id === id ? { ...n, name } : n)),
    })),

  remove: (id) => {
    const ids = collectDescendants(get().tree, id);
    set((s) => {
      const nextSnaps = { ...s.snapshots };
      for (const i of ids) delete nextSnaps[i];
      return {
        tree: s.tree.filter((n) => !ids.includes(n.id)),
        snapshots: nextSnaps,
        activeFileId: ids.includes(s.activeFileId ?? "") ? null : s.activeFileId,
      };
    });
    if (ids.includes(get().activeFileId ?? "")) {
      useNodeStore.setState({ nodes: [], selectedId: null });
      useEdgeStore.setState({ edges: [], selectedEdgeId: null });
    }
  },

  toggleFolder: (id) =>
    set((s) => ({
      tree: s.tree.map((n) =>
        n.id === id && n.kind === "folder" ? { ...n, expanded: !n.expanded } : n,
      ),
    })),

  setActiveFile: (id) => {
    const prev = get().activeFileId;
    if (prev === id) return;

    if (prev) {
      const cam = useCanvasStore.getState().camera;
      const ns = useNodeStore.getState().nodes;
      const es = useEdgeStore.getState().edges;
      set((s) => ({
        snapshots: { ...s.snapshots, [prev]: { nodes: ns, edges: es, camera: cam } },
      }));
    }

    const snap = get().snapshots[id];
    useNodeStore.setState({ nodes: snap?.nodes ?? [], selectedId: null });
    useEdgeStore.setState({ edges: snap?.edges ?? [], selectedEdgeId: null });
    useCanvasStore.setState({
      camera: snap?.camera ?? { x: 0, y: 0, zoom: 1 },
      openDocId: null,
    });

    set({ activeFileId: id });
  },
    }),
    {
      name: "oricalcum-files",
      // Persist only the tree structure/names — NOT snapshots (node/edge data
      // lives in the backend and would bloat localStorage). This keeps file
      // renames across refreshes so the title no longer reverts to "untitled".
      partialize: (s) => ({ tree: s.tree, activeFileId: s.activeFileId }),
    },
  ),
);
