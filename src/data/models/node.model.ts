import type { OriNode, ShapeId } from "@/shared/types";

export type SyncStatus = "synced" | "dirty" | "pending" | "conflicted";

export type NodeStatus = "active" | "archived" | "deleted";

export interface NodeMetadata {
  projectId: string;
  version: number;
  status: NodeStatus;
  tags: string[];
  syncStatus: SyncStatus;
}

export type NodeModel = OriNode & NodeMetadata;

export function toNodeModel(node: OriNode, projectId: string, existing?: Partial<NodeMetadata>): NodeModel {
  return {
    ...node,
    projectId,
    version: existing?.version ?? 1,
    status: existing?.status ?? "active",
    tags: existing?.tags ?? [],
    syncStatus: existing?.syncStatus ?? "dirty",
  };
}

export function stripSyncMeta(model: NodeModel): OriNode {
  const { projectId, version, status, tags, syncStatus, ...rest } = model;
  return rest;
}

export function nodeToApiShape(model: NodeModel): Record<string, unknown> {
  return {
    id: model.id,
    x: model.x,
    y: model.y,
    w: model.w,
    h: model.h,
    baseW: model.baseW,
    baseH: model.baseH,
    shape: model.shape,
    title: model.title,
    body: model.body,
    color: model.color,
    opacity: model.opacity,
    tags: model.tags,
    status: model.status,
    version: model.version,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function nodeFromApiShape(data: Record<string, unknown>, projectId: string): NodeModel {
  return {
    id: data.id as string,
    x: data.x as number,
    y: data.y as number,
    w: data.w as number,
    h: data.h as number,
    baseW: (data.baseW as number) ?? (data.w as number),
    baseH: (data.baseH as number) ?? (data.h as number),
    shape: data.shape as ShapeId,
    title: (data.title as string) ?? "",
    body: (data.body as string) ?? "",
    color: data.color as string | undefined,
    opacity: data.opacity as number | undefined,
    createdAt: (data.createdAt as number) ?? Date.now(),
    updatedAt: (data.updatedAt as number) ?? Date.now(),
    projectId,
    version: (data.version as number) ?? 1,
    status: (data.status as NodeStatus) ?? "active",
    tags: (data.tags as string[]) ?? [],
    syncStatus: "synced",
  };
}
