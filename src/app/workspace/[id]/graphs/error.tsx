"use client";

import { ChunkErrorFallback } from "@/shared/components/ui/chunk-error-fallback";

export default function GraphsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ChunkErrorFallback error={error} reset={reset} title="Canvas failed to load" />;
}
