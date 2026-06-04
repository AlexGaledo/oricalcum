"use client";

import { useRef, useEffect } from "react";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarEvent } from "../types/calendar.types";

interface Props {
  events: CalendarEvent[];
  onDateClick: (start: number) => void;
  onEventClick: (eventId: string) => void;
  onEventDrop?: (eventId: string, newStart: number, newEnd: number) => void;
  onRangeSelect?: (start: number, end: number) => void;
}

export function CalendarWidget({ events, onDateClick, onEventClick, onEventDrop, onRangeSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<Calendar | null>(null);

  // Keep latest handlers in refs — FullCalendar is instantiated once (empty
  // deps), so reading props directly would capture stale first-render closures.
  const handlers = useRef({ onDateClick, onEventClick, onEventDrop, onRangeSelect });
  handlers.current = { onDateClick, onEventClick, onEventDrop, onRangeSelect };

  // Zoom = pixel height per 1h slot in the time-grid views. Mutated directly on
  // the container CSS var so it never re-instantiates the calendar.
  const ZOOM_MIN = 28;
  const ZOOM_MAX = 120;
  const ZOOM_STEP = 16;
  const zoomRef = useRef(56);
  const applyZoom = (next: number) => {
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
    zoomRef.current = clamped;
    containerRef.current?.style.setProperty("--cal-slot-h", `${clamped}px`);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    if (calendarRef.current) {
      calendarRef.current.destroy();
    }

    const cal = new Calendar(containerRef.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      height: "100%",
      contentHeight: "100%",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "zoomOut,zoomIn dayGridMonth,timeGridWeek,timeGridDay",
      },
      customButtons: {
        zoomIn: {
          text: "+",
          hint: "Zoom in",
          click: () => applyZoom(zoomRef.current + ZOOM_STEP),
        },
        zoomOut: {
          text: "−",
          hint: "Zoom out",
          click: () => applyZoom(zoomRef.current - ZOOM_STEP),
        },
      },
      titleFormat: { year: "numeric", month: "short" },
      buttonText: { today: "Today", month: "Month", day: "Day", week: "Week" },
      dayMaxEvents: 3,
      weekNumberCalculation: "ISO",
      slotDuration: "01:00:00",
      slotLabelInterval: "01:00:00",
      slotMinTime: "00:00:00",
      slotMaxTime: "24:00:00",
      scrollTime: "08:00:00",
      expandRows: true,
      allDaySlot: false,
      nowIndicator: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      eventDurationEditable: true,
      eventStartEditable: true,
      eventResizableFromStart: true,
      eventTimeFormat: {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
      dateClick: (info) => {
        // In month view a single click drills into that day; in time views it
        // seeds a 1h event at the clicked slot.
        if (info.view.type === "dayGridMonth") {
          cal.changeView("timeGridDay", info.date);
        } else {
          handlers.current.onDateClick(info.date.getTime());
        }
      },
      select: (info) => {
        // Drag across slots (time views) to create an event spanning the range.
        if (info.view.type === "dayGridMonth") return;
        handlers.current.onRangeSelect?.(info.start.getTime(), info.end.getTime());
        cal.unselect();
      },
      eventClick: (info) => {
        // Events are only clickable in the hourly (time-grid) views. In month
        // view a click drills into the day instead of opening the detail panel.
        if (info.view.type === "dayGridMonth") {
          cal.changeView("timeGridDay", info.event.start ?? undefined);
          return;
        }
        handlers.current.onEventClick(info.event.id);
      },
      eventDrop: (info) => {
        const newStart = info.event.start?.getTime();
        const newEnd = info.event.end?.getTime();
        if (newStart && handlers.current.onEventDrop) {
          handlers.current.onEventDrop(info.event.id, newStart, newEnd ?? newStart + 3_600_000);
        }
      },
      eventResize: (info) => {
        const newStart = info.event.start?.getTime();
        const newEnd = info.event.end?.getTime();
        if (newStart && newEnd && handlers.current.onEventDrop) {
          handlers.current.onEventDrop(info.event.id, newStart, newEnd);
        }
      },
      eventDidMount: (info) => {
        if (info.event.backgroundColor) {
          info.el.style.setProperty("--fc-event-bg-color", info.event.backgroundColor);
          info.el.style.setProperty("--fc-event-border-color", info.event.backgroundColor);
        }
      },
    });

    calendarRef.current = cal;
    cal.render();
    applyZoom(zoomRef.current);

    return () => {
      cal.destroy();
      calendarRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cal = calendarRef.current;
    if (!cal) return;
    cal.removeAllEvents();
    for (const e of events) {
      cal.addEvent({
        id: e.id,
        title: e.title,
        start: new Date(e.start).toISOString(),
        end: new Date(e.end).toISOString(),
        allDay: e.allDay,
        backgroundColor: e.color ?? undefined,
      });
    }
  }, [events]);

  return <div ref={containerRef} className="calendar-widget" />;
}
