"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { RFProvider } from "./reactflow-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RFProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </RFProvider>
    </AuthProvider>
  );
}
