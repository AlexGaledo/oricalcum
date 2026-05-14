import type { OriEdge, PortSide } from "@/shared/types";
import type { SyncStatus } from "./node.model";

export interface EdgeMetadata {
  projectId: string;
  version: number;
  animationStyle?: "flow" | "pulse" | "orbit";
  label?: string;
  metadata: Record<string, unknown>;
  syncStatus: SyncStatus;
}

export type EdgeModel = OriEdge & EdgeMetadata;

export function toEdgeModel(edge: OriEdge, projectId: string, existing?: Partial<EdgeMetadata>): EdgeModel {
  return {
    ...edge,
    projectId,
    version: existing?.version ?? 1,
    animationStyle: existing?.animationStyle,
    label: existing?.label,
    metadata: existing?.metadata ?? {},
    syncStatus: existing?.syncStatus ?? "dirty",
  };
}

export function edgeToApiShape(model: EdgeModel): Record<string, unknown> {
  return {
    id: model.id,
    from: model.from,
    to: model.to,
    fromPort: model.fromPort,
    toPort: model.toPort,
    animationStyle: model.animationStyle,
    label: model.label,
    metadata: model.metadata,
    version: model.version,
  };
}

export function edgeFromApiShape(data: Record<string, unknown>, projectId: string): EdgeModel {
  return {
    id: data.id as string,
    from: data.from as string,
    to: data.to as string,
    fromPort: data.fromPort as PortSide,
    toPort: data.toPort as PortSide,
    projectId,
    version: (data.version as number) ?? 1,
    animationStyle: data.animationStyle as EdgeModel["animationStyle"],
    label: data.label as string | undefined,
    metadata: (data.metadata as Record<string, unknown>) ?? {},
    syncStatus: "synced",
  };
}
