/**
 * Suspense fallback for the calendar route.
 * Shows a skeleton header + grid placeholder while FullCalendar chunks load.
 */
export default function CalendarLoading() {
  return (
    <div className="calendar-loading">
      <div className="calendar-loading-head">
        <div className="calendar-loading-back skeleton" />
        <div className="calendar-loading-title skeleton" />
        <div className="calendar-loading-count skeleton" />
      </div>
      <div className="calendar-loading-grid">
        <div className="calendar-loading-grid-row">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="calendar-loading-grid-cell" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="calendar-loading-grid-row">
            {Array.from({ length: 7 }).map((_, c) => (
              <div key={c} className="calendar-loading-grid-cell">
                <div className="calendar-loading-grid-day skeleton" />
                <div className="calendar-loading-grid-dot skeleton" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
