import { apiClient } from "./api-client";

export interface SnapshotData {
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  camera: { x: number; y: number; zoom: number };
}

export async function listSnapshots(projectId: string) {
  return apiClient.get<Record<string, unknown>[]>(`/projects/${projectId}/snapshots`);
}

export async function getSnapshot(projectId: string, snapshotId: string) {
  return apiClient.get<Record<string, unknown>>(`/projects/${projectId}/snapshots/${snapshotId}`);
}

export async function createSnapshot(projectId: string, name: string, data: SnapshotData) {
  return apiClient.post<Record<string, unknown>>(`/projects/${projectId}/snapshots`, { name, data });
}

export async function deleteSnapshot(projectId: string, snapshotId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/snapshots/${snapshotId}`);
}
