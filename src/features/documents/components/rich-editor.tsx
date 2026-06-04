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
import { looksLikeMarkdown, renderMarkdown } from "@/shared/lib/markdown";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, onEditorReady, placeholder }: RichEditorProps) {
  const initialContent = useMemo(() => {
    if (!value) return "";
    if (looksLikeMarkdown(value)) return renderMarkdown(value);
    return value;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
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
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-doc" },
      transformPastedText(text) {
        if (looksLikeMarkdown(text)) return renderMarkdown(text);
        return text;
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
      const content = looksLikeMarkdown(value) ? renderMarkdown(value) : (value || "");
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [value, editor]);

  return <EditorContent editor={editor} className="docpanel-editor" />;
}

export type { Editor };
