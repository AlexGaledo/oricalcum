import { apiClient } from "./api-client";

export interface Collaborator {
  user_id: string;
  email: string | null;
  is_owner: boolean;
}

export async function fetchCollaborators(projectId: string) {
  return apiClient.get<Collaborator[]>(`/projects/${projectId}/collaborators`);
}

export async function addCollaborator(projectId: string, body: { email?: string; user_id?: string }) {
  return apiClient.post<Record<string, unknown>>(`/projects/${projectId}/collaborators`, body);
}

export async function removeCollaborator(projectId: string, collaboratorId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/collaborators/${collaboratorId}`);
}
