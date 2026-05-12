import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "./resizable-image-view";

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = (el as HTMLElement).getAttribute("width");
          if (!w) return null;
          const n = parseInt(w, 10);
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return { width: attrs.width, style: `width: ${attrs.width}px` };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
