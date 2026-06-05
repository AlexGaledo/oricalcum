import { marked, Marked } from "marked";

const MARKDOWN_PATTERN =
  /^[ \t]*[#*>\-|`~!\[\]()]|[*_]{2}|__|~~|```|\[.*\]\(|!\[.*\]\(/m;

const HTML_TAG = /<[a-z\d][\s\S]*?>/i;

export function looksLikeMarkdown(text: string): boolean {
  if (!text) return false;
  if (HTML_TAG.test(text)) return false;
  return MARKDOWN_PATTERN.test(text);
}

export function renderMarkdown(text: string): string {
  if (!text) return "";
  return marked.parse(text, { async: false }) as string;
}

/** Escape raw HTML so injected tags can't execute, then render markdown. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Allowed URL schemes for markdown links / images. Anything else (notably
// `javascript:`, `vbscript:`, `data:text/html`) is neutralized so a crafted
// link the assistant echoes can't run script when clicked.
const SAFE_LINK = /^(https?:|mailto:|tel:|#|\/|\.)/i;
const SAFE_IMAGE = /^(https?:|data:image\/)/i;

/**
 * Hardened markdown renderer for AI chat. Two layers of XSS defense since the
 * project has no DOMPurify and the assistant can echo arbitrary node text:
 *  1. raw HTML is escaped before parsing (no `<script>`/`<img onerror>`),
 *  2. `walkTokens` strips dangerous URL schemes from links/images.
 * (DOMPurify would be the heavier, more thorough alternative if added later.)
 */
const chatMarked = new Marked({ breaks: true });
chatMarked.use({
  walkTokens(token) {
    if (token.type === "link" && token.href && !SAFE_LINK.test(token.href.trim())) {
      token.href = "#";
    }
    if (token.type === "image" && (!token.href || !SAFE_IMAGE.test(token.href.trim()))) {
      token.href = "";
    }
  },
});

/**
 * Markdown for AI chat bubbles. `**bold**`, headings, lists and code render;
 * `breaks: true` keeps single newlines as line breaks. See chatMarked above for
 * the XSS hardening.
 */
export function renderChatMarkdown(text: string): string {
  if (!text) return "";
  return chatMarked.parse(escapeHtml(text), { async: false }) as string;
}
