"use client";

import { create } from "zustand";
import { uid } from "@/shared/lib/uid";
import {
  fetchCalendarEvents,
  createCalendarEvent,
  patchCalendarEvent,
  deleteCalendarEvent,
} from "@/data/api/endpoints/calendar-events.api";
import { eventToBackend, eventFromBackend, eventToBackendPatch } from "../utils/calendar-mappers";
import type { CalendarEvent } from "../types/calendar.types";

export interface CreateEventInput {
  title?: string;
  start: number;
  end?: number;
  allDay?: boolean;
  description?: string;
  color?: string;
  url?: string;
}

export type UpdateEventInput = Partial<
  Pick<CalendarEvent, "title" | "start" | "end" | "allDay" | "description" | "color" | "url">
>;

export interface EventRange {
  from?: number;
  to?: number;
}

interface CalendarStore {
  events: CalendarEvent[];
  isOpen: boolean;
  selectedEventId: string | null;
  isLoading: boolean;
  openCalendar: () => void;
  closeCalendar: () => void;
  selectEvent: (id: string | null) => void;
  clearSelection: () => void;

  // ── Reads (synchronous, off the local cache) ──────────────────
  getEvent: (id: string) => CalendarEvent | undefined;
  listEvents: () => CalendarEvent[];
  queryEvents: (range: EventRange) => CalendarEvent[];

  // ── Writes (persist to backend, then mirror into the cache) ───
  fetchEvents: (projectId: string) => Promise<CalendarEvent[]>;
  addEvent: (projectId: string, data: CreateEventInput) => Promise<CalendarEvent>;
  updateEvent: (projectId: string, id: string, patch: UpdateEventInput) => Promise<CalendarEvent | undefined>;
  deleteEvent: (projectId: string, id: string) => Promise<boolean>;
}

const HOUR = 3_600_000;

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  isOpen: false,
  selectedEventId: null,
  isLoading: false,

  openCalendar: () => set({ isOpen: true }),
  closeCalendar: () => set({ isOpen: false, selectedEventId: null }),
  selectEvent: (id) => set({ selectedEventId: id }),
  clearSelection: () => set({ selectedEventId: null }),

  getEvent: (id) => get().events.find((e) => e.id === id),

  listEvents: () => [...get().events].sort((a, b) => a.start - b.start),

  queryEvents: ({ from, to }) =>
    get()
      .events
      // overlap test: event intersects [from, to] if it starts before `to`
      // and ends after `from` (either bound optional = open-ended).
      .filter((e) => (to === undefined || e.start < to) && (from === undefined || e.end > from))
      .sort((a, b) => a.start - b.start),

  fetchEvents: async (projectId) => {
    set({ isLoading: true });
    try {
      const data = await fetchCalendarEvents(projectId);
      const events = data.map(eventFromBackend);
      set({ events });
      return events;
    } finally {
      set({ isLoading: false });
    }
  },

  addEvent: async (projectId, data) => {
    const now = Date.now();
    const start = data.start;
    // Default to a 1h block when no end supplied; never allow end <= start.
    const end = data.end !== undefined && data.end > start ? data.end : start + HOUR;
    const event: CalendarEvent = {
      id: uid("ce"),
      title: data.title?.trim() || "Untitled Event",
      start,
      end,
      allDay: data.allDay ?? false,
      description: data.description,
      color: data.color,
      url: data.url,
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    await createCalendarEvent(projectId, eventToBackend(event));
    set((s) => ({ events: [...s.events, event] }));
    return event;
  },

  updateEvent: async (projectId, id, patch) => {
    const existing = get().events.find((e) => e.id === id);
    if (!existing) return undefined;
    const now = Date.now();
    const updated: CalendarEvent = { ...existing, ...patch, updatedAt: now };
    // Keep the invariant the UI relies on: end strictly after start.
    if (updated.end <= updated.start) updated.end = updated.start + HOUR;

    const wirePatch = eventToBackendPatch({
      ...patch,
      end: updated.end,
      updatedAt: now,
    });
    await patchCalendarEvent(projectId, id, wirePatch);
    set((s) => ({ events: s.events.map((e) => (e.id === id ? updated : e)) }));
    return updated;
  },

  deleteEvent: async (projectId, id) => {
    if (!get().events.some((e) => e.id === id)) return false;
    await deleteCalendarEvent(projectId, id);
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      selectedEventId: s.selectedEventId === id ? null : s.selectedEventId,
    }));
    return true;
  },
}));
