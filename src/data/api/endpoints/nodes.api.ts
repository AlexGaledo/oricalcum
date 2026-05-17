import { apiClient } from "./api-client";
import type { SyncPayload, SyncResult } from "../api.types";

export async function fetchNodes(projectId: string) {
  return apiClient.get<Record<string, unknown>[]>(`/projects/${projectId}/nodes`);
}

export async function fetchNode(projectId: string, nodeId: string) {
  return apiClient.get<Record<string, unknown>>(`/projects/${projectId}/nodes/${nodeId}`);
}

export async function createNode(projectId: string, data: Record<string, unknown>) {
  return apiClient.post<Record<string, unknown>>(`/projects/${projectId}/nodes`, data);
}

export async function updateNode(projectId: string, nodeId: string, data: Record<string, unknown>) {
  return apiClient.put<Record<string, unknown>>(`/projects/${projectId}/nodes/${nodeId}`, data);
}

export async function deleteNode(projectId: string, nodeId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/nodes/${nodeId}`);
}

export async function syncNodes(payload: SyncPayload<Record<string, unknown>>) {
  return apiClient.post<SyncResult<Record<string, unknown>>>(`/sync/nodes`, payload);
}
