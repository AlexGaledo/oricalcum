import type { Camera } from "@/shared/types";

export interface ProjectSettings {
  bgMode: "plain" | "grid" | "paper" | "collage";
  fontMode: "mono" | "sans" | "serif" | "display" | "hand";
  accent: string;
  nodeScale: number;
  glow: number;
  nodeFloating: boolean;
  nodePulsing: boolean;
  connectionsAnimated: boolean;
  connectionStyle: "flow" | "pulse" | "orbit";
  connectionSpeed: number;
  showMinimap: boolean;
  showStatusBar: boolean;
}

export interface ProjectModel {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
  settings: ProjectSettings;
  camera: Camera;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt: number | null;
}

export function defaultProjectSettings(): ProjectSettings {
  return {
    bgMode: "grid",
    fontMode: "mono",
    accent: "#10A37F",
    nodeScale: 100,
    glow: 60,
    nodeFloating: false,
    nodePulsing: false,
    connectionsAnimated: true,
    connectionStyle: "flow",
    connectionSpeed: 50,
    showMinimap: true,
    showStatusBar: true,
  };
}

export function projectToApiShape(project: ProjectModel): Record<string, unknown> {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    collaborators: project.collaborators,
    settings: project.settings,
    camera: project.camera,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function projectFromApiShape(data: Record<string, unknown>): ProjectModel {
  return {
    id: data.id as string,
    name: (data.name as string) ?? "",
    description: (data.description as string) ?? "",
    ownerId: (data.ownerId as string) ?? "",
    collaborators: (data.collaborators as string[]) ?? [],
    settings: { ...defaultProjectSettings(), ...(data.settings as Partial<ProjectSettings>) },
    camera: (data.camera as Camera) ?? { x: 0, y: 0, zoom: 1 },
    createdAt: (data.createdAt as number) ?? Date.now(),
    updatedAt: (data.updatedAt as number) ?? Date.now(),
    lastSyncedAt: null,
  };
}
