import type { SyncStatus } from "./node.model";

export interface DocumentModel {
  nodeId: string;
  content: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export function documentToApiShape(doc: DocumentModel): Record<string, unknown> {
  return {
    nodeId: doc.nodeId,
    content: doc.content,
    version: doc.version,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function documentFromApiShape(data: Record<string, unknown>): DocumentModel {
  return {
    nodeId: data.nodeId as string,
    content: (data.content as string) ?? "",
    version: (data.version as number) ?? 1,
    createdAt: (data.createdAt as number) ?? Date.now(),
    updatedAt: (data.updatedAt as number) ?? Date.now(),
    syncStatus: "synced",
  };
}
