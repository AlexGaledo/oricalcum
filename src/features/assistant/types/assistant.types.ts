export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** True while the assistant message is still streaming in. */
  pending?: boolean;
}

export interface AssistantState {
  open: boolean;
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
}
