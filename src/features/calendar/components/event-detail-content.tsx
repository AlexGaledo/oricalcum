"use client";

import { useState, useEffect } from "react";
import { useCalendarStore } from "../store/calendar.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";

const EVENT_COLORS = [
  "#10A37F",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#EF4444",
];

const pad = (n: number) => String(n).padStart(2, "0");

// Format a timestamp into a *local* datetime-local value (YYYY-MM-DDTHH:mm).
// NOTE: never use toISOString() here — it converts to UTC and shifts the
// displayed time by the viewer's timezone offset.
const fmtDate = (ts?: number) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// `new Date("YYYY-MM-DDTHH:mm")` parses as local time — matches fmtDate.
function parseLocalDate(iso: string): number {
  return new Date(iso).getTime();
}

const HOUR = 3_600_000;

export function EventDetailContent() {
  const activeId = useWorkspacesStore((s) => s.activeId);
  const selectedEventId = useCalendarStore((s) => s.selectedEventId);
  const events = useCalendarStore((s) => s.events);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const clearSelection = useCalendarStore((s) => s.clearSelection);

  const event = events.find((e) => e.id === selectedEventId);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [start, setStart] = useState(event ? fmtDate(event.start) : "");
  const [end, setEnd] = useState(event ? fmtDate(event.end) : "");
  const [url, setUrl] = useState(event?.url ?? "");
  const [color, setColor] = useState(event?.color ?? "");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setStart(fmtDate(event.start));
      setEnd(fmtDate(event.end));
      setUrl(event.url ?? "");
      setColor(event.color ?? "");
    }
  }, [event?.id]);

  if (!event) return null;

  const handleSave = async () => {
    if (!activeId) return;
    const startTs = parseLocalDate(start);
    // Guard: an end at or before the start is meaningless — clamp to +1h.
    let endTs = parseLocalDate(end);
    if (!Number.isFinite(endTs) || endTs <= startTs) endTs = startTs + HOUR;

    await updateEvent(activeId, event.id, {
      title: title.trim() || "Untitled Event",
      description: description || undefined,
      start: startTs,
      end: endTs,
      url: url || undefined,
      color: color || undefined,
    });
    clearSelection();
  };

  const handleDelete = async () => {
    if (!activeId) return;
    await deleteEvent(activeId, event.id);
  };

  return (
    <>
      <div className="docpanel-head">
        <div className="docpanel-tag">
          <span className="dot" style={color ? { background: color } : undefined} />
          EVENT · {event.id.slice(0, 6)}
        </div>
        <div className="docpanel-actions">
          <button type="button" className="docpanel-btn" title="Delete" onClick={handleDelete}>
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 4.5h8M5.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5v7a1 1 0 001 1h3a1 1 0 001-1v-7" />
            </svg>
          </button>
          <button type="button" className="docpanel-btn" title="Close" onClick={clearSelection}>
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
      </div>
      <div className="docpanel-body">
        <textarea
          className="docpanel-title"
          rows={1}
          value={title}
          placeholder="Event title"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        <div className="event-detail-section">
          <span className="event-detail-section-label">When</span>
          <div className="event-detail-when">
            <label className="event-detail-field">
              <span className="event-detail-field-k">Start</span>
              <input
                type="datetime-local"
                className="event-detail-input"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label className="event-detail-field">
              <span className="event-detail-field-k">End</span>
              <input
                type="datetime-local"
                className="event-detail-input"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="event-detail-section">
          <span className="event-detail-section-label">Color</span>
          <div className="event-detail-swatches">
            {EVENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`event-detail-swatch${color === c ? " is-active" : ""}`}
                style={{ background: c, color: c }}
                title={c}
                aria-label={`Set color ${c}`}
                onClick={() => setColor((prev) => (prev === c ? "" : c))}
              />
            ))}
          </div>
        </div>
        <div className="event-detail-section">
          <span className="event-detail-section-label">Description</span>
          <textarea
            className="event-detail-textarea"
            rows={4}
            value={description}
            placeholder="Add a description…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="event-detail-section">
          <span className="event-detail-section-label">URL</span>
          <input
            type="url"
            className="event-detail-input"
            value={url}
            placeholder="https://…"
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="event-detail-actions">
          <button type="button" className="event-detail-cancel-btn" onClick={clearSelection}>
            Cancel
          </button>
          <button type="button" className="event-detail-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}
