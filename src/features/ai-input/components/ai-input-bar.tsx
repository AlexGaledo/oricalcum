"use client";

import { useRef, useEffect, useState, useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiInputStore } from "../store/ai-input.store";
import { useCanvasStore } from "@/features/canvas";
import { useAssistantStore } from "@/features/assistant/store/assistant.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" className="ai-grip-icon">
      <path d="M5 4 L5 4.01 M5 8 L5 8.01 M5 12 L5 12.01 M11 4 L11 4.01 M11 8 L11 8.01 M11 12 L11 12.01" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="ai-send-icon">
      <path d="M3.5 12 L20.5 12 M15 5 L21 12 L15 19" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="ai-mic-icon">
      <path d="M12 2 a3 3 0 0 0 -3 3 v6 a3 3 0 0 0 6 0 v-6 a3 3 0 0 0 -3 -3 Z" />
      <path d="M19 10 v1 a7 7 0 0 1 -14 0 v-1" />
      <path d="M12 19 v3" />
    </svg>
  );
}

function AttachIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="ai-attach-icon">
      <path d="M21.4 11.6 l-8.5 8.5 a5 5 0 0 1 -7 -7 l8.5 -8.5 a3 3 0 0 1 4.2 4.2 l-8.5 8.5 a1 1 0 0 1 -1.4 -1.4 l8.5 -8.5" />
    </svg>
  );
}

function DotsLoader() {
  return (
    <span className="ai-dots">
      <span className="ai-dot" />
      <span className="ai-dot" />
      <span className="ai-dot" />
    </span>
  );
}

export function AiInputBar() {
  const input = useAiInputStore((s) => s.input);
  const setInput = useAiInputStore((s) => s.setInput);
  const pushHistory = useAiInputStore((s) => s.pushHistory);
  const cycleHistory = useAiInputStore((s) => s.cycleHistory);
  const openDocId = useCanvasStore((s) => s.openDocId);
  const aiBarPosX = useCanvasStore((s) => s.aiBarPosX);
  const setAiBarPosX = useCanvasStore((s) => s.setAiBarPosX);
  // Drive the bar off the real assistant: stream a turn to the backend agent,
  // which mutates the canvas server-side (MCP tools) and triggers a reload.
  const activeId = useWorkspacesStore((s) => s.activeId);
  const streaming = useAssistantStore((s) => s.streaming);
  const send = useAssistantStore((s) => s.send);
  const isProcessing = streaming;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [ghostX, setGhostX] = useState<number | null>(null);
  const grabOffsetRef = useRef(0);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!openDocId) {
      textareaRef.current?.focus();
    }
  }, [openDocId]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || isProcessing || !activeId) return;
    pushHistory(text);
    send(activeId, text);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "ArrowUp" && !e.shiftKey) {
      e.preventDefault();
      const val = cycleHistory("up");
      if (val !== null) setInput(val);
    }
    if (e.key === "ArrowDown" && !e.shiftKey) {
      e.preventDefault();
      const val = cycleHistory("down");
      if (val !== null) setInput(val);
    }
    if (e.key === "Escape") {
      textareaRef.current?.blur();
    }
  }

  const onGripDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    grabOffsetRef.current = e.clientX - rect.left;
    setGhostX(e.clientX - grabOffsetRef.current);
  }, []);

  useEffect(() => {
    if (ghostX === null) return;
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const barW = barRef.current?.getBoundingClientRect().width ?? 640;
      const maxX = window.innerWidth - barW - 8;
      setGhostX(Math.max(8, Math.min(maxX, e.clientX - grabOffsetRef.current)));
    };
    const handleMouseUp = (e: globalThis.MouseEvent) => {
      const barW = barRef.current?.getBoundingClientRect().width ?? 640;
      const maxX = window.innerWidth - barW - 8;
      const finalX = Math.max(8, Math.min(maxX, e.clientX - grabOffsetRef.current));
      if (Math.abs(finalX - window.innerWidth / 2 + barW / 2) < 20) {
        setAiBarPosX(null);
      } else {
        setAiBarPosX(finalX);
      }
      setGhostX(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ghostX, setAiBarPosX]);

  const isDragging = ghostX !== null;
  const positionedX = isDragging ? ghostX : aiBarPosX;

  return (
    <AnimatePresence>
      {!isProcessing && (
        <motion.div
          ref={barRef}
          className={`ai-bar ${focused ? "ai-bar-focused" : ""} ${isDragging ? "ai-bar-dragging" : ""}`}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            left: positionedX !== null ? positionedX : "50%",
            transform: positionedX !== null ? "none" : "translateX(-50%)",
          }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.3, 0.7, 0.4, 1] }}
        >
          <div className="ai-bar-inner">
            <button
              type="button"
              className="ai-grip"
              onMouseDown={onGripDown}
              aria-label="Drag input bar"
            >
              <GripIcon />
            </button>
            <textarea
              ref={textareaRef}
              className="ai-input"
              placeholder="Prompt AI — e.g. design a user authentication flow..."
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={isProcessing}
            />
            <div className="ai-actions">
              <button className="ai-action-btn" title="Attach file" disabled={isProcessing}>
                <AttachIcon />
              </button>
              <button className="ai-action-btn" title="Voice input" disabled={isProcessing}>
                <MicIcon />
              </button>
              <button
                className="ai-send-btn"
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                title="Send prompt"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {isProcessing && (
        <motion.div
          className="ai-bar ai-bar-processing"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}
        >
          <div className="ai-bar-inner">
            <div className="ai-processing-row">
              <DotsLoader />
              <span className="ai-processing-label">working…</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
