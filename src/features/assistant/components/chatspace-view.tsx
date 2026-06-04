"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAssistantStore } from "../store/assistant.store";

interface Props {
  workspaceId: string;
}

function Dots() {
  return (
    <span className="assistant-dots">
      <span className="assistant-dot" />
      <span className="assistant-dot" />
      <span className="assistant-dot" />
    </span>
  );
}

/**
 * Full-page AI chat for the workspace hub. Shares the same assistant store as
 * the canvas spark-FAB, so the conversation is continuous across surfaces.
 */
export function ChatspaceView({ workspaceId }: Props) {
  const messages = useAssistantStore((s) => s.messages);
  const streaming = useAssistantStore((s) => s.streaming);
  const send = useAssistantStore((s) => s.send);
  const cancel = useAssistantStore((s) => s.cancel);
  const clear = useAssistantStore((s) => s.clear);

  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const submit = () => {
    const text = draft.trim();
    if (!text || streaming) return;
    send(workspaceId, text);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="hub-view chatspace">
      <div className="hub-eyebrow">// AI_CHATSPACE</div>
      <div className="hub-section-head">
        <h2 className="hub-section-title">AI Chatspace</h2>
        {messages.length > 0 && (
          <button type="button" className="hub-btn ghost" onClick={clear}>
            Clear
          </button>
        )}
      </div>

      <div className="chatspace-messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="hub-empty">
            Ask about this workspace, generate nodes, or schedule a meeting — the assistant
            can act on the canvas directly.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`chatspace-msg chatspace-msg-${m.role}`}>
            <div className="chatspace-bubble">
              {m.content || (m.pending ? <Dots /> : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="chatspace-input-row">
        <textarea
          ref={inputRef}
          className="chatspace-input"
          value={draft}
          placeholder="Message the assistant…"
          rows={1}
          onChange={(e) => {
            setDraft(e.target.value);
            autoResize();
          }}
          onKeyDown={onKeyDown}
        />
        {streaming ? (
          <button type="button" className="hub-btn ghost" onClick={cancel}>
            Stop
          </button>
        ) : (
          <button type="button" className="hub-btn" onClick={submit} disabled={!draft.trim()}>
            Send
          </button>
        )}
      </div>
    </div>
  );
}
