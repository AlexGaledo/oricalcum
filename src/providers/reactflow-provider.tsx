"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { ReactNode } from "react";

export function RFProvider({ children }: { children: ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
