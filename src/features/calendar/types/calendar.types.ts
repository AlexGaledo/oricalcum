export interface CalendarEvent {
  id: string;
  title: string;
  start: number;
  end: number;
  allDay: boolean;
  description?: string;
  color?: string;
  url?: string;
  projectId: string;
  createdAt: number;
  updatedAt: number;
}
