import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the API layer so the store is tested in isolation.
vi.mock("@/data/api/endpoints/snapshots.api", () => ({
  listSnapshots: vi.fn(),
  createSnapshot: vi.fn(),
  getSnapshot: vi.fn(),
  deleteSnapshot: vi.fn(),
}));

import {
  listSnapshots,
  createSnapshot,
  getSnapshot,
  deleteSnapshot,
} from "@/data/api/endpoints/snapshots.api";
import { useSnapshotsStore } from "./snapshots.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import type { OriNode, OriEdge } from "@/shared/types";

const node: OriNode = {
  id: "n_1", x: 1, y: 2, w: 100, h: 80, baseW: 100, baseH: 80,
  shape: "rectangle", title: "A", body: "", createdAt: 1, updatedAt: 2,
};
const edge: OriEdge = { id: "e_1", from: "n_1", to: "n_2", fromPort: "right", toPort: "left" };

beforeEach(() => {
  vi.clearAllMocks();
  useNodeStore.setState({ nodes: [], selectedId: null });
  useEdgeStore.setState({ edges: [], selectedEdgeId: null });
  useCanvasStore.setState({ camera: { x: 0, y: 0, zoom: 1 } });
  useSnapshotsStore.setState({ items: [], loading: false });
});

describe("capture", () => {
  it("serializes current stores to the snapshot payload", async () => {
    useNodeStore.setState({ nodes: [node], selectedId: null });
    useEdgeStore.setState({ edges: [edge], selectedEdgeId: null });
    useCanvasStore.setState({ camera: { x: 5, y: 6, zoom: 2 } });
    vi.mocked(listSnapshots).mockResolvedValue([]);

    await useSnapshotsStore.getState().capture("p_1", "snap");

    expect(createSnapshot).toHaveBeenCalledTimes(1);
    const [pid, name, data] = vi.mocked(createSnapshot).mock.calls[0];
    expect(pid).toBe("p_1");
    expect(name).toBe("snap");
    expect(data.camera).toEqual({ x: 5, y: 6, zoom: 2 });
    expect(data.nodes[0]).toMatchObject({ id: "n_1", base_w: 100 });
    expect(data.edges[0]).toMatchObject({ from_node: "n_1", to_node: "n_2" });
  });
});

describe("restore", () => {
  it("loads snapshot data back into the stores", async () => {
    vi.mocked(getSnapshot).mockResolvedValue({
      id: "s_1",
      data: {
        nodes: [nodeToWire(node)],
        edges: [edgeToWire(edge)],
        camera: { x: 9, y: 9, zoom: 3 },
      },
    } as never);

    await useSnapshotsStore.getState().restore("p_1", "s_1");

    expect(useNodeStore.getState().nodes).toHaveLength(1);
    expect(useNodeStore.getState().nodes[0].id).toBe("n_1");
    expect(useEdgeStore.getState().edges[0].from).toBe("n_1");
    expect(useCanvasStore.getState().camera).toEqual({ x: 9, y: 9, zoom: 3 });
  });
});

describe("refresh / remove", () => {
  it("refresh maps raw items", async () => {
    vi.mocked(listSnapshots).mockResolvedValue([
      { id: "s_1", name: "one", created_at: 111 },
    ] as never);
    await useSnapshotsStore.getState().refresh("p_1");
    expect(useSnapshotsStore.getState().items).toEqual([
      { id: "s_1", name: "one", createdAt: 111 },
    ]);
  });

  it("remove deletes then refreshes", async () => {
    vi.mocked(listSnapshots).mockResolvedValue([] as never);
    await useSnapshotsStore.getState().remove("p_1", "s_1");
    expect(deleteSnapshot).toHaveBeenCalledWith("p_1", "s_1");
    expect(listSnapshots).toHaveBeenCalledWith("p_1");
  });
});

// minimal wire shapes for restore input
function nodeToWire(n: OriNode): Record<string, unknown> {
  return {
    id: n.id, x: n.x, y: n.y, w: n.w, h: n.h,
    base_w: n.baseW, base_h: n.baseH, shape: n.shape,
    title: n.title, body: n.body, created_at: n.createdAt, updated_at: n.updatedAt,
  };
}
function edgeToWire(e: OriEdge): Record<string, unknown> {
  return { id: e.id, from_node: e.from, to_node: e.to, from_port: e.fromPort, to_port: e.toPort };
}
