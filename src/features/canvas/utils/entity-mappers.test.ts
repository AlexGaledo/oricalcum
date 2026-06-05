import { describe, it, expect } from "vitest";
import type { OriNode, OriEdge } from "@/shared/types";
import {
  nodeToBackend,
  nodeToBackendPatch,
  nodeFromBackend,
  edgeToBackend,
  edgeFromBackend,
} from "./entity-mappers";

const sampleNode: OriNode = {
  id: "n_1",
  x: 10,
  y: 20,
  w: 200,
  h: 120,
  baseW: 180,
  baseH: 100,
  shape: "hexagon",
  title: "Title",
  body: "<p>body</p>",
  createdAt: 1000,
  updatedAt: 2000,
  color: "#fff",
  opacity: 0.5,
};

const sampleEdge: OriEdge = {
  id: "e_1",
  from: "n_1",
  to: "n_2",
  fromPort: "bottom",
  toPort: "top",
};

describe("nodeToBackend", () => {
  it("maps camelCase -> snake_case with defaults", () => {
    const wire = nodeToBackend(sampleNode);
    expect(wire).toMatchObject({
      id: "n_1",
      base_w: 180,
      base_h: 100,
      shape: "hexagon",
      body: "<p>body</p>",
      color: "#fff",
      opacity: 0.5,
      created_at: 1000,
      updated_at: 2000,
      tags: [],
      status: "active",
      version: 1,
    });
  });

  it("coerces missing color/opacity to null", () => {
    const wire = nodeToBackend({ ...sampleNode, color: undefined, opacity: undefined });
    expect(wire.color).toBeNull();
    expect(wire.opacity).toBeNull();
  });
});

describe("nodeFromBackend", () => {
  it("round-trips through nodeToBackend", () => {
    const back = nodeFromBackend(nodeToBackend(sampleNode));
    expect(back).toEqual(sampleNode);
  });

  it("falls back base_w/base_h to w/h when absent", () => {
    const n = nodeFromBackend({ id: "x", x: 0, y: 0, w: 50, h: 60 });
    expect(n.baseW).toBe(50);
    expect(n.baseH).toBe(60);
    expect(n.shape).toBe("rectangle");
  });
});

describe("nodeToBackendPatch", () => {
  it("emits ONLY mutable fields, never id/created_at/version/tags/status", () => {
    const patch = nodeToBackendPatch(sampleNode);
    expect(Object.keys(patch).sort()).toEqual(
      [
        "base_h", "base_w", "body", "color", "h", "opacity",
        "shape", "title", "updated_at", "w", "x", "y",
      ].sort(),
    );
    expect(patch).not.toHaveProperty("id");
    expect(patch).not.toHaveProperty("created_at");
    expect(patch).not.toHaveProperty("version");
    expect(patch).not.toHaveProperty("tags");
    expect(patch).not.toHaveProperty("status");
  });
});

describe("edge mappers", () => {
  it("round-trips edge", () => {
    const back = edgeFromBackend(edgeToBackend(sampleEdge));
    expect(back).toEqual(sampleEdge);
  });

  it("maps from/to to from_node/to_node", () => {
    const wire = edgeToBackend(sampleEdge);
    expect(wire).toMatchObject({
      from_node: "n_1",
      to_node: "n_2",
      from_port: "bottom",
      to_port: "top",
      version: 1,
    });
  });
});
