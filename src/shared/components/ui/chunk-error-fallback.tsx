"use client";

import { useEffect } from "react";

interface ChunkErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

function isChunkError(err: Error): boolean {
  return (
    err.message?.includes("Loading chunk") ||
    err.message?.includes("Loading CSS chunk") ||
    err.message?.includes("load chunk") ||
    err.name === "ChunkLoadError"
  );
}

export function ChunkErrorFallback({ error, reset, title = "Something went wrong" }: ChunkErrorFallbackProps) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  const chunkFailed = isChunkError(error);

  return (
    <div className="chunk-error-fallback">
      <div className="chunk-error-fallback-inner">
        <div className="chunk-error-fallback-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="chunk-error-fallback-title">{title}</h2>
        <p className="chunk-error-fallback-msg">
          {chunkFailed
            ? "A script failed to load. This usually happens after a new deployment."
            : error.message || "An unexpected error occurred."}
        </p>
        <div className="chunk-error-fallback-actions">
          <button type="button" className="chunk-error-fallback-btn" onClick={reset}>
            Try again
          </button>
          {chunkFailed && (
            <button
              type="button"
              className="chunk-error-fallback-btn is-secondary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
