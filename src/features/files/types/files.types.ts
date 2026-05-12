import type { Camera, OriEdge, OriNode } from "@/shared/types";

export type FileNodeKind = "file" | "folder";

export interface FsNode {
  id: string;
  kind: FileNodeKind;
  name: string;
  parentId: string | null;
  expanded?: boolean;
}

export interface FileSnapshot {
  nodes: OriNode[];
  edges: OriEdge[];
  camera: Camera;
}
