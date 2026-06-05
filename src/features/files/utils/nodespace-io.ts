import { uid } from "@/shared/lib/uid";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { createNode } from "@/data/api/endpoints/nodes.api";
import { createEdge } from "@/data/api/endpoints/edges.api";
import { createNodespace } from "@/data/api/endpoints/nodespaces.api";
import {
  nodeToBackend,
  edgeToBackend,
  nodeFromBackend,
  edgeFromBackend,
} from "@/features/canvas/utils/entity-mappers";
import { useFilesStore } from "../store/files.store";
import type { FsNode } from "../types/files.types";

/** Self-contained export shape: lightweight `metadata` index + full nodes/edges. */
export interface NodespaceExport {
  version: 1;
  nodespace: { id: string; name: string };
  metadata: { nodes: { id: string; x: number; y: number }[] };
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  camera: { x: number; y: number; zoom: number };
}

/** Serialize the currently-open nodespace and trigger a JSON file download. */
export function exportActiveNodespace(): void {
  const files = useFilesStore.getState();
  const active = files.tree.find((n) => n.id === files.activeFileId);
  if (!active) return;

  const nodes = useNodeStore.getState().nodes;
  const edges = useEdgeStore.getState().edges;
  const camera = useCanvasStore.getState().camera;

  const payload: NodespaceExport = {
    version: 1,
    nodespace: { id: active.id, name: active.name },
    metadata: { nodes: nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })) },
    nodes: nodes.map((n) => nodeToBackend(n)),
    edges: edges.map((e) => edgeToBackend(e)),
    camera,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${active.name || "nodespace"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Recreate a nodespace from an exported JSON file: a new nodespace plus its
 * nodes/edges with **fresh ids** (edge endpoints remapped). Opens it on success.
 */
export async function importNodespaceFromFile(file: File): Promise<string | null> {
  const projectId = useFilesStore.getState().projectId;
  if (!projectId) return null;

  let data: Partial<NodespaceExport>;
  try {
    data = JSON.parse(await file.text()) as Partial<NodespaceExport>;
  } catch (err) {
    console.error("Import failed: invalid JSON", err);
    return null;
  }

  const name = data.nodespace?.name || file.name.replace(/\.json$/i, "") || "imported";
  const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
  const rawEdges = Array.isArray(data.edges) ? data.edges : [];

  // Parse via the shared mappers, then assign fresh ids.
  const idMap = new Map<string, string>();
  const newNodes = rawNodes.map((raw) => {
    const n = nodeFromBackend(raw);
    const fresh = uid("n");
    idMap.set(n.id, fresh);
    return { ...n, id: fresh };
  });
  const newEdges = rawEdges
    .map((raw) => {
      const e = edgeFromBackend(raw);
      const from = idMap.get(e.from);
      const to = idMap.get(e.to);
      if (!from || !to) return null; // drop dangling edges
      return { ...e, id: uid("e"), from, to };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const now = Date.now();
  try {
    const ns = await createNodespace(projectId, {
      kind: "file",
      name,
      created_at: now,
      updated_at: now,
    });
    // Nodes first (edges reference them), then edges.
    await Promise.all(newNodes.map((n) => createNode(projectId, nodeToBackend(n, ns.id))));
    await Promise.all(newEdges.map((e) => createEdge(projectId, edgeToBackend(e, ns.id))));

    const fsNode: FsNode = {
      id: ns.id,
      kind: "file",
      name: ns.name,
      parentId: ns.parent_id,
      expanded: ns.expanded,
    };
    useFilesStore.setState((s) => ({ tree: [...s.tree, fsNode] }));
    useFilesStore.getState().setActiveFile(ns.id);
    return ns.id;
  } catch (err) {
    console.error("Import failed:", err);
    return null;
  }
}
