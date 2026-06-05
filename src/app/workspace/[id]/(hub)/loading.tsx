/**
 * Suspense fallback for hub subroutes. Renders inside (hub)/layout.tsx, so it
 * fills only the main content area while the sidebar + breadcrumbs stay mounted —
 * no frozen blank during route transitions / dev on-demand compilation.
 */
export default function HubLoading() {
  return (
    <div className="hub-loading">
      <div className="loading-screen-spinner" />
    </div>
  );
}
