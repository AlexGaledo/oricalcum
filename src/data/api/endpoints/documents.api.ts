import { apiClient } from "./api-client";

export async function fetchDocument(nodeId: string) {
  return apiClient.get<Record<string, unknown>>(`/documents/${nodeId}`);
}

export async function upsertDocument(nodeId: string, content: string, version: number) {
  return apiClient.put<Record<string, unknown>>(`/documents/${nodeId}`, { content, version });
}

export async function deleteDocument(nodeId: string) {
  return apiClient.delete<void>(`/documents/${nodeId}`);
}
