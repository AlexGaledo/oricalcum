"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/shared/lib/uid";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import type { WorkspaceRecord } from "../types/workspaces.types";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const DEFAULT_ACCENT = "#10A37F";

function defaultWorkspace(): WorkspaceRecord {
  return {
    id: uid("ws"),
    name: "My first workspace",
    description: "Your default canvas",
    accentColor: DEFAULT_ACCENT,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodeCount: 0,
    userCount: 1,
    nodes: [],
    edges: [],
    camera: { x: 0, y: 0, zoom: 1 },
  };
}

interface WorkspacesStore {
  workspaces: WorkspaceRecord[];
  activeId: string | null;
  createWorkspace: (name: string, description?: string, accentColor?: string) => void;
  deleteWorkspace: (id: string) => void;
  updateMeta: (id: string, patch: Partial<Pick<WorkspaceRecord, "name" | "description" | "accentColor">>) => void;
  openWorkspace: (id: string, router: AppRouterInstance) => void;
  saveCurrentSnapshot: () => void;
}

export const useWorkspacesStore = create<WorkspacesStore>()(
  persist(
    (set, get) => ({
      workspaces: [defaultWorkspace()],
      activeId: null,

      createWorkspace: (name, description = "", accentColor = DEFAULT_ACCENT) => {
        const ws: WorkspaceRecord = {
          id: uid("ws"),
          name,
          description,
          accentColor,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          nodeCount: 0,
          userCount: 1,
          nodes: [],
          edges: [],
          camera: { x: 0, y: 0, zoom: 1 },
        };
        set((s) => ({ workspaces: [...s.workspaces, ws] }));
      },

      deleteWorkspace: (id) => {
        set((s) => ({
          workspaces: s.workspaces.filter((w) => w.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        }));
      },

      updateMeta: (id, patch) => {
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === id ? { ...w, ...patch, updatedAt: Date.now() } : w,
          ),
        }));
      },

      openWorkspace: (id, router) => {
        const { activeId, workspaces } = get();

        // save current canvas into active workspace
        if (activeId) {
          const nodes = useNodeStore.getState().nodes;
          const edges = useEdgeStore.getState().edges;
          const camera = useCanvasStore.getState().camera;
          set((s) => ({
            workspaces: s.workspaces.map((w) =>
              w.id === activeId
                ? { ...w, nodes, edges, camera, nodeCount: nodes.length, updatedAt: Date.now() }
                : w,
            ),
          }));
        }

        // load target workspace
        const target = workspaces.find((w) => w.id === id);
        useNodeStore.setState({ nodes: target?.nodes ?? [], selectedId: null });
        useEdgeStore.setState({ edges: target?.edges ?? [], selectedEdgeId: null });
        useCanvasStore.setState({
          camera: target?.camera ?? { x: 0, y: 0, zoom: 1 },
          openDocId: null,
        });

        set({ activeId: id });
        router.push("/workspace");
      },

      saveCurrentSnapshot: () => {
        const { activeId } = get();
        if (!activeId) return;
        const nodes = useNodeStore.getState().nodes;
        const edges = useEdgeStore.getState().edges;
        const camera = useCanvasStore.getState().camera;
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === activeId
              ? { ...w, nodes, edges, camera, nodeCount: nodes.length, updatedAt: Date.now() }
              : w,
          ),
        }));
      },
    }),
    {
      name: "oricalcum-workspaces",
      partialize: (s) => ({ workspaces: s.workspaces, activeId: s.activeId }),
    },
  ),
);
