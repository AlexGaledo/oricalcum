"use client";

import { useCallback } from "react";
import { useNodeStore } from "@/features/nodes";
import { useEdgeStore } from "@/features/edges";
import { useCanvasStore } from "@/features/canvas";
import { useAiInputStore } from "../store/ai-input.store";

const SHAPES = ["rectangle", "circle", "hexagon", "diamond", "cloud", "document"] as const;

function splitPrompt(text: string): string[] {
  const segments = text
    .split(/[,.;，。；\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
  if (segments.length === 0 && text.trim().length > 0) segments.push(text.trim());
  return segments;
}

export function useAiSimulator() {
  const createNode = useNodeStore((s) => s.createNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const addEdge = useEdgeStore((s) => s.addEdge);
  const camera = useCanvasStore((s) => s.camera);
  const setProcessing = useAiInputStore((s) => s.setProcessing);
  const pushHistory = useAiInputStore((s) => s.pushHistory);

  const submit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;
      pushHistory(prompt.trim());
      setProcessing(true);

      await new Promise((r) => setTimeout(r, 600));

      const segments = splitPrompt(prompt);
      if (segments.length === 0) {
        setProcessing(false);
        return;
      }

      const viewW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const viewH = typeof window !== "undefined" ? window.innerHeight : 720;
      const centerX = viewW / 2 - camera.x;
      const centerY = viewH / 2 - camera.y;
      const cols = Math.min(segments.length, 3);
      const gapX = 240;
      const gapY = 140;
      const nodeIds: string[] = [];

      segments.forEach((text, i) => {
        const shape = SHAPES[i % SHAPES.length];
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = centerX + (col - (cols - 1) / 2) * gapX;
        const y = centerY + row * gapY - (Math.floor(segments.length / cols) * gapY) / 2;
        const id = createNode(shape, x, y, 1);
        updateNode(id, { title: text });
        nodeIds.push(id);
      });

      if (nodeIds.length > 1) {
        const ports = ["bottom", "right", "bottom", "left"] as const;
        for (let i = 1; i < nodeIds.length; i++) {
          const fromPort = ports[(i - 1) % ports.length];
          const toPort = i % 2 === 0 ? "top" : "left";
          addEdge(nodeIds[i - 1], nodeIds[i], fromPort, toPort);
        }
        if (nodeIds.length > 2) {
          const extra = Math.floor(Math.random() * (nodeIds.length - 1));
          const skip = Math.floor(Math.random() * (nodeIds.length - 2)) + 1;
          if (skip !== 1 || nodeIds.length > 3) {
            const fromIdx = Math.floor(Math.random() * (nodeIds.length - 1));
            const toIdx = fromIdx + 1 + Math.floor(Math.random() * (nodeIds.length - fromIdx - 1));
            if (toIdx < nodeIds.length) {
              addEdge(nodeIds[fromIdx], nodeIds[toIdx], "bottom", "top");
            }
          }
        }
      }

      setProcessing(false);
    },
    [createNode, updateNode, addEdge, camera, pushHistory, setProcessing],
  );

  return { submit };
}
