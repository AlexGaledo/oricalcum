"use client";

import { Canvas, Minimap } from "@/features/canvas";
import { SpawnGhost } from "@/features/nodes";
import { EditorPanel } from "@/features/documents";
import { FileExplorer } from "@/features/files";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import {
  Topbar,
  Toolbar,
  StatusBar,
  ConnectBanner,
  OricalcumTweaks,
  VisibilityMenu,
} from "@/features/toolbar";

export default function WorkspacePage() {
  return (
    <>
      <LoadingScreen />
      <div className="app">
      <div className="reticles">
        <span className="reticle tl" />
        <span className="reticle tr" />
        <span className="reticle bl" />
        <span className="reticle br" />
      </div>

      <Canvas />
      <Topbar />
      <FileExplorer />
      <Toolbar />
      <ConnectBanner />
      <StatusBar />
      <Minimap />
      <SpawnGhost />
      <EditorPanel />
      <OricalcumTweaks />
      <VisibilityMenu />
    </div>
    </>
  );
}
