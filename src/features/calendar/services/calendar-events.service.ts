import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../types/calendar.types";
import type { CreateEventInput, UpdateEventInput, EventRange } from "../store/calendar.store";

/**
 * Headless CRUD facade for calendar events.
 *
 * Every call goes through the Zustand store, so the UI (calendar grid + detail
 * panel) stays in sync automatically. The active project is resolved from the
 * workspaces store, so callers — including future AI tools — never pass a
 * projectId. Plain async functions, no React required.
 */

function requireProjectId(): string {
  const id = useWorkspacesStore.getState().activeId;
  if (!id) throw new Error("No active project — open a workspace before calling calendar tools.");
  return id;
}

// ── Reads (synchronous, off the local cache) ───────────────────

/** All events for the active project, sorted by start time. */
export function listEvents(): CalendarEvent[] {
  return useCalendarStore.getState().listEvents();
}

/** A single event by id, or `undefined` if it isn't loaded. */
export function getEvent(id: string): CalendarEvent | undefined {
  return useCalendarStore.getState().getEvent(id);
}

/** Events overlapping the given time range (both bounds optional/open-ended). */
export function queryEvents(range: EventRange): CalendarEvent[] {
  return useCalendarStore.getState().queryEvents(range);
}

// ── Writes (persist to backend, then mirror into the cache) ─────

/** Pull the latest events from the backend and replace the cache. */
export function refreshEvents(): Promise<CalendarEvent[]> {
  return useCalendarStore.getState().fetchEvents(requireProjectId());
}

/** Create an event. `end` defaults to start + 1h; title defaults to "Untitled Event". */
export function createEvent(input: CreateEventInput): Promise<CalendarEvent> {
  return useCalendarStore.getState().addEvent(requireProjectId(), input);
}

/** Patch an event. Returns the updated event, or `undefined` if the id is unknown. */
export function updateEvent(id: string, patch: UpdateEventInput): Promise<CalendarEvent | undefined> {
  return useCalendarStore.getState().updateEvent(requireProjectId(), id, patch);
}

/** Delete an event. Returns `true` if it existed, `false` otherwise. */
export function deleteEvent(id: string): Promise<boolean> {
  return useCalendarStore.getState().deleteEvent(requireProjectId(), id);
}

/** Single namespace object — convenient to hand to a tool registry. */
export const calendarEventsService = {
  listEvents,
  getEvent,
  queryEvents,
  refreshEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} as const;
