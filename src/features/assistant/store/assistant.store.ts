"use client";

import { create } from "zustand";
import { streamChat } from "@/data/api/endpoints/chat.api";
import { useCanvasStore } from "@/features/canvas";
import { useCalendarStore } from "@/features/calendar/store/calendar.store";
import { useFilesStore } from "@/features/files/store/files.store";
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

    // Tell the assistant which nodespaces (explorer files) exist and which is
    // open, so it can identify them by title. Only the open one's nodes are
    // loaded server-side, so it acts there and asks to switch for others.
    const fs = useFilesStore.getState();
    const files = fs.tree.filter((n) => n.kind === "file");
    const context = {
      active: files.find((f) => f.id === fs.activeFileId)?.name ?? null,
      names: files.map((f) => f.name),
    };

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
        // Pull the canvas and calendar back into sync.
        useCanvasStore.getState().requestReload();
        void useCalendarStore.getState().fetchEvents(projectId);
      },
    }, context);
  },
}));
