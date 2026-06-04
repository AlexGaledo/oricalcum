"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/shared/lib/uid";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import {
  fetchProjects,
  createProject,
  patchProject,
  deleteProject,
} from "@/data/api/endpoints/projects.api";
import type { WorkspaceRecord } from "../types/workspaces.types";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const DEFAULT_ACCENT = "#10A37F";

interface ProjectFromBackend {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  collaborators?: string[];
  settings?: Record<string, unknown>;
  camera?: { x: number; y: number; zoom: number };
  is_public?: boolean;
  created_at: number;
  updated_at: number;
}

function projectToWorkspace(
  project: ProjectFromBackend,
  local?: WorkspaceRecord,
): WorkspaceRecord {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    accentColor: (settings.accentColor as string) ?? local?.accentColor ?? DEFAULT_ACCENT,
    avatar: (settings.avatar as string) ?? local?.avatar,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    nodeCount: local?.nodeCount ?? 0,
    userCount: (project.collaborators?.length ?? 0) + 1,
    nodes: local?.nodes ?? [],
    edges: local?.edges ?? [],
    camera: project.camera ?? local?.camera ?? { x: 0, y: 0, zoom: 1 },
  };
}

function workspaceToCreatePayload(ws: WorkspaceRecord) {
  return {
    id: ws.id,
    name: ws.name,
    description: ws.description,
    settings: { accentColor: ws.accentColor, ...(ws.avatar ? { avatar: ws.avatar } : {}) },
    camera: ws.camera,
  };
}

interface WorkspacesStore {
  workspaces: WorkspaceRecord[];
  activeId: string | null;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;

  /** Hydrate from backend, falling back to local cache. */
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string, accentColor?: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  updateMeta: (id: string, patch: Partial<Pick<WorkspaceRecord, "name" | "description" | "accentColor" | "avatar">>) => Promise<void>;
  loadWorkspace: (id: string) => void;
  openWorkspace: (id: string, router: AppRouterInstance) => void;
  saveCurrentSnapshot: () => void;
}

export const useWorkspacesStore = create<WorkspacesStore>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeId: null,
      isLoading: false,
      error: null,
      isOffline: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true, error: null });
        try {
          const raw = await fetchProjects();
          const projects = raw as unknown as ProjectFromBackend[];
          const localWorkspaces = get().workspaces;
          const localMap = new Map(localWorkspaces.map((w) => [w.id, w]));

          const merged = projects.map((p) => projectToWorkspace(p, localMap.get(p.id)));

          // Preserve local-only workspaces that haven't been synced yet
          const remoteIds = new Set(projects.map((p) => p.id));
          const unsynced = localWorkspaces.filter((w) => !remoteIds.has(w.id));

          set({
            workspaces: [...unsynced, ...merged],
            isLoading: false,
            isOffline: false,
          });
        } catch (err) {
          console.error("Failed to fetch workspaces:", err);
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to load workspaces",
            isOffline: true,
          });
        }
      },

      createWorkspace: async (name, description = "", accentColor = DEFAULT_ACCENT) => {
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

        // Optimistic local update
        set((s) => ({ workspaces: [...s.workspaces, ws] }));

        try {
          await createProject(workspaceToCreatePayload(ws));
          set({ isOffline: false });
        } catch (err) {
          console.error("Failed to create workspace on backend:", err);
          set({ isOffline: true });
          // Keep local workspace; it will be shown as unsynced
        }
      },

      deleteWorkspace: async (id) => {
        // Optimistic local update
        set((s) => ({
          workspaces: s.workspaces.filter((w) => w.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        }));

        try {
          await deleteProject(id);
          set({ isOffline: false });
        } catch (err) {
          console.error("Failed to delete workspace on backend:", err);
          set({ isOffline: true });
        }
      },

      updateMeta: async (id, patch) => {
        const before = get().workspaces.find((w) => w.id === id);
        if (!before) return;

        const updated: WorkspaceRecord = {
          ...before,
          ...patch,
          updatedAt: Date.now(),
        };

        // Optimistic local update
        set((s) => ({
          workspaces: s.workspaces.map((w) => (w.id === id ? updated : w)),
        }));

        try {
          const apiPatch: Record<string, unknown> = {};
          if (patch.name !== undefined) apiPatch.name = patch.name;
          if (patch.description !== undefined) apiPatch.description = patch.description;
          // settings is a single object on the backend — send both keys together
          // so patching one doesn't clobber the other.
          if (patch.accentColor !== undefined || "avatar" in patch) {
            apiPatch.settings = {
              accentColor: updated.accentColor,
              ...(updated.avatar ? { avatar: updated.avatar } : {}),
            };
          }
          if (Object.keys(apiPatch).length > 0) {
            await patchProject(id, apiPatch);
          }
          set({ isOffline: false });
        } catch (err) {
          console.error("Failed to update workspace on backend:", err);
          set({ isOffline: true });
        }
      },

      loadWorkspace: (id) => {
        const { activeId, workspaces } = get();
        if (activeId === id) return;

        // save current canvas into the previously-active workspace (local cache only)
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

        // load target workspace into the canvas stores (optimistic local seed)
        const target = workspaces.find((w) => w.id === id);
        useNodeStore.setState({ nodes: target?.nodes ?? [], selectedId: null });
        useEdgeStore.setState({ edges: target?.edges ?? [], selectedEdgeId: null });
        useCanvasStore.setState({
          camera: target?.camera ?? { x: 0, y: 0, zoom: 1 },
          openDocId: null,
        });

        set({ activeId: id });
      },

      openWorkspace: (id, router) => {
        get().loadWorkspace(id);
        router.push(`/workspace/${id}`);
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
