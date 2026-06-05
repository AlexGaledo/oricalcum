"use client";

import { create } from "zustand";
import {
  listSnapshots,
  createSnapshot,
  getSnapshot,
  deleteSnapshot,
} from "@/data/api/endpoints/snapshots.api";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import {
  nodeToBackend,
  nodeFromBackend,
  edgeToBackend,
  edgeFromBackend,
} from "@/features/canvas/utils/entity-mappers";

export interface SnapshotItem {
  id: string;
  name: string;
  createdAt: number;
}

interface SnapshotsStore {
  items: SnapshotItem[];
  loading: boolean;
  refresh: (projectId: string) => Promise<void>;
  capture: (projectId: string, name: string) => Promise<void>;
  restore: (projectId: string, snapshotId: string) => Promise<void>;
  remove: (projectId: string, snapshotId: string) => Promise<void>;
}

function toItem(raw: Record<string, unknown>): SnapshotItem {
  return {
    id: raw.id as string,
    name: (raw.name as string) ?? "",
    createdAt: (raw.created_at as number) ?? 0,
  };
}

// Re-entry guard so a double-click can't create two snapshots.
let capturing = false;

export const useSnapshotsStore = create<SnapshotsStore>((set, get) => ({
  items: [],
  loading: false,

  refresh: async (projectId) => {
    set({ loading: true });
    try {
      const raw = await listSnapshots(projectId);
      set({ items: raw.map(toItem), loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  capture: async (projectId, name) => {
    // Guard against double-submit creating duplicate snapshots.
    if (capturing) return;
    capturing = true;
    try {
      const nodes = useNodeStore.getState().nodes.map((n) => nodeToBackend(n));
      const edges = useEdgeStore.getState().edges.map((e) => edgeToBackend(e));
      const camera = useCanvasStore.getState().camera;
      await createSnapshot(projectId, name, { nodes, edges, camera });
      await get().refresh(projectId);
    } finally {
      capturing = false;
    }
  },

  restore: async (projectId, snapshotId) => {
    const raw = await getSnapshot(projectId, snapshotId);
    const data = (raw.data ?? {}) as {
      nodes?: Record<string, unknown>[];
      edges?: Record<string, unknown>[];
      camera?: { x: number; y: number; zoom: number };
    };
    const nodes = (data.nodes ?? []).map(nodeFromBackend);
    const edges = (data.edges ?? []).map(edgeFromBackend);
    // Replacing store state — usePersistence diffs this against the server
    // and pushes the create/patch/delete calls needed to converge.
    useNodeStore.setState({ nodes, selectedId: null });
    useEdgeStore.setState({ edges, selectedEdgeId: null });
    if (data.camera) useCanvasStore.setState({ camera: data.camera });
  },

  remove: async (projectId, snapshotId) => {
    await deleteSnapshot(projectId, snapshotId);
    await get().refresh(projectId);
  },
}));
