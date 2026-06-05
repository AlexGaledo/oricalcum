import type { Camera, OriEdge, OriNode } from "@/shared/types";

export interface WorkspaceRecord {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  /** Durable media URL for the workspace avatar (S3-backed), if set. */
  avatar?: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  userCount: number;
  nodes: OriNode[];
  edges: OriEdge[];
  camera: Camera;
}
