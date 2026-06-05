/**
 * Suspense fallback for hub subroutes. Renders inside (hub)/layout.tsx, so it
 * fills only the main content area while the sidebar + breadcrumbs stay mounted.
 */
export default function HubLoading() {
  return (
    <div className="hub-loading">
      <div className="hub-loading-breadcrumbs">
        <div className="hub-loading-crumb skeleton" />
        <div className="hub-loading-crumb is-short skeleton" />
      </div>
      <div className="hub-loading-content">
        <div className="hub-loading-card skeleton" />
        <div className="hub-loading-card skeleton" />
        <div className="hub-loading-card is-narrow skeleton" />
      </div>
    </div>
  );
}
