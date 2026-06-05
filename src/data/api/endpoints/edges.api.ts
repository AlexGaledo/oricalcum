import { apiClient } from "./api-client";

export async function fetchEdges(projectId: string, nodespaceId?: string) {
  const q = nodespaceId ? `?nodespace_id=${encodeURIComponent(nodespaceId)}` : "";
  return apiClient.get<Record<string, unknown>[]>(`/projects/${projectId}/edges${q}`);
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
