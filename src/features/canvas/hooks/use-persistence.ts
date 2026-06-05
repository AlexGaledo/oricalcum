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
import type { Camera, OriNode, OriEdge } from "@/shared/types";

const NODE_DEBOUNCE = 400;
const CAMERA_DEBOUNCE = 600;

/**
 * Per-nodespace graph cache (module-level so it survives the hook re-running on
 * every nodespace switch). Lets a switch paint the *correct* target graph
 * instantly, then revalidate against the backend in the background — instead of
 * showing the previous nodespace's nodes until the fetch resolves. One fetch per
 * switch, same as before: this only removes the visual wait, it doesn't poll.
 */
const graphCache = new Map<string, { nodes: OriNode[]; edges: OriEdge[] }>();
const cacheKey = (projectId: string, nodespaceId: string) => `${projectId}:${nodespaceId}`;

/**
 * Backend-primary persistence, scoped to a single **nodespace** within a project.
 * On `projectId`/`nodespaceId` change it hydrates the canvas stores from that
 * nodespace's nodes/edges, then mirrors every mutation back via debounced
 * per-entity REST. Switching nodespaces re-hydrates from the backend (there is no
 * local snapshot swap anymore), so all writes carry the active `nodespace_id`.
 */
export function usePersistence(projectId: string | null, nodespaceId: string | null) {
  useEffect(() => {
    if (!projectId || !nodespaceId) return;

    let disposed = false;
    let hydrating = true;

    const serverNodeIds = new Set<string>();
    const serverEdgeIds = new Set<string>();
    const nodeTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const edgeTimers = new Map<string, ReturnType<typeof setTimeout>>();
    let cameraTimer: ReturnType<typeof setTimeout> | null = null;

    // ---- node writes (coalesced create/patch per id) ----
    const writeNode = (id: string) => {
      const node = useNodeStore.getState().nodes.find((n) => n.id === id);
      if (!node) return;
      if (serverNodeIds.has(id)) {
        patchNode(projectId, id, nodeToBackendPatch(node)).catch(console.error);
      } else {
        serverNodeIds.add(id);
        createNode(projectId, nodeToBackend(node, nodespaceId)).catch((err) => {
          serverNodeIds.delete(id);
          console.error(err);
        });
      }
    };

    const scheduleNodeWrite = (id: string) => {
      const existing = nodeTimers.get(id);
      if (existing) clearTimeout(existing);
      nodeTimers.set(
        id,
        setTimeout(() => {
          nodeTimers.delete(id);
          writeNode(id);
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

    const writeEdge = (id: string) => {
      const edge = useEdgeStore.getState().edges.find((e) => e.id === id);
      if (!edge || serverEdgeIds.has(id)) return;
      serverEdgeIds.add(id);
      createEdge(projectId, edgeToBackend(edge, nodespaceId)).catch((err) => {
        serverEdgeIds.delete(id);
        console.error(err);
      });
    };

    const scheduleEdgeWrite = (id: string) => {
      const existing = edgeTimers.get(id);
      if (existing) clearTimeout(existing);
      edgeTimers.set(
        id,
        setTimeout(() => {
          edgeTimers.delete(id);
          writeEdge(id);
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

    // Flush any pending debounced writes immediately (called on teardown so a
    // nodespace switch within the debounce window doesn't drop the last edit).
    const flushPending = () => {
      for (const [id, t] of nodeTimers) {
        clearTimeout(t);
        nodeTimers.delete(id);
        writeNode(id);
      }
      for (const [id, t] of edgeTimers) {
        clearTimeout(t);
        edgeTimers.delete(id);
        writeEdge(id);
      }
    };

    const key = cacheKey(projectId, nodespaceId);

    // ---- hydrate (load the active nodespace's graph) ----
    const hydrate = async () => {
      hydrating = true;
      useCanvasStore.getState().setSyncing(true);
      try {
        const [rawNodes, rawEdges, project] = await Promise.all([
          fetchNodes(projectId, nodespaceId),
          fetchEdges(projectId, nodespaceId),
          fetchProject(projectId),
        ]);
        if (disposed) return;

        const nodes = rawNodes.map(nodeFromBackend);
        const edges = rawEdges.map(edgeFromBackend);
        serverNodeIds.clear();
        serverEdgeIds.clear();
        nodes.forEach((n) => serverNodeIds.add(n.id));
        edges.forEach((e) => serverEdgeIds.add(e.id));
        useNodeStore.setState({ nodes, selectedId: null });
        useEdgeStore.setState({ edges, selectedEdgeId: null });
        graphCache.set(key, { nodes, edges }); // freshen the cache

        const camera = (project as { camera?: Camera }).camera;
        if (camera) useCanvasStore.setState({ camera });
      } catch (err) {
        // offline / fetch failure — keep the current canvas as-is
        console.error("Persistence hydrate failed, using local state:", err);
      } finally {
        if (!disposed) {
          hydrating = false;
          useCanvasStore.getState().setSyncing(false);
        }
      }
    };

    // Instant paint: show this nodespace's cached graph immediately (correct, not
    // the previous one), then revalidate. First-ever visit has no cache → start
    // empty (honest brief blank) while the background fetch fills it.
    const cached = graphCache.get(key);
    useNodeStore.setState({ nodes: cached?.nodes ?? [], selectedId: null });
    useEdgeStore.setState({ edges: cached?.edges ?? [], selectedEdgeId: null });

    hydrate();

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

    // Re-hydrate on demand (e.g. after the assistant edits the workspace
    // server-side, or after a snapshot restore).
    const unsubReload = useCanvasStore.subscribe((state, prev) => {
      if (disposed) return;
      if (state.reloadNonce === prev.reloadNonce) return;
      hydrate();
    });

    return () => {
      disposed = true;
      unsubNodes();
      unsubEdges();
      unsubCamera();
      unsubReload();
      // Snapshot the outgoing graph so returning to this nodespace paints the
      // latest edits instantly (cleanup runs before the next effect hydrates).
      graphCache.set(key, {
        nodes: useNodeStore.getState().nodes,
        edges: useEdgeStore.getState().edges,
      });
      flushPending();
      if (cameraTimer) clearTimeout(cameraTimer);
    };
  }, [projectId, nodespaceId]);
}
