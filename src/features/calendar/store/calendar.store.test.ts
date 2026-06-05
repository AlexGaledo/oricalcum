import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/data/api/endpoints/calendar-events.api", () => ({
  fetchCalendarEvents: vi.fn(),
  createCalendarEvent: vi.fn(),
  patchCalendarEvent: vi.fn(),
  deleteCalendarEvent: vi.fn(),
}));

import {
  fetchCalendarEvents,
  createCalendarEvent,
  patchCalendarEvent,
  deleteCalendarEvent,
} from "@/data/api/endpoints/calendar-events.api";
import { useCalendarStore } from "./calendar.store";

beforeEach(() => {
  vi.clearAllMocks();
  useCalendarStore.setState({
    events: [],
    isOpen: false,
    selectedEventId: null,
    isLoading: false,
  });
});

describe("open / close", () => {
  it("openCalendar sets isOpen true", () => {
    useCalendarStore.getState().openCalendar();
    expect(useCalendarStore.getState().isOpen).toBe(true);
  });

  it("closeCalendar sets isOpen false and clears selection", () => {
    useCalendarStore.setState({ isOpen: true, selectedEventId: "ce_1" });
    useCalendarStore.getState().closeCalendar();
    expect(useCalendarStore.getState().isOpen).toBe(false);
    expect(useCalendarStore.getState().selectedEventId).toBeNull();
  });
});

describe("select / clear", () => {
  it("selectEvent sets selectedEventId", () => {
    useCalendarStore.getState().selectEvent("ce_1");
    expect(useCalendarStore.getState().selectedEventId).toBe("ce_1");
  });

  it("clearSelection nullifies selectedEventId", () => {
    useCalendarStore.setState({ selectedEventId: "ce_1" });
    useCalendarStore.getState().clearSelection();
    expect(useCalendarStore.getState().selectedEventId).toBeNull();
  });
});

describe("fetchEvents", () => {
  it("populates events from API response", async () => {
    vi.mocked(fetchCalendarEvents).mockResolvedValue([
      { id: "ce_1", title: "A", start: 100, end: 200, all_day: false, description: null, color: null, project_id: "p_1", created_at: 10, updated_at: 20 },
      { id: "ce_2", title: "B", start: 300, end: 400, all_day: true, description: "desc", color: "#f00", project_id: "p_1", created_at: 30, updated_at: 40 },
    ] as never);

    await useCalendarStore.getState().fetchEvents("p_1");

    const events = useCalendarStore.getState().events;
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe("ce_1");
    expect(events[0].title).toBe("A");
    expect(events[1].allDay).toBe(true);
    expect(events[1].description).toBe("desc");
  });
});

describe("addEvent", () => {
  it("calls createCalendarEvent and appends to store", async () => {
    vi.mocked(createCalendarEvent).mockResolvedValue({} as never);

    const event = await useCalendarStore.getState().addEvent("p_1", {
      title: "New",
      start: 1000,
      end: 2000,
    });

    expect(createCalendarEvent).toHaveBeenCalledTimes(1);
    expect(event.title).toBe("New");
    expect(event.start).toBe(1000);
    expect(useCalendarStore.getState().events).toHaveLength(1);
    expect(useCalendarStore.getState().events[0].title).toBe("New");
  });
});

describe("updateEvent", () => {
  it("patches API and updates store in-place", async () => {
    vi.mocked(patchCalendarEvent).mockResolvedValue({} as never);
    useCalendarStore.setState({
      events: [{ id: "ce_1", title: "Old", start: 100, end: 200, allDay: false, projectId: "p_1", createdAt: 10, updatedAt: 20 }],
    });

    await useCalendarStore.getState().updateEvent("p_1", "ce_1", { title: "Updated" });

    expect(patchCalendarEvent).toHaveBeenCalledWith("p_1", "ce_1", expect.objectContaining({ title: "Updated" }));
    expect(useCalendarStore.getState().events[0].title).toBe("Updated");
  });
});

describe("deleteEvent", () => {
  it("calls API and removes from store", async () => {
    vi.mocked(deleteCalendarEvent).mockResolvedValue({} as never);
    useCalendarStore.setState({
      events: [{ id: "ce_1", title: "A", start: 100, end: 200, allDay: false, projectId: "p_1", createdAt: 10, updatedAt: 20 }],
      selectedEventId: "ce_1",
    });

    const ok = await useCalendarStore.getState().deleteEvent("p_1", "ce_1");

    expect(ok).toBe(true);
    expect(deleteCalendarEvent).toHaveBeenCalledWith("p_1", "ce_1");
    expect(useCalendarStore.getState().events).toHaveLength(0);
    expect(useCalendarStore.getState().selectedEventId).toBeNull();
  });

  it("returns false and skips API for unknown id", async () => {
    const ok = await useCalendarStore.getState().deleteEvent("p_1", "missing");
    expect(ok).toBe(false);
    expect(deleteCalendarEvent).not.toHaveBeenCalled();
  });
});

// ── Tool-facing CRUD contracts ────────────────────────────────

const seed = () =>
  useCalendarStore.setState({
    events: [
      { id: "ce_2", title: "B", start: 300, end: 400, allDay: false, projectId: "p_1", createdAt: 0, updatedAt: 0 },
      { id: "ce_1", title: "A", start: 100, end: 200, allDay: false, projectId: "p_1", createdAt: 0, updatedAt: 0 },
    ],
  });

describe("reads", () => {
  it("getEvent finds by id, undefined when absent", () => {
    seed();
    expect(useCalendarStore.getState().getEvent("ce_1")?.title).toBe("A");
    expect(useCalendarStore.getState().getEvent("nope")).toBeUndefined();
  });

  it("listEvents returns events sorted by start", () => {
    seed();
    expect(useCalendarStore.getState().listEvents().map((e) => e.id)).toEqual(["ce_1", "ce_2"]);
  });

  it("queryEvents returns events overlapping the range", () => {
    seed();
    expect(useCalendarStore.getState().queryEvents({ from: 250, to: 500 }).map((e) => e.id)).toEqual(["ce_2"]);
    expect(useCalendarStore.getState().queryEvents({ to: 250 }).map((e) => e.id)).toEqual(["ce_1"]);
    expect(useCalendarStore.getState().queryEvents({}).map((e) => e.id)).toEqual(["ce_1", "ce_2"]);
  });
});

describe("addEvent defaults", () => {
  it("defaults end to start + 1h and title to Untitled Event", async () => {
    vi.mocked(createCalendarEvent).mockResolvedValue({} as never);
    const event = await useCalendarStore.getState().addEvent("p_1", { start: 1000 });
    expect(event.title).toBe("Untitled Event");
    expect(event.end).toBe(1000 + 3_600_000);
  });
});

describe("updateEvent contract", () => {
  it("returns updated event and clamps inverted range", async () => {
    vi.mocked(patchCalendarEvent).mockResolvedValue({} as never);
    seed();
    const updated = await useCalendarStore.getState().updateEvent("p_1", "ce_1", { end: 50 });
    expect(updated?.end).toBe(100 + 3_600_000);
  });

  it("returns undefined for unknown id and skips API", async () => {
    const updated = await useCalendarStore.getState().updateEvent("p_1", "missing", { title: "x" });
    expect(updated).toBeUndefined();
    expect(patchCalendarEvent).not.toHaveBeenCalled();
  });
});
