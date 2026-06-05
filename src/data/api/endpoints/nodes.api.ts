import { apiClient } from "./api-client";

export async function fetchNodes(projectId: string, nodespaceId?: string) {
  const q = nodespaceId ? `?nodespace_id=${encodeURIComponent(nodespaceId)}` : "";
  return apiClient.get<Record<string, unknown>[]>(`/projects/${projectId}/nodes${q}`);
}

export async function fetchNode(projectId: string, nodeId: string) {
  return apiClient.get<Record<string, unknown>>(`/projects/${projectId}/nodes/${nodeId}`);
}

export async function createNode(projectId: string, data: Record<string, unknown>) {
  return apiClient.post<Record<string, unknown>>(`/projects/${projectId}/nodes`, data);
}

export async function patchNode(projectId: string, nodeId: string, data: Record<string, unknown>) {
  return apiClient.patch<Record<string, unknown>>(`/projects/${projectId}/nodes/${nodeId}`, data);
}

export async function deleteNode(projectId: string, nodeId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/nodes/${nodeId}`);
}
