import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";
import "./landing.css";

/**
 * Public landing page. Signed-in visitors get an "Open your workspace" CTA
 * (session is read client-side in EnterCta); everyone else is sent to sign in.
 * The old cinematic splash's auto-redirect is gone on purpose: the root URL
 * now has to explain the product before asking for an account.
 */
export const metadata: Metadata = {
  title: "Oricalcum — An Oracle for work, teams, and hobbies",
  description:
    "A canvas-first AI workspace: nodes, edges and rich documents on one canvas, with an assistant that builds the map with you and MCP tools under the hood.",
  openGraph: {
    title: "Oricalcum",
    description: "An Oracle for work, teams, and hobbies. A canvas-first AI workspace.",
    url: "/",
    siteName: "Oricalcum",
    type: "website",
    images: [{ url: "/landing/nodespace.png", width: 1280, height: 720, alt: "Oricalcum nodespace canvas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oricalcum",
    description: "An Oracle for work, teams, and hobbies. A canvas-first AI workspace.",
    images: ["/landing/nodespace.png"],
  },
};

export default function Home() {
  return <LandingPage />;
}
