"use client";

import { create } from "zustand";
import type { Camera, DragGesture, ToolMode, Viewport } from "@/shared/types";

export type ToolbarSide = "left" | "right" | "top" | "bottom";

interface CanvasStore {
  camera: Camera;
  tool: ToolMode;
  drag: DragGesture;
  mouse: { x: number; y: number };
  viewport: Viewport;
  shapeMenuOpen: boolean;
  themeOpen: boolean;
  tweaksOpen: boolean;
  openDocId: string | null;
  docExpanded: boolean;
  toolbarSide: ToolbarSide;
  setToolbarSide: (s: ToolbarSide) => void;
  toolbarPos: { x: number; y: number } | null;
  setToolbarPos: (p: { x: number; y: number } | null) => void;
  fileTreeOpen: boolean;
  setFileTreeOpen: (b: boolean | ((b: boolean) => boolean)) => void;
  setCamera: (cam: Camera | ((c: Camera) => Camera)) => void;
  setTool: (t: ToolMode | ((t: ToolMode) => ToolMode)) => void;
  setDrag: (d: DragGesture | ((d: DragGesture) => DragGesture)) => void;
  setMouse: (p: { x: number; y: number }) => void;
  setViewport: (v: Viewport) => void;
  setShapeMenuOpen: (b: boolean | ((b: boolean) => boolean)) => void;
  setThemeOpen: (b: boolean | ((b: boolean) => boolean)) => void;
  setTweaksOpen: (b: boolean | ((b: boolean) => boolean)) => void;
  setOpenDocId: (id: string | null) => void;
  setDocExpanded: (b: boolean) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  camera: { x: 0, y: 0, zoom: 1 },
  tool: "select",
  drag: null,
  mouse: { x: 0, y: 0 },
  viewport: {
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 720,
  },
  shapeMenuOpen: false,
  themeOpen: false,
  tweaksOpen: false,
  openDocId: null,
  docExpanded: false,
  toolbarSide: "top",
  setToolbarSide: (s) => set({ toolbarSide: s }),
  toolbarPos: null,
  setToolbarPos: (p) => set({ toolbarPos: p }),
  fileTreeOpen: false,
  setFileTreeOpen: (b) =>
    set((s) => ({
      fileTreeOpen: typeof b === "function" ? b(s.fileTreeOpen) : b,
    })),
  setCamera: (cam) =>
    set((s) => ({ camera: typeof cam === "function" ? cam(s.camera) : cam })),
  setTool: (t) =>
    set((s) => ({ tool: typeof t === "function" ? t(s.tool) : t })),
  setDrag: (d) =>
    set((s) => ({ drag: typeof d === "function" ? d(s.drag) : d })),
  setMouse: (p) => set({ mouse: p }),
  setViewport: (v) => set({ viewport: v }),
  setShapeMenuOpen: (b) =>
    set((s) => ({
      shapeMenuOpen: typeof b === "function" ? b(s.shapeMenuOpen) : b,
    })),
  setThemeOpen: (b) =>
    set((s) => ({ themeOpen: typeof b === "function" ? b(s.themeOpen) : b })),
  setTweaksOpen: (b) =>
    set((s) => ({ tweaksOpen: typeof b === "function" ? b(s.tweaksOpen) : b })),
  setOpenDocId: (id) => set({ openDocId: id, docExpanded: false }),
  setDocExpanded: (b) => set({ docExpanded: b }),
}));
