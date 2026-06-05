import type { CalendarEvent } from "../types/calendar.types";

export function eventToBackend(e: CalendarEvent): Record<string, unknown> {
  return {
    id: e.id,
    project_id: e.projectId,
    title: e.title,
    start: e.start,
    end: e.end,
    all_day: e.allDay ?? false,
    description: e.description ?? null,
    color: e.color ?? null,
    url: e.url ?? null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

export function eventToBackendPatch(e: Partial<CalendarEvent>): Record<string, unknown> {
  const wire: Record<string, unknown> = {};
  if (e.title !== undefined) wire.title = e.title;
  if (e.start !== undefined) wire.start = e.start;
  if (e.end !== undefined) wire.end = e.end;
  if (e.allDay !== undefined) wire.all_day = e.allDay;
  if (e.description !== undefined) wire.description = e.description ?? null;
  if (e.color !== undefined) wire.color = e.color ?? null;
  if (e.url !== undefined) wire.url = e.url ?? null;
  if (e.updatedAt !== undefined) wire.updated_at = e.updatedAt;
  return wire;
}

export function eventFromBackend(data: Record<string, unknown>): CalendarEvent {
  return {
    id: data.id as string,
    title: data.title as string,
    start: data.start as number,
    end: data.end as number,
    allDay: (data.all_day as boolean) ?? false,
    description: (data.description as string) ?? undefined,
    color: (data.color as string) ?? undefined,
    url: (data.url as string) ?? undefined,
    projectId: data.project_id as string,
    createdAt: data.created_at as number,
    updatedAt: data.updated_at as number,
  };
}
