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
  onDateRightClick?: (date: number, x: number, y: number) => void;
  onEventRightClick?: (eventId: string, x: number, y: number) => void;
}

function renderDayBadges(cal: Calendar, container: HTMLElement, allEvents: CalendarEvent[]) {
  const dayStr = container.getAttribute("data-date");
  if (!dayStr) return;

  const dayEvents = allEvents.filter((e) => {
    const eStart = new Date(e.start).toISOString().slice(0, 10);
    const eEnd = new Date(e.end).toISOString().slice(0, 10);
    return dayStr >= eStart && dayStr <= eEnd;
  });

  let existing = container.querySelector(".fc-day-header-badges") as HTMLElement | null;
  if (!existing) {
    existing = document.createElement("div");
    existing.className = "fc-day-header-badges";
    container.appendChild(existing);
  }

  const colorCounts = new Map<string, number>();
  for (const e of dayEvents) {
    const color = e.color || "var(--accent)";
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  }

  existing.innerHTML = Array.from(colorCounts.entries())
    .map(
      ([color, count]) =>
        `<span class="fc-day-header-badge" style="background:${color};color:#fff">${count}</span>`
    )
    .join("");
}

function updateAllDayBadges(cal: Calendar, allEvents: CalendarEvent[]) {
  const headers = cal.el?.querySelectorAll<HTMLElement>(".fc-col-header-cell, .fc-daygrid-day");
  if (!headers) return;
  for (const h of headers) {
    renderDayBadges(cal, h, allEvents);
  }
}

export function CalendarWidget({
  events,
  onDateClick,
  onEventClick,
  onEventDrop,
  onRangeSelect,
  onDateRightClick,
  onEventRightClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<Calendar | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const handlers = useRef({
    onDateClick,
    onEventClick,
    onEventDrop,
    onRangeSelect,
    onDateRightClick,
    onEventRightClick,
  });
  handlers.current = {
    onDateClick,
    onEventClick,
    onEventDrop,
    onRangeSelect,
    onDateRightClick,
    onEventRightClick,
  };

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
        left: "today prev,next",
        center: "title",
        right: "dayGridMonth,timeGridCentered",
      },
      views: {
        dayGridMonth: {
          buttonText: "🪐",
        },
        timeGridCentered: {
          type: "timeGrid",
          buttonText: "🌙",
          duration: { days: 7 },
          visibleRange: (currentDate) => {
            const start = new Date(currentDate);
            start.setDate(start.getDate() - 3);
            const end = new Date(currentDate);
            end.setDate(end.getDate() + 4);
            return { start, end };
          },
        },
      },
      titleFormat: { year: "numeric", month: "short" },
      buttonText: { today: "Today" },
      dayMaxEvents: true,
      weekNumberCalculation: "ISO",
      slotDuration: "00:30:00",
      snapDuration: "00:30:00",
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
        if (info.view.type === "dayGridMonth") {
          cal.changeView("timeGridCentered", info.date);
        } else {
          handlers.current.onDateClick(info.date.getTime());
        }
      },
      select: (info) => {
        if (info.view.type === "dayGridMonth") {
          cal.unselect();
          return;
        }
        handlers.current.onRangeSelect?.(info.start.getTime(), info.end.getTime());
        cal.unselect();
      },
      eventClick: (info) => {
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
        info.el.setAttribute("data-event-id", info.event.id);
      },
      datesSet: () => {
        requestAnimationFrame(() => updateAllDayBadges(cal, eventsRef.current));
      },
    });

    calendarRef.current = cal;
    cal.render();
    applyZoom(zoomRef.current);

    // Container-level right-click handler
    const container = containerRef.current;
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Event right-click
      const eventEl = target.closest<HTMLElement>(".fc-event");
      if (eventEl) {
        const eventId = eventEl.getAttribute("data-event-id");
        if (eventId) {
          e.preventDefault();
          e.stopPropagation();
          handlers.current.onEventRightClick?.(eventId, e.clientX, e.clientY);
          return;
        }
      }

      // Month view day cell
      const dayCell = target.closest<HTMLElement>(".fc-daygrid-day");
      if (dayCell) {
        const dateStr = dayCell.getAttribute("data-date");
        if (dateStr) {
          e.preventDefault();
          e.stopPropagation();
          const date = new Date(dateStr + "T09:00:00");
          handlers.current.onDateRightClick?.(date.getTime(), e.clientX, e.clientY);
          return;
        }
      }

      // Time grid slot
      const timeSlot = target.closest<HTMLElement>(".fc-timegrid-slot, .fc-timegrid-slot-lane, .fc-timegrid-col-frame");
      if (timeSlot) {
        const col = target.closest<HTMLElement>(".fc-timegrid-col");
        if (col) {
          const dateStr = col.getAttribute("data-date");
          const timeEl = target.closest<HTMLElement>(".fc-timegrid-slot");
          const timeStr = timeEl?.getAttribute("data-time");
          if (dateStr) {
            e.preventDefault();
            e.stopPropagation();
            const date = timeStr
              ? new Date(`${dateStr}T${timeStr}`)
              : new Date(dateStr + "T09:00:00");
            handlers.current.onDateRightClick?.(date.getTime(), e.clientX, e.clientY);
          }
        }
      }
    };

    container.addEventListener("contextmenu", handleContextMenu);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
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

    requestAnimationFrame(() => updateAllDayBadges(cal, events));
  }, [events]);

  return <div ref={containerRef} className="calendar-widget" />;
}
