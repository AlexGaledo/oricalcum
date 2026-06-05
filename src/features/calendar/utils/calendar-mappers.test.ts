import { describe, it, expect } from "vitest";
import {
  eventToBackend,
  eventToBackendPatch,
  eventFromBackend,
} from "./calendar-mappers";
import type { CalendarEvent } from "../types/calendar.types";

const sampleEvent: CalendarEvent = {
  id: "ce_1",
  title: "Test Event",
  start: 1_000_000,
  end: 4_000_000,
  allDay: false,
  description: "a note",
  color: "#ff0000",
  url: "https://example.com",
  projectId: "p_1",
  createdAt: 100,
  updatedAt: 200,
};

describe("eventToBackend", () => {
  it("maps camelCase -> snake_case with defaults", () => {
    const wire = eventToBackend(sampleEvent);
    expect(wire).toMatchObject({
      id: "ce_1",
      title: "Test Event",
      start: 1_000_000,
      end: 4_000_000,
      all_day: false,
      description: "a note",
      color: "#ff0000",
      url: "https://example.com",
      created_at: 100,
      updated_at: 200,
    });
  });

  it("coerces missing description/color/url to null", () => {
    const wire = eventToBackend({
      ...sampleEvent,
      description: undefined,
      color: undefined,
      url: undefined,
    });
    expect(wire.description).toBeNull();
    expect(wire.color).toBeNull();
    expect(wire.url).toBeNull();
  });
});

describe("eventFromBackend", () => {
  it("round-trips through eventToBackend", () => {
    const back = eventFromBackend(eventToBackend(sampleEvent));
    expect(back).toEqual(sampleEvent);
  });

  it("falls back all_day to false when absent", () => {
    const e = eventFromBackend({ id: "x", title: "t", start: 1, end: 2 });
    expect(e.allDay).toBe(false);
  });
});

describe("eventToBackendPatch", () => {
  it("emits ONLY mutable fields", () => {
    const patch = eventToBackendPatch(sampleEvent);
    expect(Object.keys(patch).sort()).toEqual(
      ["title", "start", "end", "all_day", "description", "color", "url", "updated_at"].sort(),
    );
  });

  it("omits undefined fields", () => {
    const patch = eventToBackendPatch({ title: "New Title" });
    expect(patch).toEqual({ title: "New Title" });
  });
});
