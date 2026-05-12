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
import { useEffect } from "react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, onEditorReady, placeholder }: RichEditorProps) {
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
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-doc" },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  return <EditorContent editor={editor} className="docpanel-editor" />;
}

export type { Editor };
