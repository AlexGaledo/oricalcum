import { apiClient } from "./api-client";
import type { SyncPayload, SyncResult } from "../api.types";

export async function fetchEdges(projectId: string) {
  return apiClient.get<Record<string, unknown>[]>(`/projects/${projectId}/edges`);
}

export async function createEdge(projectId: string, data: Record<string, unknown>) {
  return apiClient.post<Record<string, unknown>>(`/projects/${projectId}/edges`, data);
}

export async function updateEdge(projectId: string, edgeId: string, data: Record<string, unknown>) {
  return apiClient.put<Record<string, unknown>>(`/projects/${projectId}/edges/${edgeId}`, data);
}

export async function deleteEdge(projectId: string, edgeId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/edges/${edgeId}`);
}

export async function syncEdges(payload: SyncPayload<Record<string, unknown>>) {
  return apiClient.post<SyncResult<Record<string, unknown>>>(`/sync/edges`, payload);
}
