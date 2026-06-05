export { CalendarView } from "./components/calendar-view";
export { CalendarWidget } from "./components/calendar-widget";
export { EventPopup } from "./components/event-popup";
export { useCalendarStore } from "./store/calendar.store";
export type { CreateEventInput, UpdateEventInput, EventRange } from "./store/calendar.store";
export type { CalendarEvent } from "./types/calendar.types";

// Headless CRUD facade — for AI tools / programmatic callers.
export {
  calendarEventsService,
  listEvents,
  getEvent,
  queryEvents,
  refreshEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./services/calendar-events.service";
