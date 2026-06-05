"use client";

import { useState, useEffect, useRef } from "react";
import { useCalendarStore } from "../store/calendar.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";

const HOUR = 3_600_000;

const pad = (n: number) => String(n).padStart(2, "0");

const fmtDate = (ts?: number) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function parseLocalDate(iso: string): number {
  return new Date(iso).getTime();
}

export function EventPopup() {
  const activeId = useWorkspacesStore((s) => s.activeId);
  const popupMode = useCalendarStore((s) => s.popupMode);
  const popupEventId = useCalendarStore((s) => s.popupEventId);
  const popupCreateTime = useCalendarStore((s) => s.popupCreateTime);
  const events = useCalendarStore((s) => s.events);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const closePopup = useCalendarStore((s) => s.closePopup);

  const existingEvent = popupMode === "edit" && popupEventId
    ? events.find((e) => e.id === popupEventId)
    : null;

  const [title, setTitle] = useState(existingEvent?.title ?? "");
  const [start, setStart] = useState(
    existingEvent ? fmtDate(existingEvent.start) : popupCreateTime ? fmtDate(popupCreateTime.start) : "",
  );
  const [end, setEnd] = useState(
    existingEvent ? fmtDate(existingEvent.end) : popupCreateTime ? fmtDate(popupCreateTime.end) : "",
  );
  const [description, setDescription] = useState(existingEvent?.description ?? "");
  const [url, setUrl] = useState(existingEvent?.url ?? "");
  const [color, setColor] = useState(existingEvent?.color ?? "");
  const [saving, setSaving] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (popupMode === "create") {
      setTitle("");
      setStart(popupCreateTime ? fmtDate(popupCreateTime.start) : "");
      setEnd(popupCreateTime ? fmtDate(popupCreateTime.end) : "");
      setDescription("");
      setUrl("");
      setColor("");
    } else if (existingEvent) {
      setTitle(existingEvent.title);
      setStart(fmtDate(existingEvent.start));
      setEnd(fmtDate(existingEvent.end));
      setDescription(existingEvent.description ?? "");
      setUrl(existingEvent.url ?? "");
      setColor(existingEvent.color ?? "");
    }
  }, [popupMode, popupEventId, popupCreateTime?.start, popupCreateTime?.end]);

  useEffect(() => {
    if (popupMode && titleRef.current) {
      titleRef.current.focus();
    }
  }, [popupMode]);

  useEffect(() => {
    if (!popupMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [popupMode, closePopup]);

  if (!popupMode) return null;

  const isCreate = popupMode === "create";
  const isEdit = popupMode === "edit";

  const handleSave = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      const startTs = parseLocalDate(start);
      let endTs = parseLocalDate(end);
      if (!Number.isFinite(endTs) || endTs <= startTs) endTs = startTs + HOUR;

      if (isCreate) {
        await addEvent(activeId, {
          title: title.trim() || "New Event",
          start: startTs,
          end: endTs,
          color: color || undefined,
        });
      } else if (isEdit && popupEventId) {
        await updateEvent(activeId, popupEventId, {
          title: title.trim() || "Untitled Event",
          description: description || undefined,
          start: startTs,
          end: endTs,
          url: url || undefined,
          color: color || undefined,
        });
      }
      closePopup();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeId || !popupEventId) return;
    setSaving(true);
    try {
      await deleteEvent(activeId, popupEventId);
      closePopup();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="event-popup-backdrop" onClick={closePopup} />
      <div className={`event-popup ${isEdit ? "event-popup--wide" : ""}`}>
        <div className="event-popup-head">
          <span className="event-popup-title">{isCreate ? "Create event" : "Edit event"}</span>
          <button type="button" className="event-popup-close" onClick={closePopup}>
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
        <div className="event-popup-body">
          <textarea
            ref={titleRef}
            className="event-popup-title-input"
            rows={1}
            value={title}
            placeholder="Add title"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          <div className="event-popup-row">
            <span className="event-popup-label">Start</span>
            <input
              type="datetime-local"
              className="event-popup-input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="event-popup-row">
            <span className="event-popup-label">End</span>
            <input
              type="datetime-local"
              className="event-popup-input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          {isEdit && (
            <>
              <div className="event-popup-row">
                <span className="event-popup-label">Description</span>
                <textarea
                  className="event-popup-textarea"
                  rows={3}
                  value={description}
                  placeholder="Add description…"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="event-popup-row">
                <span className="event-popup-label">URL</span>
                <input
                  type="url"
                  className="event-popup-input"
                  value={url}
                  placeholder="https://…"
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <div className="event-popup-foot">
          {isEdit && (
            <button type="button" className="event-popup-delete-btn" onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          )}
          <div className="event-popup-foot-right">
            <button type="button" className="event-popup-cancel-btn" onClick={closePopup}>
              Cancel
            </button>
            <button type="button" className="event-popup-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : isCreate ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
