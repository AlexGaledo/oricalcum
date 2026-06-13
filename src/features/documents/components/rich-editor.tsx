"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { ResizableImage } from "./resizable-image-extension";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useMemo } from "react";
import {
  detectCodeLanguage,
  escapeCodeHtml,
  looksLikeMarkdown,
  renderMarkdown,
  tryPrettyPrintJson,
} from "@/shared/lib/markdown";

interface RichEditorProps {
  value: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
}

function codeBlockHtml(language: string, code: string): string {
  return `<pre><code class="language-${language}">${escapeCodeHtml(code)}</code></pre>`;
}

function prepareContent(raw: string): string {
  if (!raw) return "";
  const lang = detectCodeLanguage(raw);
  if (lang) {
    const code = lang === "json" ? tryPrettyPrintJson(raw) : raw;
    return codeBlockHtml(lang, code);
  }
  if (looksLikeMarkdown(raw)) return renderMarkdown(raw);
  return raw;
}

export function RichEditor({ value, onChange, onEditorReady, placeholder, readOnly }: RichEditorProps) {
  const initialContent = useMemo(() => prepareContent(value), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { enableTabIndentation: true },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: placeholder ?? "markdown / notes / spec / scratch ..." }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editable: !readOnly,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-doc" },
      transformPastedText(text) {
        if (looksLikeMarkdown(text)) return renderMarkdown(text);
        return text;
      },
      handlePaste(view, event) {
        if (readOnly) return false;
        if (view.state.selection.$from.parent.type.name === "codeBlock") return false;
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;
        const lang = detectCodeLanguage(text);
        if (!lang) return false;
        const code = lang === "json" ? tryPrettyPrintJson(text) : text;
        const tr = view.state.tr.replaceSelectionWith(
          view.state.schema.nodes.codeBlock.create(
            { language: lang },
            view.state.schema.text(code),
          ),
        );
        view.dispatch(tr);
        return true;
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(prepareContent(value), { emitUpdate: false });
    }
  }, [value, editor]);

  return <EditorContent editor={editor} className="docpanel-editor" />;
}

export type { Editor };
