import { apiClient } from "./api-client";

/** Nodespace awareness passed to the assistant each turn. Nodespaces are the
 *  files in the explorer; only the active one's nodes are loaded server-side. */
export interface ChatContext {
  /** Name (title) of the currently open nodespace. */
  active: string | null;
  /** Titles of every nodespace (file) in this workspace. */
  names: string[];
}

export interface ChatStreamHandlers {
  /** Called for each streamed token delta from the assistant. */
  onToken: (delta: string) => void;
  /** Called once with the server's error message if the turn fails. */
  onError?: (message: string) => void;
  /** Called when the stream terminates (success or handled error). */
  onDone?: () => void;
}

/**
 * Stream a chat turn from the workspace assistant.
 *
 * Consumes the backend SSE stream at `POST /projects/{id}/chat`, whose frames are:
 *   data: {"delta": "..."}    token chunk
 *   event: error\ndata: {...} turn failed
 *   event: done\ndata: {}     stream finished
 *
 * Returns a function that aborts the in-flight stream.
 */
export function streamChat(
  projectId: string,
  message: string,
  handlers: ChatStreamHandlers,
  context?: ChatContext,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await apiClient.stream(
        `/projects/${projectId}/chat`,
        { message, context },
        controller.signal,
      );
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          handleFrame(frame, handlers);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return; // caller cancelled — silent
      handlers.onError?.(err instanceof Error ? err.message : "Stream failed");
    } finally {
      handlers.onDone?.();
    }
  })();

  return () => controller.abort();
}

function handleFrame(frame: string, handlers: ChatStreamHandlers): void {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return;

  const raw = dataLines.join("\n");
  if (event === "error") {
    try {
      handlers.onError?.(JSON.parse(raw).message ?? "Assistant error");
    } catch {
      handlers.onError?.(raw);
    }
    return;
  }
  if (event === "done") return;

  // default "message" event = token delta
  try {
    const { delta } = JSON.parse(raw) as { delta?: string };
    if (delta) handlers.onToken(delta);
  } catch {
    /* ignore malformed frame */
  }
}
