"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCalendarStore } from "../store/calendar.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { CalendarWidget } from "./calendar-widget";
import { EventPopup } from "./event-popup";
import { EventDetailContent } from "./event-detail-content";
import { CalendarContextMenu } from "./calendar-context-menu";

export function CalendarView() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const closeCalendar = useCalendarStore((s) => s.closeCalendar);
  const events = useCalendarStore((s) => s.events);
  const isLoading = useCalendarStore((s) => s.isLoading);
  const fetchEvents = useCalendarStore((s) => s.fetchEvents);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const openPopup = useCalendarStore((s) => s.openPopup);
  const openEditPopup = useCalendarStore((s) => s.openEditPopup);
  const selectEvent = useCalendarStore((s) => s.selectEvent);
  const selectedEventId = useCalendarStore((s) => s.selectedEventId);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const fetchedRef = useRef(false);

  const projectId = activeId || id;

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: "event" | "date";
    data: string | number;
  }>({ visible: false, x: 0, y: 0, type: "date", data: 0 });

  useEffect(() => {
    if (!projectId || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchEvents(projectId);
  }, [projectId, fetchEvents]);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleDateClick = async (start: number) => {
    if (!projectId) return;
    openPopup("create", { start, end: start + HOUR });
  };

  const handleRangeSelect = async (start: number, end: number) => {
    if (!projectId) return;
    openPopup("create", { start, end });
  };

  const handleEventClick = (eventId: string) => {
    selectEvent(eventId);
  };

  const handleEventDrop = async (eventId: string, newStart: number, newEnd: number) => {
    if (!projectId) return;
    await updateEvent(projectId, eventId, { start: newStart, end: newEnd });
  };

  const handleDateRightClick = (date: number, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, type: "date", data: date });
  };

  const handleEventRightClick = (eventId: string, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, type: "event", data: eventId });
  };

  const handleBack = () => {
    closeCalendar();
    router.push(`/workspace/${projectId}/graphs`);
  };

  const contextMenuItems =
    contextMenu.type === "date"
      ? [
          {
            label: "New event",
            onClick: () => {
              const start = contextMenu.data as number;
              openPopup("create", { start, end: start + HOUR });
            },
          },
        ]
      : [
          {
            label: "Edit event",
            onClick: () => {
              const eventId = contextMenu.data as string;
              openEditPopup(eventId);
            },
          },
          {
            label: "Delete event",
            danger: true,
            onClick: async () => {
              if (!projectId) return;
              const eventId = contextMenu.data as string;
              await deleteEvent(projectId, eventId);
            },
          },
        ];

  return (
    <div className="calendar-page">
      <header className="calendar-page-head">
        <button type="button" className="calendar-page-back" onClick={handleBack}>
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3l-4 4 4 4" />
          </svg>
          Back to canvas
        </button>
        <div className="calendar-page-title-group">
          <span className="calendar-page-title">Calendar</span>
          <span className="calendar-page-count">
            {isLoading ? "loading…" : `${events.length} event${events.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </header>
      <div className="calendar-page-body">
        <CalendarWidget
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onRangeSelect={handleRangeSelect}
          onDateRightClick={handleDateRightClick}
          onEventRightClick={handleEventRightClick}
        />
      </div>
      <EventPopup />
      <CalendarContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={closeContextMenu}
      />
      <div className={`docpanel ${selectedEventId ? "is-open" : ""}`}>
        <EventDetailContent />
      </div>
    </div>
  );
}

const HOUR = 3_600_000;
