"use client";

import { useEffect } from "react";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { createNode } from "@/data/api/endpoints/nodes.api";
import { createEdge } from "@/data/api/endpoints/edges.api";
import type { OriNode } from "@/shared/types";
import type { OriEdge } from "@/shared/types";

function nodeToBackend(node: OriNode) {
  return {
    id: node.id,
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

function edgeToBackend(edge: OriEdge) {
  return {
    id: edge.id,
    from_node: edge.from,
    to_node: edge.to,
    from_port: edge.fromPort,
    to_port: edge.toPort,
    version: 1,
  };
}

export function useAutoSave(projectId: string | null) {
  useEffect(() => {
    if (!projectId) return;

    const unsubNodes = useNodeStore.subscribe((state, prev) => {
      if (state.nodes.length <= prev.nodes.length) return;
      const newNode = state.nodes[state.nodes.length - 1];
      createNode(projectId, nodeToBackend(newNode)).catch(console.error);
    });

    const unsubEdges = useEdgeStore.subscribe((state, prev) => {
      if (state.edges.length <= prev.edges.length) return;
      const newEdge = state.edges[state.edges.length - 1];
      createEdge(projectId, edgeToBackend(newEdge)).catch(console.error);
    });

    return () => {
      unsubNodes();
      unsubEdges();
    };
  }, [projectId]);
}
