"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Canvas, Minimap } from "@/features/canvas";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useEdgeStore } from "@/features/edges/store/edge.store";
import { fetchPublicProject, fetchPublicNodes, fetchPublicEdges } from "@/data/api/endpoints/projects.api";
import type { OriNode, OriEdge, ShapeId, PortSide } from "@/shared/types";

export default function SharePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      fetchPublicProject(projectId),
      fetchPublicNodes(projectId),
      fetchPublicEdges(projectId),
    ])
      .then(([project, rawNodes, rawEdges]) => {
        setProjectName((project.name as string) ?? "Shared workspace");

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
  }, [projectId]);

  if (notFound) {
    return (
      <div className="share-unavailable">
        <p>// workspace.not_found</p>
        <p>This workspace is not publicly available.</p>
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

        {projectName && (
          <div className="share-banner">
            <span className="share-banner-label">// {projectName}</span>
            <span className="share-banner-mode">read only</span>
          </div>
        )}

        <Canvas readOnly />
        <Minimap />
      </div>
    </>
  );
}
