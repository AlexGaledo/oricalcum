"use client";

import { create } from "zustand";
import { streamChat } from "@/data/api/endpoints/chat.api";
import { useCanvasStore } from "@/features/canvas";
import type { AssistantState, ChatMessage } from "../types/assistant.types";

interface AssistantStore extends AssistantState {
  toggle: () => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
  send: (projectId: string, text: string) => void;
  cancel: () => void;
}

let abort: (() => void) | null = null;

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const patchMessage = (
  messages: ChatMessage[],
  id: string,
  fn: (m: ChatMessage) => ChatMessage,
): ChatMessage[] => messages.map((m) => (m.id === id ? fn(m) : m));

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  open: false,
  messages: [],
  streaming: false,
  error: null,

  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),
  clear: () => set({ messages: [], error: null }),

  cancel: () => {
    abort?.();
    abort = null;
    set({ streaming: false });
  },

  send: (projectId, text) => {
    const content = text.trim();
    if (!content || get().streaming) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content };
    const replyId = uid();
    const replyMsg: ChatMessage = { id: replyId, role: "assistant", content: "", pending: true };

    set((s) => ({
      messages: [...s.messages, userMsg, replyMsg],
      streaming: true,
      error: null,
    }));

    abort = streamChat(projectId, content, {
      onToken: (delta) =>
        set((s) => ({
          messages: patchMessage(s.messages, replyId, (m) => ({
            ...m,
            content: m.content + delta,
          })),
        })),
      onError: (message) =>
        set((s) => ({
          error: message,
          messages: patchMessage(s.messages, replyId, (m) => ({
            ...m,
            content: m.content || `⚠️ ${message}`,
            pending: false,
          })),
        })),
      onDone: () => {
        abort = null;
        set((s) => ({
          streaming: false,
          messages: patchMessage(s.messages, replyId, (m) => ({ ...m, pending: false })),
        }));
        // The agent may have created/edited nodes or meetings server-side.
        // Pull the canvas back into sync.
        useCanvasStore.getState().requestReload();
      },
    });
  },
}));
