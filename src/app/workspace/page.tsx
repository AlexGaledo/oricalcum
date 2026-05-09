"use client";

import { Canvas, Minimap } from "@/features/canvas";
import { SpawnGhost } from "@/features/nodes";
import { EditorPanel } from "@/features/documents";
import {
  Topbar,
  Toolbar,
  StatusBar,
  ConnectBanner,
  OricalcumTweaks,
} from "@/features/toolbar";

export default function WorkspacePage() {
  return (
    <div className="app">
      <div className="reticles">
        <span className="reticle tl" />
        <span className="reticle tr" />
        <span className="reticle bl" />
        <span className="reticle br" />
      </div>

      <Canvas />
      <Topbar />
      <Toolbar />
      <ConnectBanner />
      <StatusBar />
      <Minimap />
      <SpawnGhost />
      <EditorPanel />
      <OricalcumTweaks />
    </div>
  );
}
