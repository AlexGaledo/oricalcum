import { marked } from "marked";

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
