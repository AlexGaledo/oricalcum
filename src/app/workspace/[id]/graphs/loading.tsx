/**
 * Suspense fallback for the graphs canvas route.
 * Shows a skeleton canvas chrome while heavy chunks (editor, AI panels) load.
 */
export default function GraphsLoading() {
  return (
    <div className="graphs-loading">
      <div className="graphs-loading-topbar">
        <div className="graphs-loading-logo skeleton" />
        <div className="graphs-loading-actions">
          <div className="graphs-loading-pill skeleton" />
          <div className="graphs-loading-pill skeleton" />
        </div>
      </div>
      <div className="graphs-loading-canvas">
        <div className="graphs-loading-grid" />
      </div>
      <div className="graphs-loading-toolbar">
        <div className="graphs-loading-tool skeleton" />
        <div className="graphs-loading-tool skeleton" />
        <div className="graphs-loading-tool skeleton" />
      </div>
      <div className="graphs-loading-status">
        <div className="graphs-loading-chip skeleton" />
        <div className="graphs-loading-chip skeleton" />
      </div>
      <div className="graphs-loading-spinner-wrap">
        <div className="loading-screen-spinner" />
      </div>
    </div>
  );
}
