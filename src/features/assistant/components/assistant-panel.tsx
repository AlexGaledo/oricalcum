"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { uploadMedia } from "@/data/api/endpoints/storage.api";
import { useAssistantStore } from "../store/assistant.store";
import { ChatMarkdown } from "./chat-markdown";

function AttachIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="assistant-attach-icon">
      <path d="M21.4 11.6 l-8.5 8.5 a5 5 0 0 1 -7 -7 l8.5 -8.5 a3 3 0 0 1 4.2 4.2 l-8.5 8.5 a1 1 0 0 1 -1.4 -1.4 l8.5 -8.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="assistant-spark-icon">
      <path d="M12 3 l1.8 5 L19 9.8 L14 11.6 L12 17 L10 11.6 L5 9.8 L10.2 8 Z" />
      <path d="M18.5 15 l.7 2 l2 .7 l-2 .7 l-.7 2 l-.7 -2 l-2 -.7 l2 -.7 Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="assistant-send-icon">
      <path d="M3.5 12 L20.5 12 M15 5 L21 12 L15 19" />
    </svg>
  );
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

export function AssistantPanel() {
  const activeId = useWorkspacesStore((s) => s.activeId);
  const hideAll = useThemeStore((s) => s.hideAllUi);

  const open = useAssistantStore((s) => s.open);
  const toggle = useAssistantStore((s) => s.toggle);
  const messages = useAssistantStore((s) => s.messages);
  const streaming = useAssistantStore((s) => s.streaming);
  const send = useAssistantStore((s) => s.send);
  const cancel = useAssistantStore((s) => s.cancel);
  const clear = useAssistantStore((s) => s.clear);

  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // autoscroll to newest message / token
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (hideAll || !activeId) return null;

  const submit = () => {
    const text = draft.trim();
    if (!text || streaming) return;
    send(activeId, text);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") toggle();
  };

  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Attach a file: upload to storage, drop a markdown link into the draft.
  const onAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeId || uploading) return;
    setUploading(true);
    try {
      const url = await uploadMedia(activeId, file);
      setDraft((d) => `${d ? d + " " : ""}[${file.name}](${url})`);
      inputRef.current?.focus();
    } catch {
      // ignore upload failure
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="assistant-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <div className="assistant-header">
              <span className="assistant-title">
                <SparkIcon /> Assistant
              </span>
              <div className="assistant-header-actions">
                {messages.length > 0 && (
                  <button type="button" className="assistant-ghost-btn" onClick={clear} title="Clear conversation">
                    Clear
                  </button>
                )}
                <button type="button" className="assistant-ghost-btn" onClick={toggle} aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            <div className="assistant-messages" ref={listRef}>
              {messages.length === 0 && (
                <div className="assistant-empty">
                  Ask about this workspace, create nodes or tasks, or schedule a meeting.
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`assistant-msg assistant-msg-${m.role}`}>
                  <div className="assistant-bubble">
                    {m.content ? (
                      m.role === "assistant" ? (
                        <ChatMarkdown text={m.content} />
                      ) : (
                        m.content
                      )
                    ) : m.pending ? (
                      <Dots />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="assistant-input-row">
              <input
                ref={fileRef}
                type="file"
                hidden
                onChange={onAttach}
              />
              <button
                type="button"
                className="assistant-attach-btn"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || streaming}
                title={uploading ? "Uploading…" : "Attach file"}
                aria-label="Attach file"
              >
                <AttachIcon />
              </button>
              <textarea
                ref={inputRef}
                className="assistant-input"
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
                <button type="button" className="assistant-stop-btn" onClick={cancel} title="Stop">
                  <span className="assistant-stop-square" />
                </button>
              ) : (
                <button
                  type="button"
                  className="assistant-send-btn"
                  onClick={submit}
                  disabled={!draft.trim()}
                  title="Send"
                >
                  <SendIcon />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
