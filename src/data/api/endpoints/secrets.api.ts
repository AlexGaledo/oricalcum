import { apiClient } from "./api-client";

export interface SecretMeta {
  id: string;
  key: string;
  created_at: number;
  updated_at: number;
}

export interface SecretReveal extends SecretMeta {
  value: string;
}

export async function fetchSecrets(projectId: string) {
  return apiClient.get<SecretMeta[]>(`/projects/${projectId}/secrets`);
}

export async function createSecret(projectId: string, body: { key: string; value: string }) {
  return apiClient.post<SecretMeta>(`/projects/${projectId}/secrets`, body);
}

export async function revealSecret(projectId: string, secretId: string) {
  return apiClient.get<SecretReveal>(`/projects/${projectId}/secrets/${secretId}/reveal`);
}

export async function updateSecret(projectId: string, secretId: string, value: string) {
  return apiClient.patch<SecretMeta>(`/projects/${projectId}/secrets/${secretId}`, { value });
}

export async function deleteSecret(projectId: string, secretId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/secrets/${secretId}`);
}
