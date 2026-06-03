"use client";

import { useEffect } from "react";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { fetchNodes, createNode, patchNode, deleteNode } from "@/data/api/endpoints/nodes.api";
import { fetchEdges, createEdge, deleteEdge } from "@/data/api/endpoints/edges.api";
import { fetchProject, patchProject } from "@/data/api/endpoints/projects.api";
import {
  nodeToBackend,
  nodeToBackendPatch,
  nodeFromBackend,
  edgeToBackend,
  edgeFromBackend,
} from "@/features/canvas/utils/entity-mappers";
import type { Camera } from "@/shared/types";

const NODE_DEBOUNCE = 400;
const CAMERA_DEBOUNCE = 600;

/**
 * Backend-primary persistence. On projectId change it hydrates the canvas
 * stores from the API, then mirrors every node/edge/camera mutation back to
 * the backend via debounced per-entity REST calls.
 *
 * localStorage (workspaces.store) acts only as an offline cache / seed source.
 */
export function usePersistence(projectId: string | null) {
  useEffect(() => {
    if (!projectId) return;

    let disposed = false;
    let hydrating = true;

    const serverNodeIds = new Set<string>();
    const serverEdgeIds = new Set<string>();
    const nodeTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const edgeTimers = new Map<string, ReturnType<typeof setTimeout>>();
    let cameraTimer: ReturnType<typeof setTimeout> | null = null;

    // ---- node writes (coalesced create/patch per id) ----
    const scheduleNodeWrite = (id: string) => {
      const existing = nodeTimers.get(id);
      if (existing) clearTimeout(existing);
      nodeTimers.set(
        id,
        setTimeout(() => {
          nodeTimers.delete(id);
          const node = useNodeStore.getState().nodes.find((n) => n.id === id);
          if (!node) return;
          if (serverNodeIds.has(id)) {
            patchNode(projectId, id, nodeToBackendPatch(node)).catch(console.error);
          } else {
            serverNodeIds.add(id);
            createNode(projectId, nodeToBackend(node)).catch((err) => {
              serverNodeIds.delete(id);
              console.error(err);
            });
          }
        }, NODE_DEBOUNCE),
      );
    };

    const removeNodeRemote = (id: string) => {
      const t = nodeTimers.get(id);
      if (t) {
        clearTimeout(t);
        nodeTimers.delete(id);
      }
      if (serverNodeIds.delete(id)) {
        deleteNode(projectId, id).catch(console.error);
      }
    };

    const scheduleEdgeWrite = (id: string) => {
      const existing = edgeTimers.get(id);
      if (existing) clearTimeout(existing);
      edgeTimers.set(
        id,
        setTimeout(() => {
          edgeTimers.delete(id);
          const edge = useEdgeStore.getState().edges.find((e) => e.id === id);
          if (!edge || serverEdgeIds.has(id)) return;
          serverEdgeIds.add(id);
          createEdge(projectId, edgeToBackend(edge)).catch((err) => {
            serverEdgeIds.delete(id);
            console.error(err);
          });
        }, NODE_DEBOUNCE),
      );
    };

    const removeEdgeRemote = (id: string) => {
      const t = edgeTimers.get(id);
      if (t) {
        clearTimeout(t);
        edgeTimers.delete(id);
      }
      if (serverEdgeIds.delete(id)) {
        deleteEdge(projectId, id).catch(console.error);
      }
    };

    // ---- hydrate ----
    (async () => {
      try {
        const [rawNodes, rawEdges, project] = await Promise.all([
          fetchNodes(projectId),
          fetchEdges(projectId),
          fetchProject(projectId),
        ]);
        if (disposed) return;

        const camera = (project as { camera?: Camera }).camera;

        if (rawNodes.length > 0 || rawEdges.length > 0) {
          // backend has data — it wins
          const nodes = rawNodes.map(nodeFromBackend);
          const edges = rawEdges.map(edgeFromBackend);
          nodes.forEach((n) => serverNodeIds.add(n.id));
          edges.forEach((e) => serverEdgeIds.add(e.id));
          useNodeStore.setState({ nodes, selectedId: null });
          useEdgeStore.setState({ edges, selectedEdgeId: null });
        } else {
          // backend empty — seed it from whatever the local cache loaded
          const localNodes = useNodeStore.getState().nodes;
          const localEdges = useEdgeStore.getState().edges;
          for (const n of localNodes) {
            serverNodeIds.add(n.id);
            createNode(projectId, nodeToBackend(n)).catch((err) => {
              serverNodeIds.delete(n.id);
              console.error(err);
            });
          }
          for (const e of localEdges) {
            serverEdgeIds.add(e.id);
            createEdge(projectId, edgeToBackend(e)).catch((err) => {
              serverEdgeIds.delete(e.id);
              console.error(err);
            });
          }
        }

        if (camera) {
          useCanvasStore.setState({ camera });
        }
      } catch (err) {
        // offline / fetch failure — keep the localStorage-loaded state as-is
        console.error("Persistence hydrate failed, using local cache:", err);
      } finally {
        if (!disposed) hydrating = false;
      }
    })();

    // ---- subscriptions ----
    const unsubNodes = useNodeStore.subscribe((state, prev) => {
      if (hydrating || disposed) return;
      const prevIds = new Set(prev.nodes.map((n) => n.id));
      const nextIds = new Set(state.nodes.map((n) => n.id));
      for (const n of state.nodes) {
        const before = prev.nodes.find((p) => p.id === n.id);
        if (!before || before !== n) scheduleNodeWrite(n.id);
      }
      for (const id of prevIds) {
        if (!nextIds.has(id)) removeNodeRemote(id);
      }
    });

    const unsubEdges = useEdgeStore.subscribe((state, prev) => {
      if (hydrating || disposed) return;
      const prevIds = new Set(prev.edges.map((e) => e.id));
      const nextIds = new Set(state.edges.map((e) => e.id));
      for (const e of state.edges) {
        if (!prevIds.has(e.id)) scheduleEdgeWrite(e.id);
      }
      for (const id of prevIds) {
        if (!nextIds.has(id)) removeEdgeRemote(id);
      }
    });

    const unsubCamera = useCanvasStore.subscribe((state, prev) => {
      if (hydrating || disposed) return;
      if (state.camera === prev.camera) return;
      if (cameraTimer) clearTimeout(cameraTimer);
      cameraTimer = setTimeout(() => {
        patchProject(projectId, { camera: state.camera }).catch(console.error);
      }, CAMERA_DEBOUNCE);
    });

    return () => {
      disposed = true;
      unsubNodes();
      unsubEdges();
      unsubCamera();
      for (const t of nodeTimers.values()) clearTimeout(t);
      for (const t of edgeTimers.values()) clearTimeout(t);
      if (cameraTimer) clearTimeout(cameraTimer);
    };
  }, [projectId]);
}
