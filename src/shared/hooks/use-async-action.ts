"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Wraps an async action with a re-entry guard so it can't double-run on rapid
 * double-clicks. The `useRef` flag blocks re-entry synchronously (before React
 * re-renders the disabled state), while `pending` drives button UI.
 *
 *   const { run, pending } = useAsyncAction(handleCreate);
 *   <button disabled={pending} onClick={() => run(args)}>…</button>
 */
export function useAsyncAction<A extends unknown[]>(
  fn: (...args: A) => Promise<unknown> | unknown,
) {
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: A) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setPending(true);
      try {
        await fn(...args);
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [fn],
  );

  return { run, pending };
}
