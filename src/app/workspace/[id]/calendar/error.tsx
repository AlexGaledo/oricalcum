"use client";

import { ChunkErrorFallback } from "@/shared/components/ui/chunk-error-fallback";

export default function CalendarError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ChunkErrorFallback error={error} reset={reset} title="Calendar failed to load" />;
}
