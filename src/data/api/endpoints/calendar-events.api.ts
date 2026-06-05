import { apiClient } from "./api-client";

export async function fetchCalendarEvents(projectId: string) {
  return apiClient.get<Record<string, unknown>[]>(`/projects/${projectId}/calendar-events`);
}

export async function getCalendarEvent(projectId: string, eventId: string) {
  return apiClient.get<Record<string, unknown>>(`/projects/${projectId}/calendar-events/${eventId}`);
}

export async function createCalendarEvent(projectId: string, data: Record<string, unknown>) {
  return apiClient.post<Record<string, unknown>>(`/projects/${projectId}/calendar-events`, data);
}

export async function updateCalendarEvent(projectId: string, eventId: string, data: Record<string, unknown>) {
  return apiClient.put<Record<string, unknown>>(`/projects/${projectId}/calendar-events/${eventId}`, data);
}

export async function patchCalendarEvent(projectId: string, eventId: string, data: Record<string, unknown>) {
  return apiClient.patch<Record<string, unknown>>(`/projects/${projectId}/calendar-events/${eventId}`, data);
}

export async function deleteCalendarEvent(projectId: string, eventId: string) {
  return apiClient.delete<void>(`/projects/${projectId}/calendar-events/${eventId}`);
}
