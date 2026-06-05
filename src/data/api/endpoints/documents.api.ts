import { apiClient } from "./api-client";

export interface DocumentPayload {
  content: string;
  version: number;
}

export interface DocumentMeta {
  node_id: string;
  content: string;
  version: number;
  created_at: number;
  updated_at: number;
}

export async function fetchDocument(nodeId: string) {
  return apiClient.get<DocumentMeta>(`/documents/${nodeId}`);
}

export async function upsertDocument(nodeId: string, payload: DocumentPayload) {
  return apiClient.put<DocumentMeta>(`/documents/${nodeId}`, payload);
}

export async function deleteDocument(nodeId: string) {
  return apiClient.delete<void>(`/documents/${nodeId}`);
}
