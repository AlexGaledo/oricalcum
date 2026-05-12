"use client";

import { useRef, type MouseEvent } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/shared/lib/cn";

const MIN_WIDTH = 40;

export function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const src = node.attrs.src as string;
  const alt = node.attrs.alt as string | undefined;
  const width = node.attrs.width as number | null;

  const onHandleDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = imgRef.current?.offsetWidth ?? 0;
    const maxW = wrapRef.current?.parentElement?.offsetWidth ?? 9999;

    const onMove = (ev: globalThis.MouseEvent) => {
      const dx = ev.clientX - startX;
      const next = Math.max(MIN_WIDTH, Math.min(maxW, startW + dx));
      if (imgRef.current) imgRef.current.style.width = `${next}px`;
    };
    const onUp = () => {
      const finalW = imgRef.current?.offsetWidth ?? startW;
      updateAttributes({ width: finalW });
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper
      as="span"
      ref={wrapRef}
      className={cn("ri-wrap", selected && "is-selected")}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt ?? ""}
        style={width ? { width: `${width}px` } : undefined}
        draggable={false}
      />
      <span
        className="ri-handle"
        onMouseDown={onHandleDown}
        contentEditable={false}
      />
    </NodeViewWrapper>
  );
}
