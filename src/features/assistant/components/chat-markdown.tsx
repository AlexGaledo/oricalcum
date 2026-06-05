import { renderChatMarkdown } from "@/shared/lib/markdown";

/**
 * Renders an assistant message as markdown (`**bold**`, headings, lists, code).
 * HTML is escaped before parsing — see renderChatMarkdown — so echoed node text
 * can't inject markup. Shared by the hub chatspace and the canvas spark panel.
 */
export function ChatMarkdown({ text }: { text: string }) {
  return (
    <div
      className="chat-md"
      dangerouslySetInnerHTML={{ __html: renderChatMarkdown(text) }}
    />
  );
}
