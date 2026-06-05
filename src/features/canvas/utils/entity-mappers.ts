import type { OriNode, OriEdge, ShapeId, PortSide } from "@/shared/types";

// Maps between frontend camelCase models and the backend's snake_case JSON contract.
// Backend models: oricalcum-api/app/models/{node,edge}.py

export function nodeToBackend(node: OriNode, nodespaceId?: string | null): Record<string, unknown> {
  return {
    id: node.id,
    nodespace_id: nodespaceId ?? null,
    x: node.x,
    y: node.y,
    w: node.w,
    h: node.h,
    base_w: node.baseW,
    base_h: node.baseH,
    shape: node.shape,
    title: node.title,
    body: node.body,
    color: node.color ?? null,
    opacity: node.opacity ?? null,
    tags: [],
    status: "active",
    version: 1,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  };
}

// Partial patch — only mutable fields the canvas can change.
export function nodeToBackendPatch(node: OriNode): Record<string, unknown> {
  return {
    x: node.x,
    y: node.y,
    w: node.w,
    h: node.h,
    base_w: node.baseW,
    base_h: node.baseH,
    shape: node.shape,
    title: node.title,
    body: node.body,
    color: node.color ?? null,
    opacity: node.opacity ?? null,
    updated_at: node.updatedAt,
  };
}

export function nodeFromBackend(n: Record<string, unknown>): OriNode {
  return {
    id: n.id as string,
    x: n.x as number,
    y: n.y as number,
    w: n.w as number,
    h: n.h as number,
    baseW: (n.base_w as number) ?? (n.w as number),
    baseH: (n.base_h as number) ?? (n.h as number),
    shape: (n.shape as ShapeId) ?? "rectangle",
    title: (n.title as string) ?? "",
    body: (n.body as string) ?? "",
    color: (n.color as string | null) ?? undefined,
    opacity: (n.opacity as number | null) ?? undefined,
    createdAt: (n.created_at as number) ?? Date.now(),
    updatedAt: (n.updated_at as number) ?? Date.now(),
  };
}

export function edgeToBackend(edge: OriEdge, nodespaceId?: string | null): Record<string, unknown> {
  return {
    id: edge.id,
    nodespace_id: nodespaceId ?? null,
    from_node: edge.from,
    to_node: edge.to,
    from_port: edge.fromPort,
    to_port: edge.toPort,
    version: 1,
  };
}

export function edgeFromBackend(e: Record<string, unknown>): OriEdge {
  return {
    id: e.id as string,
    from: e.from_node as string,
    to: e.to_node as string,
    fromPort: (e.from_port as PortSide) ?? "right",
    toPort: (e.to_port as PortSide) ?? "left",
  };
}
