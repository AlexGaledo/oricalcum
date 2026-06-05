"use client";

import { create } from "zustand";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import {
  fetchNodespaces,
  createNodespace,
  patchNodespace,
  deleteNodespace,
  type BackendNodespace,
} from "@/data/api/endpoints/nodespaces.api";
import { migrateLocalTree } from "../utils/migrate-local-tree";
import type { FsNode } from "../types/files.types";

interface FilesStore {
  /** The project these nodespaces belong to. */
  projectId: string | null;
  tree: FsNode[];
  activeFileId: string | null;
  /** True once the tree has hydrated from the backend (or failed offline). */
  loaded: boolean;

  /** Load the nodespace tree for a project (runs one-time local migration). */
  hydrate: (projectId: string) => Promise<void>;
  createFile: (parentId: string | null, name?: string) => Promise<string | null>;
  createFolder: (parentId: string | null, name?: string) => Promise<string | null>;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  /** Move a node under a new parent (null = root). No-op on invalid moves. */
  move: (id: string, newParentId: string | null) => void;
  toggleFolder: (id: string) => void;
  setActiveFile: (id: string) => void;
  /** Reset to an empty tree (call on sign-out / user switch). */
  reset: () => void;
}

function fromBackend(s: BackendNodespace): FsNode {
  return {
    id: s.id,
    kind: s.kind,
    name: s.name,
    parentId: s.parent_id,
    expanded: s.expanded,
  };
}

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

// Guards against concurrent hydrate() for the same project (e.g. React Strict
// Mode double-invoking effects), which could otherwise seed two default nodespaces.
let hydrateInFlight: string | null = null;

/** Pick the active file: keep current if still a file, else first file, else null. */
function pickActive(tree: FsNode[], current: string | null): string | null {
  if (current && tree.some((n) => n.id === current && n.kind === "file")) return current;
  return tree.find((n) => n.kind === "file")?.id ?? null;
}

export const useFilesStore = create<FilesStore>((set, get) => ({
  projectId: null,
  tree: [],
  activeFileId: null,
  loaded: false,

  hydrate: async (projectId) => {
    if (hydrateInFlight === projectId) return;
    hydrateInFlight = projectId;
    set({ projectId, loaded: false });
    try {
      let spaces = await fetchNodespaces(projectId);

      // One-time migration of the legacy local file tree, then re-read.
      if (await migrateLocalTree(projectId, spaces)) {
        spaces = await fetchNodespaces(projectId);
      }

      // Brand-new project with no nodespaces yet — seed a default file.
      if (spaces.length === 0) {
        const now = Date.now();
        const created = await createNodespace(projectId, {
          kind: "file",
          name: "untitled",
          created_at: now,
          updated_at: now,
        });
        spaces = [created];
      }

      // Guard against a workspace switch that started after this hydrate.
      if (get().projectId !== projectId) return;

      const tree = spaces.map(fromBackend);
      set({ tree, activeFileId: pickActive(tree, get().activeFileId), loaded: true });
    } catch (err) {
      console.error("Failed to hydrate nodespaces:", err);
      if (get().projectId === projectId) set({ loaded: true });
    } finally {
      if (hydrateInFlight === projectId) hydrateInFlight = null;
    }
  },

  createFile: async (parentId, name) => {
    const projectId = get().projectId;
    if (!projectId) return null;
    const finalName = uniqueName(get().tree, parentId, name ?? "untitled");
    const now = Date.now();
    try {
      const created = await createNodespace(projectId, {
        parent_id: parentId,
        kind: "file",
        name: finalName,
        created_at: now,
        updated_at: now,
      });
      set((s) => ({ tree: [...s.tree, fromBackend(created)] }));
      get().setActiveFile(created.id);
      return created.id;
    } catch (err) {
      console.error("Failed to create nodespace:", err);
      return null;
    }
  },

  createFolder: async (parentId, name) => {
    const projectId = get().projectId;
    if (!projectId) return null;
    const finalName = uniqueName(get().tree, parentId, name ?? "folder");
    const now = Date.now();
    try {
      const created = await createNodespace(projectId, {
        parent_id: parentId,
        kind: "folder",
        name: finalName,
        expanded: true,
        created_at: now,
        updated_at: now,
      });
      set((s) => ({ tree: [...s.tree, fromBackend(created)] }));
      return created.id;
    } catch (err) {
      console.error("Failed to create folder:", err);
      return null;
    }
  },

  rename: (id, name) => {
    set((s) => ({ tree: s.tree.map((n) => (n.id === id ? { ...n, name } : n)) }));
    const projectId = get().projectId;
    if (projectId) {
      patchNodespace(projectId, id, { name, updated_at: Date.now() }).catch(console.error);
    }
  },

  remove: (id) => {
    const projectId = get().projectId;
    const ids = collectDescendants(get().tree, id);
    const wasActive = ids.includes(get().activeFileId ?? "");
    set((s) => {
      const tree = s.tree.filter((n) => !ids.includes(n.id));
      return {
        tree,
        activeFileId: wasActive ? pickActive(tree, null) : s.activeFileId,
      };
    });
    if (wasActive) {
      // The active nodespace went away; clear the canvas (re-hydrate handles the rest).
      useNodeStore.setState({ nodes: [], selectedId: null });
      useEdgeStore.setState({ edges: [], selectedEdgeId: null });
    }
    // Backend cascade removes children + their nodes/edges via FK.
    if (projectId) deleteNodespace(projectId, id).catch(console.error);
  },

  move: (id, newParentId) => {
    const tree = get().tree;
    const node = tree.find((n) => n.id === id);
    if (!node || node.parentId === newParentId) return;
    if (newParentId !== null) {
      const parent = tree.find((n) => n.id === newParentId);
      if (!parent || parent.kind !== "folder") return;
      if (collectDescendants(tree, id).includes(newParentId)) return; // no cycles
    }
    const finalName = uniqueName(tree, newParentId, node.name);
    set((s) => ({
      tree: s.tree.map((n) =>
        n.id === id ? { ...n, parentId: newParentId, name: finalName } : n,
      ),
    }));
    const projectId = get().projectId;
    if (projectId) {
      patchNodespace(projectId, id, {
        parent_id: newParentId,
        name: finalName,
        updated_at: Date.now(),
      }).catch(console.error);
    }
  },

  toggleFolder: (id) => {
    let nextExpanded = false;
    set((s) => ({
      tree: s.tree.map((n) => {
        if (n.id === id && n.kind === "folder") {
          nextExpanded = !n.expanded;
          return { ...n, expanded: nextExpanded };
        }
        return n;
      }),
    }));
    const projectId = get().projectId;
    if (projectId) {
      patchNodespace(projectId, id, { expanded: nextExpanded, updated_at: Date.now() }).catch(
        console.error,
      );
    }
  },

  setActiveFile: (id) => {
    if (get().activeFileId === id) return;
    set({ activeFileId: id });
  },

  reset: () => set({ projectId: null, tree: [], activeFileId: null, loaded: false }),
}));
