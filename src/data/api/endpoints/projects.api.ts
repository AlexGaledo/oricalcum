import { apiClient } from "./api-client";

export interface CreateProjectPayload {
  id?: string;
  name: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export async function fetchProjects() {
  return apiClient.get<Record<string, unknown>[]>("/projects");
}

export async function fetchProject(projectId: string) {
  return apiClient.get<Record<string, unknown>>(`/projects/${projectId}`);
}

export async function createProject(data: CreateProjectPayload) {
  return apiClient.post<Record<string, unknown>>("/projects", data);
}

export async function updateProject(projectId: string, data: Partial<CreateProjectPayload>) {
  return apiClient.put<Record<string, unknown>>(`/projects/${projectId}`, data);
}

export interface ProjectPatchPayload {
  name?: string;
  description?: string;
  collaborators?: string[];
  settings?: Record<string, unknown>;
  camera?: { x: number; y: number; zoom: number };
}

export async function patchProject(projectId: string, patch: ProjectPatchPayload) {
  return apiClient.patch<Record<string, unknown>>(`/projects/${projectId}`, patch);
}

export async function deleteProject(projectId: string) {
  return apiClient.delete<void>(`/projects/${projectId}`);
}
