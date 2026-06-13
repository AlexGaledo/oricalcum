"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Canvas, Minimap } from "@/features/canvas";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import {
  fetchPublicNodespace,
  fetchPublicNodespaceNodes,
  fetchPublicNodespaceEdges,
} from "@/data/api/endpoints/nodespaces.api";
import type { OriNode, OriEdge, ShapeId, PortSide } from "@/shared/types";

export default function SharePage() {
  const { nodespaceId } = useParams<{ nodespaceId: string }>();
  const [graphName, setGraphName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!nodespaceId) return;

    Promise.all([
      fetchPublicNodespace(nodespaceId),
      fetchPublicNodespaceNodes(nodespaceId),
      fetchPublicNodespaceEdges(nodespaceId),
    ])
      .then(([meta, rawNodes, rawEdges]) => {
        setGraphName((meta.name as string) ?? "Shared graph");

        const nodes: OriNode[] = (rawNodes as Record<string, unknown>[]).map((n) => ({
          id: n.id as string,
          x: n.x as number,
          y: n.y as number,
          w: n.w as number,
          h: n.h as number,
          baseW: n.base_w as number,
          baseH: n.base_h as number,
          shape: (n.shape as ShapeId) ?? "rectangle",
          title: (n.title as string) ?? "",
          body: (n.body as string) ?? "",
          color: n.color as string | undefined,
          opacity: n.opacity as number | undefined,
          createdAt: n.created_at as number,
          updatedAt: n.updated_at as number,
        }));

        const edges: OriEdge[] = (rawEdges as Record<string, unknown>[]).map((e) => ({
          id: e.id as string,
          from: e.from_node as string,
          to: e.to_node as string,
          fromPort: (e.from_port as PortSide) ?? "right",
          toPort: (e.to_port as PortSide) ?? "left",
        }));

        useNodeStore.setState({ nodes, selectedId: null });
        useEdgeStore.setState({ edges, selectedEdgeId: null });
      })
      .catch(() => setNotFound(true));

    return () => {
      useNodeStore.getState().clear();
      useEdgeStore.getState().clear();
    };
  }, [nodespaceId]);

  if (notFound) {
    return (
      <div className="share-unavailable">
        <p>// nodespace.not_found</p>
        <p>This graph is not publicly available.</p>
      </div>
    );
  }

  return (
    <>
      <LoadingScreen />
      <div className="app">
        <div className="reticles">
          <span className="reticle tl" />
          <span className="reticle tr" />
          <span className="reticle bl" />
          <span className="reticle br" />
        </div>

        {graphName && (
          <div className="share-banner">
            <span className="share-banner-label">// {graphName}</span>
            <span className="share-banner-mode">read only</span>
          </div>
        )}

        <Canvas readOnly />
        <Minimap />
      </div>
    </>
  );
}
