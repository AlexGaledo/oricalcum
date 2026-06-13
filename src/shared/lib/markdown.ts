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

/**
 * Detect the programming language of a raw text fragment.
 * Returns e.g. "json" when the text is valid JSON, or null if it is not code.
 */
export function detectCodeLanguage(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      return null;
    }
  }
  return null;
}

/** Pretty-print JSON when possible; otherwise return the original text. */
export function tryPrettyPrintJson(text: string): string {
  const trimmed = text.trim();
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return text;
  }
}

/**
 * Escape HTML for code-block content. Only escapes characters that would be
 * parsed as markup (`<`, `>`, `&`) so quotes stay readable as literal `"`.
 */
export function escapeCodeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escape raw HTML so injected tags can't execute, then render markdown. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Common LaTeX commands → plain Unicode. The model is told not to emit LaTeX,
// but Gemini sometimes does ("$\rightarrow$"); the chat has no KaTeX so we
// normalize it to readable text instead of showing raw source.
const LATEX_TOKENS: [string, string][] = [
  ["\\rightarrow", "→"],
  ["\\Rightarrow", "⇒"],
  ["\\leftarrow", "←"],
  ["\\Leftarrow", "⇐"],
  ["\\leftrightarrow", "↔"],
  ["\\to", "→"],
  ["\\times", "×"],
  ["\\cdot", "·"],
  ["\\leq", "≤"],
  ["\\geq", "≥"],
  ["\\neq", "≠"],
  ["\\approx", "≈"],
  ["\\pm", "±"],
];

/**
 * Turn inline LaTeX math into plain text. Only touches `$...$` / `$$...$$` spans
 * that contain a backslash command, so plain dollar amounts ($5, $10) are left
 * alone. Known commands map to Unicode; any leftover `\cmd` is dropped.
 */
function stripLatex(text: string): string {
  return text.replace(/\$\$?([^$\n]*?)\$\$?/g, (match, inner: string) => {
    if (!inner.includes("\\")) return match; // not LaTeX (e.g. currency)
    let s = inner;
    for (const [cmd, glyph] of LATEX_TOKENS) s = s.split(cmd).join(glyph);
    return s.replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "").trim();
  });
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
  return chatMarked.parse(escapeHtml(stripLatex(text)), { async: false }) as string;
}
