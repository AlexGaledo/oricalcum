import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Lora, Space_Grotesk, Caveat } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--next-font-inter",
  display: "swap",
});

const jbm = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--next-font-jbm",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--next-font-lora",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--next-font-grotesk",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--next-font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oricalcum.vercel.app"),
  title: "Oricalcum",
  description: "Visual systems canvas — nodes, edges, themes.",
  icons: { icon: "/oricalcum-logo.svg", apple: "/oricalcum-logo.svg" },
};

// Mobile-first viewport. Zoom stays enabled (accessibility); the canvas page
// manages its own pinch behavior. viewport-fit covers notched devices.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jbm.variable} ${lora.variable} ${grotesk.variable} ${caveat.variable}`}
    >
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
