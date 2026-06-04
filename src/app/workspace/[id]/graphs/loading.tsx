/**
 * Suspense fallback for the graphs canvas route. The canvas has no persistent
 * chrome, so this is a full-screen splash matching the app boot LoadingScreen.
 */
export default function GraphsLoading() {
  return (
    <div className="loading-screen">
      <div className="loading-screen-inner">
        <div className="loading-screen-spinner" />
      </div>
    </div>
  );
}
