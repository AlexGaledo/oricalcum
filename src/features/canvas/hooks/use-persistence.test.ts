import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/data/api/endpoints/nodes.api", () => ({
  fetchNodes: vi.fn(),
  createNode: vi.fn(),
  patchNode: vi.fn(),
  deleteNode: vi.fn(),
}));
vi.mock("@/data/api/endpoints/edges.api", () => ({
  fetchEdges: vi.fn(),
  createEdge: vi.fn(),
  deleteEdge: vi.fn(),
}));
vi.mock("@/data/api/endpoints/projects.api", () => ({
  fetchProject: vi.fn(),
  patchProject: vi.fn(),
}));

import { fetchNodes, createNode, patchNode, deleteNode } from "@/data/api/endpoints/nodes.api";
import { fetchEdges, createEdge, deleteEdge } from "@/data/api/endpoints/edges.api";
import { fetchProject, patchProject } from "@/data/api/endpoints/projects.api";
import { usePersistence } from "./use-persistence";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import type { OriNode } from "@/shared/types";

function wireNode(id: string) {
  return {
    id, x: 0, y: 0, w: 100, h: 80, base_w: 100, base_h: 80,
    shape: "rectangle", title: "", body: "", created_at: 1, updated_at: 2,
  };
}

const localNode = (id: string): OriNode => ({
  id, x: 0, y: 0, w: 100, h: 80, baseW: 100, baseH: 80,
  shape: "rectangle", title: "", body: "", createdAt: 1, updatedAt: 2,
});

beforeEach(() => {
  vi.clearAllMocks();
  useNodeStore.setState({ nodes: [], selectedId: null });
  useEdgeStore.setState({ edges: [], selectedEdgeId: null });
  useCanvasStore.setState({ camera: { x: 0, y: 0, zoom: 1 } });

  vi.mocked(createNode).mockResolvedValue({} as never);
  vi.mocked(patchNode).mockResolvedValue({} as never);
  vi.mocked(deleteNode).mockResolvedValue({} as never);
  vi.mocked(createEdge).mockResolvedValue({} as never);
  vi.mocked(deleteEdge).mockResolvedValue({} as never);
  vi.mocked(patchProject).mockResolvedValue({} as never);
});

/** Hydrate with an existing backend node so serverNodeIds knows about it. */
async function renderHydrated(nodeId = "n_1") {
  vi.mocked(fetchNodes).mockResolvedValue([wireNode(nodeId)] as never);
  vi.mocked(fetchEdges).mockResolvedValue([] as never);
  vi.mocked(fetchProject).mockResolvedValue({ camera: { x: 0, y: 0, zoom: 1 } } as never);
  const view = renderHook(() => usePersistence("p_1"));
  await waitFor(() => expect(useNodeStore.getState().nodes).toHaveLength(1));
  return view;
}

describe("hydration", () => {
  it("loads backend nodes into the store and does not echo them back as writes", async () => {
    await renderHydrated();
    // give any stray debounce a chance to fire
    await new Promise((r) => setTimeout(r, 500));
    expect(createNode).not.toHaveBeenCalled();
    expect(patchNode).not.toHaveBeenCalled();
  });

  it("seeds the backend from local cache when backend is empty", async () => {
    useNodeStore.setState({ nodes: [localNode("local_1")], selectedId: null });
    vi.mocked(fetchNodes).mockResolvedValue([] as never);
    vi.mocked(fetchEdges).mockResolvedValue([] as never);
    vi.mocked(fetchProject).mockResolvedValue({ camera: { x: 0, y: 0, zoom: 1 } } as never);

    renderHook(() => usePersistence("p_1"));

    await waitFor(() => expect(createNode).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createNode).mock.calls[0][1]).toMatchObject({ id: "local_1" });
  });
});

describe("node writes", () => {
  it("creates a newly added node after debounce", async () => {
    await renderHydrated();
    useNodeStore.setState({ nodes: [...useNodeStore.getState().nodes, localNode("n_new")] });
    await waitFor(() => expect(createNode).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createNode).mock.calls[0][1]).toMatchObject({ id: "n_new" });
  });

  it("patches a changed (already-known) node after debounce", async () => {
    await renderHydrated("n_1");
    const moved = { ...useNodeStore.getState().nodes[0], x: 555 };
    useNodeStore.setState({ nodes: [moved] });
    await waitFor(() => expect(patchNode).toHaveBeenCalledTimes(1));
    const [pid, id, patch] = vi.mocked(patchNode).mock.calls[0];
    expect(pid).toBe("p_1");
    expect(id).toBe("n_1");
    expect(patch).toMatchObject({ x: 555 });
    expect(createNode).not.toHaveBeenCalled();
  });

  it("deletes a removed node immediately", async () => {
    await renderHydrated("n_1");
    useNodeStore.setState({ nodes: [] });
    await waitFor(() => expect(deleteNode).toHaveBeenCalledWith("p_1", "n_1"));
  });
});

describe("camera", () => {
  it("patches the project camera after debounce", async () => {
    await renderHydrated();
    useCanvasStore.setState({ camera: { x: 12, y: 34, zoom: 1.5 } });
    await waitFor(() => expect(patchProject).toHaveBeenCalledTimes(1));
    expect(vi.mocked(patchProject).mock.calls[0][1]).toEqual({
      camera: { x: 12, y: 34, zoom: 1.5 },
    });
  });
});
