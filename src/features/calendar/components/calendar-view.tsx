"use client";

import { useEffect, useRef } from "react";
import { useCalendarStore } from "../store/calendar.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { CalendarWidget } from "./calendar-widget";

export function CalendarView() {
  const isOpen = useCalendarStore((s) => s.isOpen);
  const closeCalendar = useCalendarStore((s) => s.closeCalendar);
  const events = useCalendarStore((s) => s.events);
  const isLoading = useCalendarStore((s) => s.isLoading);
  const fetchEvents = useCalendarStore((s) => s.fetchEvents);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const selectEvent = useCalendarStore((s) => s.selectEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !activeId || fetchedRef.current) return;
    fetchedRef.current = true;
    if (events.length === 0) {
      fetchEvents(activeId);
    }
  }, [isOpen, activeId, fetchEvents, events.length]);

  useEffect(() => {
    if (!isOpen) {
      fetchedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCalendar();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeCalendar]);

  const handleDateClick = async (start: number) => {
    if (!activeId) return;
    // Create the event but leave the detail panel closed — it only opens when
    // the user explicitly clicks an existing event.
    await addEvent(activeId, {
      title: "New Event",
      start,
      end: start + 3_600_000,
    });
  };

  const handleRangeSelect = async (start: number, end: number) => {
    if (!activeId) return;
    await addEvent(activeId, { title: "New Event", start, end });
  };

  const handleEventClick = (eventId: string) => {
    selectEvent(eventId);
  };

  const handleEventDrop = async (eventId: string, newStart: number, newEnd: number) => {
    if (!activeId) return;
    await updateEvent(activeId, eventId, { start: newStart, end: newEnd });
  };

  if (!isOpen) return null;

  return (
    <div className="calendar-overlay" onClick={closeCalendar}>
      <div className="calendar-overlay-content" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-overlay-head">
          <span className="calendar-overlay-title">Calendar</span>
          <span className="calendar-overlay-count">
            {isLoading ? "loading…" : `${events.length} event${events.length === 1 ? "" : "s"}`}
          </span>
          <span className="calendar-overlay-hint">drag a range to add · click an event to edit</span>
          <button type="button" className="calendar-overlay-close" onClick={closeCalendar} title="Close (Esc)">
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
        <div className="calendar-overlay-body">
          <CalendarWidget
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onRangeSelect={handleRangeSelect}
          />
        </div>
      </div>
    </div>
  );
}
