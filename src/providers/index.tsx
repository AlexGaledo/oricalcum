"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { RFProvider } from "./reactflow-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RFProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </RFProvider>
  );
}
