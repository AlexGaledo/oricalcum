"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/shared/lib/cn";
import { uploadMedia } from "@/data/api/endpoints/storage.api";

interface ToolbarProps {
  editor: Editor | null;
  projectId?: string;
}

const HIGHLIGHT_COLORS = ["#fde68a", "#fca5a5", "#a7f3d0", "#bfdbfe", "#ddd6fe", "#fbcfe8"];
const TEXT_COLORS = ["#ffffff", "#10A37F", "#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444"];

export function EditorToolbar({ editor, projectId }: ToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const linkRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!linkOpen) return;
    linkInputRef.current?.focus();
    linkInputRef.current?.select();
    const onDown = (e: MouseEvent) => {
      if (!linkRef.current?.contains(e.target as Node)) setLinkOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLinkOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [linkOpen]);

  if (!editor) return null;

  const openLinkPopover = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "";
    setLinkValue(prev || "https://");
    setLinkOpen((v) => !v);
  };

  const applyLink = () => {
    const url = linkValue.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const handleImageUrl = () => {
    const url = window.prompt("Image URL", "https://");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageFile = async (file: File) => {
    // Upload to S3 and embed a durable media URL instead of bloating the node
    // body with a base64 data URL. Falls back to base64 if no workspace context.
    if (projectId) {
      try {
        const src = await uploadMedia(projectId, file, "uploded-node-media");
        editor.chain().focus().setImage({ src }).run();
        return;
      } catch (err) {
        console.error("Image upload failed, falling back to inline:", err);
      }
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src === "string") editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="docpanel-toolbar" onMouseDown={(e) => e.preventDefault()}>
      <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
        <b>B</b>
      </Btn>
      <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
        <i>I</i>
      </Btn>
      <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
        <span style={{ textDecoration: "underline" }}>U</span>
      </Btn>
      <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <span style={{ textDecoration: "line-through" }}>S</span>
      </Btn>

      <Divider />

      <Btn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        H1
      </Btn>
      <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        H2
      </Btn>
      <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        H3
      </Btn>

      <Divider />

      <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <BulletIcon />
      </Btn>
      <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
        <OrderedIcon />
      </Btn>
      <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
        <QuoteIcon />
      </Btn>
      <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
        {"</>"}
      </Btn>
      <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
        <code style={{ fontSize: 11 }}>{"`"}</code>
      </Btn>

      <Divider />

      <span className="docpanel-link-anchor" ref={linkRef}>
        <Btn active={editor.isActive("link")} onClick={openLinkPopover} title="Link">
          <LinkBtnIcon />
        </Btn>
        {linkOpen && (
          <div
            className="docpanel-link-popover"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={linkInputRef}
              type="url"
              className="docpanel-link-input"
              value={linkValue}
              placeholder="https://"
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button type="button" className="docpanel-link-btn" onClick={applyLink}>
              Apply
            </button>
            <button
              type="button"
              className="docpanel-link-btn docpanel-link-btn--ghost"
              onClick={removeLink}
            >
              Remove
            </button>
          </div>
        )}
      </span>

      <Popover
        button={
          <Btn active={editor.isActive("highlight")} title="Highlight">
            <HighlightIcon />
          </Btn>
        }
      >
        <div className="docpanel-swatches">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="docpanel-swatch"
              style={{ background: c }}
              onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
              title={c}
            />
          ))}
          <button
            type="button"
            className="docpanel-swatch docpanel-swatch--clear"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            title="Clear highlight"
          >
            ×
          </button>
        </div>
      </Popover>

      <Popover
        button={
          <Btn title="Text color">
            <ColorIcon />
          </Btn>
        }
      >
        <div className="docpanel-swatches">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="docpanel-swatch"
              style={{ background: c }}
              onClick={() => editor.chain().focus().setColor(c).run()}
              title={c}
            />
          ))}
          <button
            type="button"
            className="docpanel-swatch docpanel-swatch--clear"
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="Clear color"
          >
            ×
          </button>
        </div>
      </Popover>

      <Divider />

      <Btn onClick={handleImageUrl} title="Image from URL">
        <ImageIcon />
      </Btn>
      <Btn onClick={() => fileInput.current?.click()} title="Upload image">
        <UploadIcon />
      </Btn>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />

      <Divider />

      <Btn
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear formatting"
      >
        <ClearIcon />
      </Btn>
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={cn("docpanel-tbtn", active && "is-active")}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="docpanel-tdiv" aria-hidden />;
}

function Popover({ button, children }: { button: ReactNode; children: ReactNode }) {
  return (
    <span className="docpanel-popover">
      {button}
      <span className="docpanel-popover-menu">{children}</span>
    </span>
  );
}

const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 14,
  height: 14,
};

function BulletIcon() {
  return (
    <svg {...iconBase}>
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
      <path d="M9 6h11M9 12h11M9 18h11" />
    </svg>
  );
}
function OrderedIcon() {
  return (
    <svg {...iconBase}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 4v4M3 8h2M3 10h3v2H3v2h3M3 18a1 1 0 0 1 2 0c0 1-2 2-2 2h2" />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg {...iconBase}>
      <path d="M6 7v6h4V9H8a2 2 0 0 1 2-2M14 7v6h4V9h-2a2 2 0 0 1 2-2" />
    </svg>
  );
}
function LinkBtnIcon() {
  return (
    <svg {...iconBase}>
      <path d="M10 14a4 4 0 0 1 0-5.66l3-3a4 4 0 0 1 5.66 5.66l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 1 0 5.66l-3 3a4 4 0 0 1-5.66-5.66l1.5-1.5" />
    </svg>
  );
}
function HighlightIcon() {
  return (
    <svg {...iconBase}>
      <path d="M4 20h16" />
      <path d="M7 16l4-4 5 5-4 4H7v-5z" />
      <path d="M11 12l5-5a2 2 0 0 1 3 3l-5 5" />
    </svg>
  );
}
function ColorIcon() {
  return (
    <svg {...iconBase}>
      <path d="M6 18h12" />
      <path d="M8 14L12 4l4 10M9.5 11h5" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg {...iconBase}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M3 17l5-5 5 5 3-3 5 5" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg {...iconBase}>
      <path d="M12 4v12M7 9l5-5 5 5M4 20h16" />
    </svg>
  );
}
function ClearIcon() {
  return (
    <svg {...iconBase}>
      <path d="M4 7h13M9 7l-1 13M15 7l1 13M10 4h4l1 3H9z" />
    </svg>
  );
}
